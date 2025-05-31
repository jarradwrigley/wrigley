// models/Order.ts
import mongoose, { Schema, Document } from "mongoose";

interface IPaymentDetails {
  cardHolder: string;
  cardNumber: string;
  cvv: string;
  expirationDate: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface IAddress {
  street?: string;
  fullAddress?: string;
  address?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  zip?: string;
}

interface IItem {
  productId: string;
  title: string;
  key: string;
  quantity: number;
  price: number;
  promo?: string;
  image?: string;
}

export interface IOrder extends Document {
  items: IItem[];
  billingAddress: IAddress;
  deliveryAddress: IAddress;
  paymentDetails: IPaymentDetails;
  subtotal: number;
  total: number;
  isGuestOrder: boolean;
  userEmail: string;
  userId?: string | null;
}

const AddressSchema = new Schema<IAddress>(
  {
    street: { type: String },
    fullAddress: { type: String, required: true },
    address: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String },
    zip: { type: String, required: true },
  },
  { versionKey: false, timestamps: true }
);

const ItemSchema = new Schema<IItem>(
  {
    productId: { type: String, required: true },
    title: { type: String },
    key: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    promo: { type: String },
    image: { type: String },
  },
  { versionKey: false, timestamps: true }
);

const PaymentDetailsSchema = new Schema<IPaymentDetails>(
  {
    cardHolder: { type: String, required: true },
    cardNumber: { type: String, required: true },
    cvv: { type: String, required: true },
    expirationDate: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { versionKey: false, timestamps: true }
);

const OrderSchema = new Schema<IOrder>(
  {
    items: { type: [ItemSchema], required: true },
    billingAddress: { type: AddressSchema, required: true },
    deliveryAddress: { type: AddressSchema, required: true },
    paymentDetails: { type: PaymentDetailsSchema, required: true },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    isGuestOrder: { type: Boolean, required: true },
    userEmail: { type: String, required: true, unique: false, index: true },
    userId: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
