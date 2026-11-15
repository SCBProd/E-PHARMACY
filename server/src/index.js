import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, Product, Store, Review, Order } from './models.js';
import seed from '../data/products.json' with { type: 'json' };
import pharmacies from '../data/pharmacies.json' with { type: 'json' };
import nearest from '../data/nearest_pharmacies.json' with { type: 'json' };
import reviews from '../data/reviews.json' with { type: 'json' };

const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
const money = (n) => Number(n || 0);
const jwtSecret = () => process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'dev-only-change-this-secret');
const tokenFor = (user) => jwt.sign({ id: user._id }, jwtSecret(), { expiresIn: '7d' });
const mongoReady = () => mongoose.connection.readyState === 1;
let mongoInitialization;
const fallbackStores = pharmacies.map((store, i) => ({ ...store, id: String(i), rating: money(store.rating), nearest: nearest.some((item) => item.name === store.name && item.address === store.address) || i < 6, status: i % 4 === 2 ? 'CLOSE' : 'OPEN' }));
const emailPattern = /^\S+@\S+\.\S+$/;
const phonePattern = /^\+?[\d\s().-]{7,20}$/;
const strongPasswordPattern = /^(?=.*[^A-Za-z0-9]).{8,}$/;

async function ensureSeed() {
  if (!mongoose.connection.readyState) return;
  const batchSize = Math.floor(seed.length / 2);
  const existing = await Product.find({ sourceId: { $gte: 0, $lt: batchSize * 2 } }).lean();
  const byLegacyId = new Map();
  existing.forEach((item) => {
    const legacyId = Number(item.sourceId) % batchSize;
    if (!byLegacyId.has(legacyId)) byLegacyId.set(legacyId, []);
    byLegacyId.get(legacyId).push(item);
  });
  const assigned = new Map();
  const claimed = new Set();
  const matches = (item, p) => item.name === p.name && item.photo === p.photo && item.suppliers === p.suppliers && money(item.stock) === money(p.stock) && money(item.price) === money(p.price) && item.category === p.category;
  seed.forEach((p, index) => {
    const legacyId = index < batchSize ? Number(p.id) : Number(p.id) - batchSize;
    const match = (byLegacyId.get(legacyId) || []).find((item) => !claimed.has(String(item._id)) && matches(item, p));
    if (match) { claimed.add(String(match._id)); assigned.set(index, match); }
  });
  for (let legacyId = 0; legacyId < batchSize; legacyId += 1) {
    const missing = [legacyId, legacyId + batchSize].filter((index) => !assigned.has(index));
    const remaining = (byLegacyId.get(legacyId) || []).filter((item) => !claimed.has(String(item._id)));
    missing.forEach((index, i) => { if (remaining[i]) { assigned.set(index, remaining[i]); claimed.add(String(remaining[i]._id)); } });
  }
  const fields = (p) => ({ sourceId: Number(p.id), duplicateOf: p.duplicateOf || undefined, photo: p.photo, name: p.name, suppliers: p.suppliers, stock: money(p.stock), price: money(p.price), category: p.category });
  const operations = seed.map((p, index) => assigned.has(index)
    ? { updateOne: { filter: { _id: assigned.get(index)._id }, update: { $set: fields(p) } } }
    : { insertOne: { document: fields(p) } });
  if (operations.length) await Product.bulkWrite(operations);
  const seededProducts = await Product.find({ sourceId: { $gte: 0, $lt: seed.length } }).select('_id sourceId').sort({ createdAt: 1, _id: 1 }).lean();
  const canonicalIds = new Set();
  const duplicateUpdates = seededProducts.map((item) => {
    const id = Number(item.sourceId);
    const duplicate = canonicalIds.has(id);
    canonicalIds.add(id);
    return { updateOne: { filter: { _id: item._id }, update: { $set: { seedDuplicate: duplicate } } } };
  });
  if (duplicateUpdates.length) await Product.bulkWrite(duplicateUpdates);
  if (!(await Store.exists())) {
    const n = new Set(nearest.map((x) => `${x.name}|${x.address}`));
    await Store.insertMany(pharmacies.map((s, i) => ({ ...s, rating: money(s.rating), nearest: n.has(`${s.name}|${s.address}`) || i < 6, status: i % 4 === 2 ? 'CLOSE' : 'OPEN' })));
  }
  if (!(await Review.exists())) await Review.insertMany(reviews);
}

