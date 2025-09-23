import mongoose from "mongoose";
import bcrypt from "bcrypt";

const scanHistorySchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  categoryName: { type: String, default: "" },
  coinsEarned: { type: Number, required: true },
  scannedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    userId: { type: String, unique: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    profilePick: { type: String, default: "" },
    coinsEarned: { type: Number, default: 0 },
    dob: { type: String, default: "" },
    address: { type: String, default: "" },
    pinCode: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },

    accountNumber: { type: String, default: "" },
    accountHolderName: { type: String, default: "" },
    bankName: { type: String, default: "" },
    ifscCode: { type: String, default: "" },

    // 🚀 NEW: Status-based verification system
    panPhoto: { type: String, default: "" },
    panVerificationStatus: {
      type: String,
      enum: ["incomplete", "processing", "verified", "rejected"],
      default: "incomplete",
    },
    panRejectionReason: { type: String, default: "" }, // Reason if rejected

    aadharPhoto: { type: String, default: "" },
    aadharVerificationStatus: {
      type: String,
      enum: ["incomplete", "processing", "verified", "rejected"],
      default: "incomplete",
    },
    aadharRejectionReason: { type: String, default: "" },

    passbookPhoto: { type: String, default: "" },
    passbookVerificationStatus: {
      type: String,
      enum: ["incomplete", "processing", "verified", "rejected"],
      default: "incomplete",
    },
    passbookRejectionReason: { type: String, default: "" },

    kycStatus: {
      type: String,
      enum: ["incomplete", "pending", "approved", "rejected"],
      default: "incomplete",
    },
    kycRequestDate: { type: Date },
    kycApprovalDate: { type: Date },
    kycRejectionReason: { type: String, default: "" },
    isProfileComplete: { type: Boolean, default: false },

    // 🚀 UPDATED: Keep old array for backward compatibility
    productsQrScanned: [{ type: String }],

    // 🚀 NEW: Detailed scan history
    scanHistory: [scanHistorySchema],

    withdrawalHistory: [
      {
        withdrawalId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "WithdrawalRequest",
        },
        amount: Number,
        status: String, // approved / rejected / pending
        processedAt: Date,
      },
    ],
    // deletion flow fields
    isDeletionRequested: { type: Boolean, default: false },
    deletionDate: { type: Date, default: null },
  },
  { timestamps: true }
);

// 🚀 NEW: Method to check if profile is complete
userSchema.methods.checkProfileCompletion = function () {
  const requiredFields = [
    "fullName",
    "phone",
    "email",
    "dob",
    "address",
    "pinCode",
    "state",
    "country",
    "accountNumber",
    "accountHolderName",
    "bankName",
    "ifscCode",
  ];

  const requiredDocuments = ["panPhoto", "aadharPhoto", "passbookPhoto"];

  // Check if all required fields are filled
  const fieldsComplete = requiredFields.every(
    (field) => this[field] && this[field].toString().trim() !== ""
  );

  // Check if all documents are uploaded
  const documentsComplete = requiredDocuments.every(
    (doc) => this[doc] && this[doc].trim() !== ""
  );

  return fieldsComplete && documentsComplete;
};

// 🚀 NEW: Method to create KYC request
userSchema.methods.createKYCRequest = function () {
  console.log("create kyc req running");
  if (
    this.checkProfileCompletion() &&
    ["incomplete", "rejected"].includes(this.kycStatus)
  ) {
    this.kycStatus = "pending";
    this.kycRequestDate = new Date();
    this.isProfileComplete = true;

    // Reset rejection reasons
    this.panRejectionReason = "";
    this.aadharRejectionReason = "";
    this.passbookRejectionReason = "";
    this.kycRejectionReason = "";

    // Set all document statuses to processing
    this.panVerificationStatus = "processing";
    this.aadharVerificationStatus = "processing";
    this.passbookVerificationStatus = "processing";

    return true;
  }
  return false;
};

// 🚀 NEW: Method to record a scan
userSchema.methods.recordScan = function (
  productId,
  productName,
  categoryName,
  coinsEarned
) {
  // Add to detailed scan history
  this.scanHistory.push({
    productId,
    productName,
    categoryName: categoryName || "",
    coinsEarned,
    scannedAt: new Date(),
  });

  // Keep backward compatibility with old array
  if (!this.productsQrScanned.includes(productId)) {
    this.productsQrScanned.push(productId);
  }

  // Update total coins
  this.coinsEarned += coinsEarned;
};

// 🚀 NEW: Method to check if product already scanned
userSchema.methods.hasScannedProduct = function (productId) {
  return this.productsQrScanned.includes(productId);
};

// 🚀 NEW: Method to get recent scans
userSchema.methods.getRecentScans = function (limit = 10) {
  return this.scanHistory
    .sort((a, b) => new Date(b.scannedAt) - new Date(a.scannedAt))
    .slice(0, limit);
};

// Password hash middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
