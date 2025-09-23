import mongoose from "mongoose";

const offerProductSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: {
      type: String,
    },
    coinReward: {
      type: Number,
      required: true,
      min: 0,
    },
    productImage: {
      type: String,
      required: true,
    },
    // QR Management
    qrCodeImage: {
      type: String,
      required: true,
    },
    qrStatus: {
      type: String,
      enum: ["active", "scanned", "disabled"],
      default: "active",
    },
    // Tracking
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    scannedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Offer = mongoose.model("Offer", offerProductSchema);
export default Offer;