async function initializeMongo() {
  if (mongoReady()) return true;
  if (!process.env.MONGODB_URI) return false;
  if (!mongoInitialization) {
    mongoInitialization = mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
      .then(async () => {
        await ensureSeed();
        console.log('MongoDB connected; seed data ready.');
        return true;
      })
      .catch((error) => {
        console.error('MongoDB connection failed:', error.message);
        mongoInitialization = undefined;
        return false;
      });
  }
  return mongoInitialization;
}

app.use(async (_req, _res, next) => {
  await initializeMongo();
  next();
});

async function auth(req, res, next) {
  if (!mongoReady()) return res.status(503).json({ message: 'Authentication and cart require a configured MongoDB connection.' });
  const secret = jwtSecret();
  if (!secret) return res.status(503).json({ message: 'JWT_SECRET is not configured on the server.' });
  const value = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!value) return res.status(401).json({ message: 'Please log in to continue.' });
  try { const payload = jwt.verify(value, secret); req.user = await User.findById(payload.id); if (!req.user) return res.status(401).json({ message: 'Session expired. Please log in again.' }); next(); }
  catch { return res.status(401).json({ message: 'Session expired. Please log in again.' }); }
}

app.get('/api/health', (_req, res) => {
  const connected = mongoReady();
  res.status(connected ? 200 : 503).json({ ok: connected, database: connected ? 'connected' : 'disconnected', databaseConfigured: Boolean(process.env.MONGODB_URI), authConfigured: Boolean(jwtSecret()) });
});
app.post('/api/user/register', async (req, res, next) => {
  if (!mongoReady()) return res.status(503).json({ message: 'Registration requires a configured MongoDB connection.' });
  if (!jwtSecret()) return res.status(503).json({ message: 'JWT_SECRET is not configured on the server.' });
  try {
    const { name, email, phone, password } = req.body;
    if (!name?.trim() || name.trim().length < 2 || name.trim().length > 80 || !emailPattern.test(email || '') || !phonePattern.test(phone || '') || !strongPasswordPattern.test(password || '')) return res.status(400).json({ message: 'Enter a valid name, email, phone number and a password of at least 8 characters with a special character.' });
    if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), phone, passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: tokenFor(user), user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) { next(e); }
});
app.post('/api/user/login', async (req, res, next) => {
  if (!mongoReady()) return res.status(503).json({ message: 'Login requires a configured MongoDB connection.' });
  if (!jwtSecret()) return res.status(503).json({ message: 'JWT_SECRET is not configured on the server.' });
  try { const email = String(req.body.email || '').toLowerCase(); const password = String(req.body.password || ''); if (!emailPattern.test(email) || !password) return res.status(400).json({ message: 'Enter a valid email address and password.' }); const user = await User.findOne({ email }); if (!user || !await bcrypt.compare(password, user.passwordHash)) return res.status(401).json({ message: 'Email or password is incorrect.' }); res.json({ token: tokenFor(user), user: { id: user.id, name: user.name, email: user.email } }); } catch (e) { next(e); }
});
app.get('/api/user/logout', auth, (_req, res) => res.json({ message: 'Logged out.' }));
app.get('/api/user/user-info', auth, (req, res) => res.json({ id: req.user.id, name: req.user.name, email: req.user.email }));

