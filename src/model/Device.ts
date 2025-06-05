import mongoose from "mongoose";

interface IDevice extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  imei: string;
  totpSecret: string;
  isOnboarded: boolean;
  deviceName?: string;
}

const deviceSchema = new mongoose.Schema<IDevice>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imei: {
      type: String,
      required: true,
      unique: true,
    },
    totpSecret: {
      type: String,
      required: true,
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    deviceName: {
      type: String,
      default: "Device",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one device per user per IMEI
deviceSchema.index({ userId: 1, imei: 1 }, { unique: true });

export default mongoose.models.Device ||
  mongoose.model<IDevice>("Device", deviceSchema);
