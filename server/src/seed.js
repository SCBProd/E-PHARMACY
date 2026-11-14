import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import mongoose from 'mongoose';
import { Product, Store, Review, Customer, Supplier, IncomeExpense, SuppliedOrder } from './models.js';
import products from '../data/products.json' with { type: 'json' };
import pharmacies from '../data/pharmacies.json' with { type: 'json' };
import nearest from '../data/nearest_pharmacies.json' with { type: 'json' };
import reviews from '../data/reviews.json' with { type: 'json' };
import suppliers from '../data/suppliers.json' with { type: 'json' };
import finance from '../data/Income-Expenses.json' with { type: 'json' };

async function loadPrivateOrExample(filename) {
  for (const location of ['../private-data/', '../data/']) {
    try {
      const file = new URL(`${location}${filename}`, import.meta.url);
      return JSON.parse(await readFile(file, 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  throw new Error(`Missing seed dataset: ${filename}`);
}

const [customers, orders] = await Promise.all([
  loadPrivateOrExample('customers.json'),
  loadPrivateOrExample('orders.json'),
]);

if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI before seeding.');
await mongoose.connect(process.env.MONGODB_URI);
if (!(await Product.exists())) await Product.insertMany(products.map((x) => ({ ...x, sourceId: Number(x.id), price: Number(x.price) })));
const nearestKeys = new Set(nearest.map((x) => `${x.name}|${x.address}`));
if (!(await Store.exists())) await Store.insertMany(pharmacies.map((x, i) => ({ ...x, rating: Number(x.rating), nearest: nearestKeys.has(`${x.name}|${x.address}`) || i < 6, status: i % 4 === 2 ? 'CLOSE' : 'OPEN' })));
if (!(await Review.exists())) await Review.insertMany(reviews);
if (!(await Customer.exists())) await Customer.insertMany(customers);
if (!(await Supplier.exists())) await Supplier.insertMany(suppliers);
if (!(await IncomeExpense.exists())) await IncomeExpense.insertMany(finance.map((x) => ({ ...x, amount: Number(String(x.amount).replace(/[^\d.-]/g, '')) })));
if (!(await SuppliedOrder.exists())) await SuppliedOrder.insertMany(orders.map((x) => ({ ...x, price: Number(String(x.price).replace(/[^\d.-]/g, '')) })));
console.log(`Imported ${products.length} products, ${pharmacies.length} pharmacies, ${reviews.length} reviews, ${orders.length} supplied orders, and administrative seed records.`);
await mongoose.disconnect();
