import express from "express";
import "dotenv/config";
import connectDb from "./db.js";
import cors from "cors";
import router from "./auth/route.user.js";
import cookieParser from "cookie-parser";
import messagerouter from "./auth/route.message.js";
import path from "path";
import { app, server } from "./socket.js";

app.use(express.json({ limit: "50mb" }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use("/api/auth", router);
app.use("/api/message", messagerouter);

const port = process.env.PORT || 3000;
const __dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  connectDb(process.env.MONGODB_URL);
});
