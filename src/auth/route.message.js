import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getMessages,
  getUsersforSidebar,
  sendMessages,
} from "../controller/message.controller.js";

const messagerouter = express.Router();

messagerouter.get("/users", protectRoute, getUsersforSidebar);
messagerouter.get("/:id", protectRoute, getMessages);
messagerouter.post(
  "/sendmessage/:id",
  protectRoute,

  sendMessages
);

export default messagerouter;
