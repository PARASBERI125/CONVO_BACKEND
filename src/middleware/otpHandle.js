import OTPMODEL from "../model/otp.model.js";
import User from "../model/user.model.js";
import nodemailer from "nodemailer";
export const otphandler = async (req, res) => {
  const { email } = req.body;
  try {
    const checkifexists = await User.findOne({ email: email });
    if (checkifexists) {
      return res
        .status(401)
        .json({ message: "Email already exists, please login" });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.BREVO_LOGIN, // your Brevo sender email
        pass: process.env.BREVO_PASSWORD, // your Brevo SMTP key
      },
    });

    const otpnum = Math.floor(10000 + Math.random() * 90000);
    await OTPMODEL.findOneAndUpdate(
      { email: email },
      { otp: otpnum, createdAt: Date.now() },
      { upsert: true }
    );

    const mailOptions = {
      from: `"CONVO" <${process.env.BREVO_EMAIL}>`,
      to: email,
      subject: "OTP VERIFICATION",
      text: `Your OTP for verification is - ${otpnum}`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ otpsent: true });
  } catch (error) {
    console.log("Mail OTP", error);

    return res
      .status(500)
      .json({ message: "OTP could not be sent", otpsent: false });
  }
};
