import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
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
    description: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
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
    qrCode:{
      type:String,
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

const Product = mongoose.model("Product", productSchema);
export default Product;
