import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import cloudinary from "../../helpers/cloudinary/cloudinary.js"

// Create Cloudinary storage engine for product images
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "kkd/products", // 👈 Cloudinary folder for product images
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
    transformation: [{ quality: "auto" }],
  },
})

// Multer middleware for product images
const uploadProduct = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

export default uploadProduct
