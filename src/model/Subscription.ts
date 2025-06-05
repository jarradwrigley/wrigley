import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface ISubscription extends Document {
  //   userId: string;
  user: Types.ObjectId;
  device: string;
  deviceName: string;
  imei: string;
  phone: string;
  email: string;
  subscriptionType: string;
  subscriptionPrice: number;
  subscriptionCards: string[];
  queuePosition?: string;
  startDate?: Date;
  endDate?: Date;
  status: string;
}


const SubscriptionSchema = new Schema<ISubscription>(
  {
    // userId: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    imei: { type: String, required: true }, // A unique identifier for the device (e.g., UUID or device token)
    deviceName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    subscriptionType: { type: String, required: true }, // Optional: e.g., "premium", "basic"
    subscriptionPrice: { type: Number }, 
    subscriptionCards: { type: [String], required: true }, // Optional: e.g., "premium", "basic"
    queuePosition: { type: String },
    startDate: { type: Date, },
    endDate: { type: Date, },
    status: {
      type: String,
      enum: ["pending", "active", "queued", "expired"],
      default: "pending",
    },
  },
  { timestamps: true }
);

SubscriptionSchema.pre("save", async function (next) {


  next();
});

export default mongoose.models.Subscription ||
  mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
