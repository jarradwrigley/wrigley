import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILike extends Document {
  user: Types.ObjectId;
  targetId: Types.ObjectId;
  targetType: "Post" | "Comment";
}

const LikeSchema = new Schema<ILike>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetType: { type: String, enum: ["Post", "Comment"], required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Like ||
  mongoose.model<ILike>("Like", LikeSchema);
