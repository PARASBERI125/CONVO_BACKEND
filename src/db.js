import mongoose from "mongoose";

const connectDb = async (url) => {
  try {
    await mongoose.connect(url);
    console.log("Connected successfully to database");
  } catch (error) {
    console.log("Error connecting the database", error);
  }
};
export default connectDb;
