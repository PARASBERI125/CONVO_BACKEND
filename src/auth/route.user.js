import express from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  userProfile,
  updateUser,
  forgotPassword,
  searchforusers,
} from "../controller/user.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

import { upload } from "../multer.js";
import { otphandler } from "../middleware/otpHandle.js";
import { otpverify } from "../middleware/otpVerify.js";
const router = express.Router();

router.post(
  "/user/register",

  upload.single("profilePic"),
  registerUser
);
router.post("/sendotp", otphandler);
router.post("/verifyotp", otpverify);
router.post("/user/login", loginUser);
router.post("/forgotpassword", forgotPassword);
router.get("/user/logout", logoutUser);

router.get("/user/profile", protectRoute, userProfile);
router.get("/listofusers", protectRoute, searchforusers);

router.patch(
  "/user/update",
  protectRoute,
  upload.single("profilePic"),
  updateUser
);

export default router;
