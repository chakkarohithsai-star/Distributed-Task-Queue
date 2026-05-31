// importing mongoose package
import mongoose from "mongoose";

// function for database connection
export const connectDB = async () => {
  try {
    // connect mongodb using url from .env file
    await mongoose.connect(process.env.MONGO_URI);

    // success message
    console.log("MongoDB Connected");
  } catch (error) {
    // show error if db connection fails
    console.log(error);
  }
};