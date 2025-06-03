import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface ISubscription extends Document {
  //   userId: string;
  user: Types.ObjectId;
  deviceId: string;
  plan: string;
  startDate: Date;
  endDate: Date;
  status: string;
  
}


const SubscriptionSchema = new Schema<ISubscription>(
  {
    // userId: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deviceId: { type: String, required: true }, // A unique identifier for the device (e.g., UUID or device token)
    plan: { type: String, required: true }, // Optional: e.g., "premium", "basic"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "queued", "expired"],
      default: "queued",
    },
  },
  { timestamps: true }
);

SubscriptionSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   // this.password = await bcrypt.hash(this.password, 10);
//   try {
//     // Generate salt and hash password
//     const salt = await bcrypt.genSalt(12);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error: any) {
//     console.error("Error hasing password");
//     next(error);
//   }

//   if (this.isModified("firstName") || this.isModified("lastName")) {
//     this.fullName = `${this.firstName} ${this.lastName}`;
//   }

  next();
});

export default mongoose.models.Subscription ||
  mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
