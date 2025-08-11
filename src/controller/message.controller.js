import User from "../model/user.model.js";
import Message from "../model/message.model.js";
import { v2 as cloudinary } from "cloudinary";
import { getReceiverSocketId, io } from "../socket.js";

export const getUsersforSidebar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "contacts",
      "fullname email profilePic"
    );
    console.log("Contacts found:", user.contacts);
    return res.status(200).json(user.contacts);
  } catch (error) {
    console.log("Error fetching the contacts", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error fetching the messages", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const sendMessages = async (req, res) => {
  const { text, image } = req.body;
  try {
    let imageUrl = "";
    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "message_images_convo",
      });
      imageUrl = uploadResult.secure_url;
    }

    const receiverId = req.params.id;
    const myId = req.user._id;
    const messages = await Message.create({
      text: text,
      image: imageUrl,
      senderId: myId,
      receiverId: receiverId,
    });

    const receiversocketid = getReceiverSocketId(receiverId);
    if (receiversocketid) {
      io.to(receiversocketid).emit("NewMessage", messages);
      io.to(receiversocketid).emit("ContactsUpdated");
    }
    const senderSocketId = getReceiverSocketId(myId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("contactsUpdated");
    }
    await User.findByIdAndUpdate(myId, {
      $addToSet: { contacts: receiverId },
    });
    await User.findByIdAndUpdate(receiverId, {
      $addToSet: { contacts: myId },
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error sending the messages", error);
    return res.status(500).json({ message: "Server error" });
  }
};
