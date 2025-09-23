// middleware/uploads/uploadProfileAndPassbook.js

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../helpers/cloudinary/cloudinary.js";

// Profile image storage
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "kkd/profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
    transformation: [{ quality: "auto" }],
  },
});

// Passbook photo storage
const passbookStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "kkd/documents/passbook",
    allowed_formats: ["jpg", "jpeg", "png", "pdf", "webp", "avif"],
    transformation: [{ quality: "auto" }],
  },
});

// Dynamic storage resolver based on fieldname
const storageResolver = (req, file, cb) => {
  if (file.fieldname === "profilePick") {
    cb(null, profileStorage);
  } else if (file.fieldname === "passbookPhoto") {
    cb(null, passbookStorage);
  } else {
    cb(new Error("Invalid upload field"), null);
  }
};

// Create a custom storage engine for dynamic storage
const dynamicStorage = {
  _handleFile(req, file, cb) {
    storageResolver(req, file, (err, storage) => {
      if (err) return cb(err);
      storage._handleFile(req, file, cb);
    });
  },
  _removeFile(req, file, cb) {
    storageResolver(req, file, (err, storage) => {
      if (err) return cb(err);
      storage._removeFile(req, file, cb);
    });
  },
};

// Final multer instance
const uploadProfileAndPassbook = multer({
  storage: dynamicStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

export default uploadProfileAndPassbook;
