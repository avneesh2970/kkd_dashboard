import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../helpers/cloudinary/cloudinary.js";

// PAN Photo Upload Configuration
const panStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "kkd/documents/pan",
    allowed_formats: ["jpg", "jpeg", "png", "pdf", "webp", "avif"],
    transformation: [{ quality: "auto" }],
  },
});

// Aadhar Photo Upload Configuration
const aadharStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "kkd/documents/aadhar",
    allowed_formats: ["jpg", "jpeg", "png", "pdf", "webp", "avif"],
    transformation: [{ quality: "auto" }],
  },
});

// Passbook Photo Upload Configuration
const passbookStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "kkd/documents/passbook",
    allowed_formats: ["jpg", "jpeg", "png", "pdf", "webp", "avif"],
    transformation: [{ quality: "auto" }],
  },
});

// Simple Multer instances with basic security
export const uploadPan = multer({
  storage: panStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for documents
});

export const uploadAadhar = multer({
  storage: aadharStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for documents
});

export const uploadPassbook = multer({
  storage: passbookStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for documents
});
