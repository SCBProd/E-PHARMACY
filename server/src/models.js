import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const userSchema = new Schema({
  name: { type: String, required: true, trim: true }, email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true }, passwordHash: { type: String, required: true },
  cart: [{ product: { type: Schema.Types.ObjectId, ref: 'Product' }, quantity: { type: Number, min: 1, default: 1 } }],
}, { timestamps: true });
const productSchema = new Schema({ sourceId: Number, seedDuplicate: { type: Boolean, default: false }, duplicateOf: String, photo: String, name: { type: String, required: true }, suppliers: String, stock: { type: Number, default: 0 }, price: { type: Number, required: true }, category: String, discount: Number, rating: { type: Number, min: 0, max: 5 }, description: String, medicinalUses: String, warnings: String }, { timestamps: true });
const storeSchema = new Schema({ name: String, address: String, city: String, phone: String, rating: { type: Number, min: 0, max: 5 }, status: { type: String, enum: ['OPEN', 'CLOSE'], default: 'OPEN' }, nearest: { type: Boolean, default: false } }, { timestamps: true });
const reviewSchema = new Schema({ name: String, testimonial: String, photo: String, product: { type: Schema.Types.ObjectId, ref: 'Product' }, rating: Number, createdAt: { type: Date, default: Date.now } });
const orderSchema = new Schema({ user: { type: Schema.Types.ObjectId, ref: 'User' }, name: String, email: String, phone: String, address: String, paymentMethod: { type: String, enum: ['Cash On Delivery', 'Bank'] }, products: [{ product: { type: Schema.Types.ObjectId, ref: 'Product' }, name: String, photo: String, unitPrice: Number, quantity: Number }], total: Number, status: { type: String, default: 'Pending' }, orderDate: { type: Date, default: Date.now } }, { timestamps: true });
const customerSchema = new Schema({ photo: String, name: String, email: String, spent: String, phone: String, address: String, register_date: String });
const supplierSchema = new Schema({ name: String, address: String, suppliers: String, date: String, amount: String, status: String });
const incomeSchema = new Schema({ name: String, amount: Number, type: String });
const suppliedOrderSchema = new Schema({ photo: String, name: String, address: String, products: String, price: Number, status: String, order_date: String }, { timestamps: false });

export const User = model('User', userSchema);
export const Product = model('Product', productSchema);
export const Store = model('Store', storeSchema);
export const Review = model('Review', reviewSchema);
export const Order = model('Order', orderSchema);
export const Customer = model('Customer', customerSchema);
export const Supplier = model('Supplier', supplierSchema);
export const IncomeExpense = model('IncomeExpense', incomeSchema);
export const SuppliedOrder = model('SuppliedOrder', suppliedOrderSchema);
