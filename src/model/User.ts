import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  //   userId: string;
  firstName: string;
  lastName: string;
  username: string;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  profilePic?: string;
  role?: string;
  gender?: "male" | "female" | "other";
  dob?: Date;
  address?: {
    fullAddress?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    zip?: string;
  };
  bio?: string;
  location?: string;
  website?: string;
  devices: {
    deviceId: string;
    deviceName?: string;
  }[];
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  posts?: Types.ObjectId[];
  preferences?: {
    privacy?: boolean;
    language?: string;
    theme?: "light" | "dark";
    notifications?: boolean;
    newMessages?: boolean;
    blog?: boolean;
    postsOrCommentsliked?: boolean;
    commentsOnPosts?: boolean;
    abandonedCart?: boolean;
    makesPurchase?: boolean;
    rsvpConfirmationEmail?: boolean;
    reminderBeforeEventStarts?: boolean;
    confirmationEmailWithTickets?: boolean;
    eventIsUpdated?: boolean;
    eventCancelationEmail?: boolean;
    remindersAndUpdates?: boolean;
    confirmationsAndStatusChange?: boolean;
    paymentNotifications?: boolean;
    invoiceIssued?: boolean;
    priceQuoteIsAccepted?: boolean;
  };
}

const AddressSchema = new Schema(
  {
    fullAddress: { type: String },
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String },
    zip: { type: String },
  },
  { _id: false }
);

const PreferencesSchema = new Schema(
  {
    privacy: { type: Boolean, default: false },
    language: { type: String, default: "en" },
    theme: { type: String, enum: ["light", "dark"], default: "light" },
    notifications: { type: Boolean, default: true },
    newMessages: { type: Boolean, default: true },
    blog: { type: Boolean, default: true },
    postsOrCommentsliked: { type: Boolean, default: true },
    commentsOnPosts: { type: Boolean, default: true },
    abandonedCart: { type: Boolean, default: true },
    makesPurchase: { type: Boolean, default: true },
    rsvpConfirmationEmail: { type: Boolean, default: true },
    reminderBeforeEventStarts: { type: Boolean, default: true },
    confirmationEmailWithTickets: { type: Boolean, default: true },
    eventIsUpdated: { type: Boolean, default: true },
    eventCancelationEmail: { type: Boolean, default: true },
    remindersAndUpdates: { type: Boolean, default: true },
    confirmationsAndStatusChange: { type: Boolean, default: true },
    paymentNotifications: { type: Boolean, default: true },
    invoiceIssued: { type: Boolean, default: true },
    priceQuoteIsAccepted: { type: Boolean, default: true },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    // userId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fullName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "superadmin"],
    },
    phone: { type: String },
    profilePic: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    dob: { type: Date },
    address: { type: AddressSchema },
    bio: { type: String },
    location: { type: String },
    website: { type: String },
    devices: [
      {
        deviceId: { type: String, required: true },
        deviceName: String,
      },
    ],
    followers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    following: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    preferences: { type: PreferencesSchema },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  try {
    // Update fullName if firstName or lastName is modified
    if (this.isModified("firstName") || this.isModified("lastName")) {
      this.fullName = `${this.firstName} ${this.lastName}`;
    }

    // Hash password if it's modified
    if (this.isModified("password")) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }

    next();
  } catch (error: any) {
    console.error("Error in pre-save middleware:", error);
    next(error);
  }
});



export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
