// importing mongoose
import mongoose from "mongoose";

// user schema for login system
const userSchema = new mongoose.Schema(
  {
    // user name
    name: String,
    email: {
      type: String,
      unique: true,
    },
    // encrypted password
    password: String,
    // role based login
    role: {
      type: String,
      enum: ["client", "worker", "admin"],
      default: "client",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);