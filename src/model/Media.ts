import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMedia extends Document {
  url: string;
  uploader: Types.ObjectId;
  type: "image" | "video" | "audio";
  post?: Types.ObjectId;
}

const MediaSchema = new Schema<IMedia>(
  {
    url: { type: String, required: true },
    uploader: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["image", "video", "audio"], required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
  },
  { timestamps: true }
);

export default mongoose.models.Media ||
  mongoose.model<IMedia>("Media", MediaSchema);
