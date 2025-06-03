import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPost extends Document {
  author: Types.ObjectId;
  content: string;
  media?: string[]; // URLs or paths
  tags?: string[];
  likes: Types.ObjectId[];
  comments: Types.ObjectId[];
  visibility: "public" | "private" | "friends-only";
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    media: [{ type: String }],
    tags: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    visibility: {
      type: String,
      enum: ["public", "private", "friends-only"],
      default: "public",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Post ||
  mongoose.model<IPost>("Post", PostSchema);
