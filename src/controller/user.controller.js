import User from "../model/user.model.js";
import cloudinary from "../cloudinary.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export const searchforusers = async (req, res) => {
  try {
    const search = req.query.email;

    const listofusers = await User.find({
      email: { $regex: search, $options: "i" },
    }).select("-password");

    res.status(200).json({ listofusers });
  } catch (error) {
    console.log(error);
  }
};

export const registerUser = async (req, res) => {
  const { fullname, email, password } = req.body;
  try {
    const checkemail = await User.findOne({ email });
    if (checkemail) {
      return res.status(409).json({ message: "User already exists" });
    }
    if (!email) {
      return res.status(409).json({ message: "Email cannot be empty" });
    }
    let profilePicUrl = "";
    let publicid = "";
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "user_profiles_convo",
      });
      profilePicUrl = uploadResult.secure_url;
      publicid = uploadResult.public_id;
    }

    const user = await User.create({
      fullname: fullname,
      email: email,
      password: await bcrypt.hash(password, 10),
      profilePic: profilePicUrl,
      cloudinaryPublicId: publicid,
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("registerToken", token, {
      maxAge: 1000 * 60 * 60 * 24 * 1,
      httpOnly: true, //not accessible by javascript
      sameSite: "none",
      secure: true,
    });
    return res
      .status(200)
      .json({ message: "User registered successfully", user });
  } catch (error) {
    console.log("Registration error", error);
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(409).json({ message: "User not found" });
    }
    const ispasswordcorrect = await bcrypt.compare(password, user.password);

    if (!ispasswordcorrect) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    res.cookie("loginToken", token, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true, //not accessible by javascript
      sameSite: "none",
      secure: true,
    });

    return res.status(200).json({ message: "Login successful", ...user._doc });
  } catch (error) {
    console.log("Login error", error);
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("loginToken");
  res.clearCookie("registerToken");
  return res.status(200).json({ message: "Logout successful" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const check = await User.findOne({ email: email });
    if (!check) {
      return res.status(401).json({ message: "Email not registered" });
    }
    const namePart = check.fullname.split(" ")[0]; // First name only
    const randomPart = Math.random().toString(36).slice(-6);
    const newPassword = `${namePart}@${randomPart}`;
    const hashpassword = await bcrypt.hash(newPassword, 10);
    check.password = hashpassword;
    await check.save();

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.BREVO_LOGIN, // your Brevo sender email
        pass: process.env.BREVO_PASSWORD, // your Brevo SMTP key
      },
    });

    const mailOptions = {
      from: `"CONVO" <${process.env.BREVO_EMAIL}>`,
      to: email,
      subject: "NEW PASSWORD",
      text: `Your new password from now on is - ${newPassword}`,
    };
    try {
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
    } catch (error) {
      console.error("Email sending error:", error);
    }

    return res
      .status(200)
      .json({ message: "New password sent to your email address" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to send new password" });
  }
};

export const userProfile = async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in fetching user profile", error);
  }
};

export const updateUser = async (req, res) => {
  const { fullname } = req.body;
  let updatedata = {};
  try {
    if (fullname) {
      updatedata.fullname = fullname;
    }
    const user = await User.findById(req.user._id);
    if (req.file) {
      await cloudinary.uploader.destroy(user.cloudinaryPublicId);
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "user_profiles_convo",
      });
      updatedata.profilePic = uploadResult.secure_url;
      updatedata.cloudinaryPublicId = uploadResult.public_id;
    }
    if (Object.keys(updatedata).length === 0) {
      return res.status(400).json({ message: "No data to update" });
    }
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updatedata, {
      new: true,
    });
    return res
      .status(200)
      .json({ message: "User updated successfully", updatedUser });
  } catch (err) {
    console.log("Error in updating user", err);
    return res.status(500).json({ message: "Error updating the user" });
  }
};
