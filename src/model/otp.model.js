import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  otp: {
    required: true,
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: true,
  },
  createdAt: { type: Date, default: Date.now, expires: 420 }, // auto delete in 7 mins
});

const OTPMODEL = mongoose.model("OTP", otpSchema);
export default OTPMODEL;
