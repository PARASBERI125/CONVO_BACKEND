import OTPMODEL from "../model/otp.model.js";

export const otpverify = async (req, res) => {
  try {
    let { email, otp } = req.body;

    console.log("EMAIL from req:", email);
    console.log("OTP from req:", otp, typeof otp);

    const otpfind = await OTPMODEL.findOne({ email });

    console.log("DB OTP:", otpfind?.otp, typeof otpfind?.otp);

    if (!otpfind) {
      return res.status(404).json({ message: "No OTP found for this email" });
    }

    if (otpfind.otp !== otp) {
      return res.status(409).json({ message: "Invalid OTP" });
    }

    return res.status(200).json({ genuinemail: true });
  } catch (error) {
    console.error("OTP Verify Error:", error);
    return res.status(500).json({ message: "Verification failed" });
  }
};