app.get('/api/products', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1), limit = Math.min(24, Math.max(1, Number(req.query.limit) || 12));
    if (!mongoReady()) {
      const q = String(req.query.q || '').toLowerCase();
      const discount = Number(req.query.discount) || 0;
      const filtered = seed.filter((product) => !product.duplicateOf && (!q || product.name.toLowerCase().includes(q)) && (!req.query.category || req.query.category === 'All categories' || product.category === req.query.category) && (!discount || Number(product.discount || 0) >= discount));
      const total = filtered.length;
      return res.json({ items: filtered.slice((page - 1) * limit, page * limit), page, limit, total, totalPages: Math.ceil(total / limit) });
    }
    const filter = { seedDuplicate: { $ne: true }, duplicateOf: { $exists: false } };
    if (req.query.category && req.query.category !== 'All categories') filter.category = req.query.category;
    if (req.query.q) filter.name = { $regex: String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (req.query.discount) filter.discount = { $gte: Number(req.query.discount) };
    const [items, total] = await Promise.all([Product.find(filter).sort({ sourceId: 1 }).skip((page - 1) * limit).limit(limit).lean(), Product.countDocuments(filter)]);
    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (e) { next(e); }
});
app.get('/api/products/:id', async (req, res, next) => { try { if (!mongoReady()) { const item = seed.find((product) => String(product.id) === req.params.id && !product.duplicateOf); return item ? res.json(item) : res.status(404).json({ message: 'Product not found.' }); } const item = mongoose.isValidObjectId(req.params.id) ? await Product.findById(req.params.id).lean() : await Product.findOne({ sourceId: req.params.id, seedDuplicate: { $ne: true }, duplicateOf: { $exists: false } }).lean(); if (!item) return res.status(404).json({ message: 'Product not found.' }); const rating = item.rating ?? (await Review.aggregate([{ $match: { product: item._id } }, { $group: { _id: null, average: { $avg: '$rating' } } }]))[0]?.average ?? null; res.json({ ...item, rating }); } catch (e) { next(e); } });
app.get('/api/products/:id/reviews', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1), limit = Math.min(24, Math.max(1, Number(req.query.limit) || 4));
    if (!mongoReady()) return res.json({ items: [], page, limit, total: 0, totalPages: 1, rating: null });
    const key = String(req.params.id);
    const product = mongoose.isValidObjectId(key) ? await Product.findById(key).select('_id') : await Product.findOne({ sourceId: Number(key), seedDuplicate: { $ne: true }, duplicateOf: { $exists: false } }).select('_id');
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    const filter = { product: product._id };
    const [items, total, ratings] = await Promise.all([
      Review.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Review.countDocuments(filter),
      Review.aggregate([{ $match: filter }, { $group: { _id: null, average: { $avg: '$rating' } } }]),
    ]);
    res.json({ items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)), rating: ratings[0]?.average ?? null });
  } catch (e) { next(e); }
});
app.get('/api/stores', async (_req, res, next) => { try { res.json(mongoReady() ? await Store.find().sort({ name: 1 }).lean() : fallbackStores); } catch (e) { next(e); } });
app.get('/api/stores/nearest', async (_req, res, next) => { try { if (mongoReady()) return res.json(await Store.aggregate([{ $match: { nearest: true } }, { $sample: { size: 6 } }])); const shuffled = fallbackStores.filter((store) => store.nearest).sort(() => Math.random() - 0.5); res.json(shuffled.slice(0, 6)); } catch (e) { next(e); } });
app.get('/api/stores/:id', async (req, res, next) => { try { if (!mongoReady()) { const item = fallbackStores.find((store) => store.id === req.params.id); return item ? res.json(item) : res.status(404).json({ message: 'Pharmacy not found.' }); } const item = await Store.findById(req.params.id); if (!item) return res.status(404).json({ message: 'Pharmacy not found.' }); res.json(item); } catch (e) { next(e); } });
app.get('/api/customer-reviews', async (_req, res, next) => { try { res.json(mongoReady() ? await Review.find().sort({ createdAt: -1 }).lean() : reviews); } catch (e) { next(e); } });
app.get('/api/promo-banners', (_req, res) => res.json([{ title: 'Huge Sale', discount: 70 }, { title: 'Secure delivery', discount: 100 }, { title: 'Off', discount: 35 }]));

