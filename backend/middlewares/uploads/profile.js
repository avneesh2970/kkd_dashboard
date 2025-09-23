import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../helpers/cloudinary/cloudinary.js";

// Create Cloudinary storage engine for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "kkd/profiles", // 👈 your Cloudinary folder name
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
    transformation: [{ quality: "auto" }], // optional: auto-optimize
  },
});

// Simple Multer middleware
const uploadProfile = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 5MB limit
  },
});

export default uploadProfile;
