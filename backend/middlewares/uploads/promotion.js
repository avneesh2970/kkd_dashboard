import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../helpers/cloudinary/cloudinary.js";

// Create Cloudinary storage engine for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "kkd/promotions", // 👈 your Cloudinary folder name
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
    transformation: [{ quality: "auto" }], // simple auto-optimize
  },
});

// Multer middleware with basic security
const uploadPromotion = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export default uploadPromotion;