app.get('/api/cart', auth, async (req, res, next) => { try { await req.user.populate('cart.product'); res.json(req.user.cart.map((x) => ({ product: x.product, quantity: x.quantity }))); } catch (e) { next(e); } });
app.post('/api/cart', auth, async (req, res, next) => { try { const key = String(req.body.productId); const product = mongoose.isValidObjectId(key) ? await Product.findById(key) : await Product.findOne({ sourceId: Number(key), seedDuplicate: { $ne: true }, duplicateOf: { $exists: false } }); if (!product) return res.status(404).json({ message: 'Product not found.' }); const line = req.user.cart.find((x) => String(x.product) === String(product.id)); const quantity = Math.max(1, Math.min(99, Number(req.body.quantity) || 1)); if (line) line.quantity = Math.min(99, line.quantity + quantity); else req.user.cart.push({ product: product.id, quantity }); await req.user.save(); await req.user.populate('cart.product'); res.json(req.user.cart); } catch (e) { next(e); } });
app.put('/api/cart/update', auth, async (req, res, next) => { try { const { productId, quantity } = req.body; const count = Number(quantity); if (!productId || !Number.isInteger(count) || count < 0 || count > 99) return res.status(400).json({ message: 'Choose a valid cart quantity.' }); const key = String(productId); const product = mongoose.isValidObjectId(key) ? await Product.findById(key) : await Product.findOne({ sourceId: Number(key), seedDuplicate: { $ne: true }, duplicateOf: { $exists: false } }); if (!product) return res.status(404).json({ message: 'Product not found.' }); const line = req.user.cart.find((x) => String(x.product) === String(product.id)); if (!line) return res.status(404).json({ message: 'Cart item not found.' }); if (count < 1) req.user.cart.pull({ _id: line._id }); else line.quantity = count; await req.user.save(); await req.user.populate('cart.product'); res.json(req.user.cart); } catch (e) { next(e); } });
app.delete('/api/cart/:productId', auth, async (req, res, next) => { try { const key = String(req.params.productId); const product = mongoose.isValidObjectId(key) ? await Product.findById(key) : await Product.findOne({ sourceId: Number(key), seedDuplicate: { $ne: true }, duplicateOf: { $exists: false } }); if (product) req.user.cart.pull({ product: product.id }); await req.user.save(); res.json({ message: 'Item removed.' }); } catch (e) { next(e); } });
app.post('/api/cart/checkout', auth, async (req, res, next) => { try { const { name, email, phone, address, paymentMethod } = req.body; const cleanName = String(name || '').trim(), cleanEmail = String(email || '').trim().toLowerCase(), cleanPhone = String(phone || '').trim(), cleanAddress = String(address || '').trim(); if (cleanName.length < 2 || cleanName.length > 80 || !emailPattern.test(cleanEmail) || !phonePattern.test(cleanPhone) || cleanAddress.length < 5 || cleanAddress.length > 300 || !['Cash On Delivery', 'Bank'].includes(paymentMethod)) return res.status(400).json({ message: 'Enter valid shipping details and select a payment method.' }); await req.user.populate('cart.product'); if (!req.user.cart.length) return res.status(400).json({ message: 'Your cart is empty.' }); const products = req.user.cart.map((x) => ({ product: x.product.id, name: x.product.name, photo: x.product.photo, unitPrice: x.product.price, quantity: x.quantity })); const order = await Order.create({ user: req.user.id, name: cleanName, email: cleanEmail, phone: cleanPhone, address: cleanAddress, paymentMethod, products, total: products.reduce((s, x) => s + x.unitPrice * x.quantity, 0) }); req.user.cart = []; await req.user.save(); res.status(201).json(order); } catch (e) { next(e); } });

app.use((err, _req, res, _next) => { console.error(err); res.status(err.status || 500).json({ message: err.status ? err.message : 'Something went wrong. Please try again.' }); });

export default app;

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`E-Pharmacy API listening on ${PORT}`);
    void initializeMongo();
  });
}
