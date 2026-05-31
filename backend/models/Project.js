import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);