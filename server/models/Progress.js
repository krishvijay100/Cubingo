import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    data: { type: Object, required: true },
    updatedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

export const Progress = mongoose.model("Progress", progressSchema);