import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";
import dayjs from "dayjs";
import cron from "node-cron";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Run every day at 2:00 AM
cron.schedule("0 2 * * *", async () => {
  try {
    const fifteenDaysAgo = dayjs().subtract(15, "day").toDate();

    // Get all resources with tag "messages"
    const { resources } = await cloudinary.search
      .expression("folder:message_images_convo")
      .max_results(500)
      .execute();

    for (const resource of resources) {
      const createdAt = new Date(resource.created_at);
      if (createdAt < fifteenDaysAgo) {
        await cloudinary.uploader.destroy(resource.public_id);
        console.log("Deleted:", resource.public_id);
      }
    }
  } catch (error) {
    console.error("Error deleting old images:", error);
  }
});

export default cloudinary;
