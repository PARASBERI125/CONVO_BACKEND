import User from "../model/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.loginToken || req.cookies.registerToken;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }
    const checkUser = jwt.verify(token, process.env.JWT_SECRET); //returns the original id(payload) after checking if it was signed by my jwt secret
    if (!checkUser) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const user = await User.findById(checkUser.id).select("-password"); //do not return password
    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Error in middleware protectRoute", error);
  }
};
