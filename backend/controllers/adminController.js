import jwt from "jsonwebtoken";
import Category from "../models/Category.js";
import cloudinary from "../helpers/cloudinary/cloudinary.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import WithdrawalRequest from "../models/WithdrawalRequest.js";
import { isValidNonNegativeNumber } from "../helpers/utils/helperFunctions/index.js";

export const login = (req, res) => {
  const { emailOrPhone, password } = req.body;
  const isEmailOrPhoneValid =
    emailOrPhone === process.env.ADMIN_EMAIL ||
    emailOrPhone === process.env.ADMIN_PHONE;

  if (isEmailOrPhoneValid && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ user: emailOrPhone }, process.env.JWT_SECRET, {
      expiresIn: "16h",
    });

    return res.status(200).json({ token });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
};

export const verifyToken = (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const checkProductId = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Find product by productId
    const product = await Product.findOne({ productId: productId.trim() })
      .populate("category", "categoryName")
      .populate("qrCodes.scannedBy", "userId fullName");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product ID "${productId}" not found`,
      });
    }
    // Return product information
    res.status(200).json({
      success: true,
      message: `Product ID "${productId}" is valid`,
      data: {
        productId: product.productId,
        productName: product.productName,
        category: product.category?.categoryName || "N/A",
        coinReward: product.coinReward,
        qrStatus: product.qrStatus,
        createdAt: product.createdAt,
        scannedAt: product.scannedAt,
        scannedBy: product.scannedBy
          ? {
              userId: product.scannedBy.userId,
              name: product.scannedBy.fullName,
            }
          : null,
        isActive: product.qrStatus === "active",
        isScanned: product.qrStatus === "scanned",
        isDisabled: product.qrStatus === "disabled",
      },
    });
  } catch (error) {
    console.error("Check Product ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;

    if (!categoryName || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Category name and image are required",
      });
    }

    const imageUrl = req.file.path; // 👈 Cloudinary secure URL

    const newCategory = await Category.create({
      categoryName,
      categoryImage: imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    console.error("Add Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the category by ID
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Extract public ID from Cloudinary image URL
    const imageUrl = category.categoryImage;
    const segments = imageUrl.split("/");
    const publicIdWithExtension = segments[segments.length - 1];
    const publicId = `kkd/categories/${publicIdWithExtension.split(".")[0]}`;

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Delete category from database
    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// 🚀 NEW: Get All Users (Latest First)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -__v") // Exclude password and version key
      .sort({ createdAt: -1 }); // Latest first
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getPendingKYCRequests = async (req, res) => {
  try {
    const pendingUsers = await User.find({ kycStatus: "pending" })
      .select("-password -__v")
      .sort({ kycRequestDate: -1 });

    res.status(200).json({
      success: true,
      message: "Pending KYC requests fetched successfully",
      data: pendingUsers,
    });
  } catch (error) {
    console.error("Get Pending KYC Requests Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const processKYCRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be either 'approve' or 'reject'",
      });
    }

    if (action === "reject" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required when rejecting KYC",
      });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.kycStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "KYC request is not in pending status",
      });
    }

    if (action === "approve") {
      user.kycStatus = "approved";
      user.kycApprovalDate = new Date();
      user.kycRejectionReason = "";

      // Approve all documents
      user.panVerificationStatus = "verified";
      user.aadharVerificationStatus = "verified";
      user.passbookVerificationStatus = "verified";

      // Clear rejection reasons
      user.panRejectionReason = "";
      user.aadharRejectionReason = "";
      user.passbookRejectionReason = "";
    } else {
      user.kycStatus = "incomplete";
      user.kycRejectionReason = rejectionReason;
      user.kycApprovalDate = null;
      user.kycRequestDate = null;

      //removing kyc documents
      user.aadharPhoto = "";
      user.passbookPhoto = "";
      user.panPhoto = "";

      // Reset document statuses to incomplete
      user.panVerificationStatus = "incomplete";
      user.aadharVerificationStatus = "incomplete";
      user.passbookVerificationStatus = "incomplete";
      user.isProfileComplete = false;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `KYC request ${action}d successfully`,
      data: {
        userId: user.userId,
        kycStatus: user.kycStatus,
        kycApprovalDate: user.kycApprovalDate,
        kycRejectionReason: user.kycRejectionReason,
      },
    });
  } catch (error) {
    console.error("Process KYC Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getKYCStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: "$kycStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = {
      incomplete: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      message: "KYC statistics fetched successfully",
      data: formattedStats,
    });
  } catch (error) {
    console.error("Get KYC Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Verify PAN Document
export const verifyPanDocument = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'verified' or 'rejected'",
      });
    }

    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required when rejecting document",
      });
    }

    const updateData = {
      panVerificationStatus: status,
    };

    if (status === "rejected") {
      updateData.panRejectionReason = rejectionReason;
    } else {
      updateData.panRejectionReason = "";
    }

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true }
    ).select("-password -__v");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `PAN document ${status} successfully`,
      data: {
        userId: updatedUser.userId,
        panVerificationStatus: updatedUser.panVerificationStatus,
        panRejectionReason: updatedUser.panRejectionReason,
      },
    });
  } catch (error) {
    console.error("Verify PAN Document Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Verify Aadhar Document
export const verifyAadharDocument = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'verified' or 'rejected'",
      });
    }

    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required when rejecting document",
      });
    }

    const updateData = {
      aadharVerificationStatus: status,
    };

    if (status === "rejected") {
      updateData.aadharRejectionReason = rejectionReason;
    } else {
      updateData.aadharRejectionReason = "";
    }

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true }
    ).select("-password -__v");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Aadhar document ${status} successfully`,
      data: {
        userId: updatedUser.userId,
        aadharVerificationStatus: updatedUser.aadharVerificationStatus,
        aadharRejectionReason: updatedUser.aadharRejectionReason,
      },
    });
  } catch (error) {
    console.error("Verify Aadhar Document Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Verify Passbook Document
export const verifyPassbookDocument = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'verified' or 'rejected'",
      });
    }

    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required when rejecting document",
      });
    }

    const updateData = {
      passbookVerificationStatus: status,
    };

    if (status === "rejected") {
      updateData.passbookRejectionReason = rejectionReason;
    } else {
      updateData.passbookRejectionReason = "";
    }

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true }
    ).select("-password -__v");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Passbook document ${status} successfully`,
      data: {
        userId: updatedUser.userId,
        passbookVerificationStatus: updatedUser.passbookVerificationStatus,
        passbookRejectionReason: updatedUser.passbookRejectionReason,
      },
    });
  } catch (error) {
    console.error("Verify Passbook Document Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get Users by Verification Status
export const getUsersByVerificationStatus = async (req, res) => {
  try {
    const { documentType, status } = req.query;

    if (!documentType || !status) {
      return res.status(400).json({
        success: false,
        message: "Document type and status are required",
      });
    }

    if (!["pan", "aadhar", "passbook"].includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: "Document type must be 'pan', 'aadhar', or 'passbook'",
      });
    }

    if (
      !["incomplete", "processing", "verified", "rejected"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be 'incomplete', 'processing', 'verified', or 'rejected'",
      });
    }

    const filterField = `${documentType}VerificationStatus`;
    const filter = { [filterField]: status };

    const users = await User.find(filter)
      .select("-password -__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: `Users with ${documentType} status '${status}' fetched successfully`,
      data: users,
    });
  } catch (error) {
    console.error("Get Users by Verification Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// 🚀 NEW: Get Transaction History (QR Scan History)
export const getTransactionHistory = async (req, res) => {
  try {
    const { limit = 20, page = 1, startDate, endDate, userId } = req.query;

    // Build match conditions
    const matchConditions = {
      scanHistory: { $exists: true, $not: { $size: 0 } },
    };

    // Filter by specific user if provided
    if (userId) {
      matchConditions.userId = userId;
    }

    // Build aggregation pipeline
    const pipeline = [
      { $match: matchConditions },
      { $unwind: "$scanHistory" },
      {
        $project: {
          userId: 1,
          fullName: 1,
          phone: 1,
          email: 1,
          scanData: "$scanHistory",
        },
      },
    ];

    // Add date filtering if provided
    if (startDate || endDate) {
      const dateMatch = {};
      if (startDate) {
        dateMatch["scanData.scannedAt"] = { $gte: new Date(startDate) };
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        if (dateMatch["scanData.scannedAt"]) {
          dateMatch["scanData.scannedAt"].$lte = endDateTime;
        } else {
          dateMatch["scanData.scannedAt"] = { $lte: endDateTime };
        }
      }
      pipeline.push({ $match: dateMatch });
    }

    // Sort by scan date (most recent first)
    pipeline.push({ $sort: { "scanData.scannedAt": -1 } });

    // Get total count for pagination
    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await User.aggregate(totalPipeline);
    const totalTransactions = totalResult[0]?.total || 0;

    // Add pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);
    pipeline.push({ $skip: skip }, { $limit: Number.parseInt(limit) });

    // Execute aggregation
    const results = await User.aggregate(pipeline);

    // Format the results
    const transactions = results.map((result) => ({
      userId: result.userId,
      userName: result.fullName,
      contact: result.phone,
      email: result.email,
      productId: result.scanData.productId,
      productName: result.scanData.productName,
      categoryName: result.scanData.categoryName || "N/A",
      scannedAt: result.scanData.scannedAt,
      coinsEarned: result.scanData.coinsEarned,
      scanId: result.scanData._id,
    }));

    res.status(200).json({
      success: true,
      message: "Transaction history fetched successfully",
      data: transactions,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalTransactions / Number.parseInt(limit)),
        totalTransactions,
        hasMore: skip + transactions.length < totalTransactions,
        limit: Number.parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get Transaction History Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// 🚀 NEW: Get Dashboard Statistics (Enhanced)
export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, kycStats, scanStats, productStats, pendingWithdrawals] =
      await Promise.all([
        User.countDocuments(),
        User.aggregate([
          {
            $group: {
              _id: "$kycStatus",
              count: { $sum: 1 },
            },
          },
        ]),
        User.aggregate([
          {
            $project: {
              scanCount: { $size: { $ifNull: ["$scanHistory", []] } },
              totalCoins: "$coinsEarned",
            },
          },
          {
            $group: {
              _id: null,
              totalScans: { $sum: "$scanCount" },
              totalCoinsDistributed: { $sum: "$totalCoins" },
            },
          },
        ]),
        Product.aggregate([
          {
            $group: {
              _id: "$qrStatus",
              count: { $sum: 1 },
            },
          },
        ]),
        WithdrawalRequest.countDocuments({ status: "pending" }),
      ]);

    const formattedKycStats = {
      incomplete: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    kycStats.forEach((stat) => {
      formattedKycStats[stat._id] = stat.count;
    });

    const formattedProductStats = {
      active: 0,
      scanned: 0,
      disabled: 0,
    };

    productStats.forEach((stat) => {
      formattedProductStats[stat._id] = stat.count;
    });

    const dashboardData = {
      totalUsers,
      kycStats: formattedKycStats,
      totalScans: scanStats[0]?.totalScans || 0,
      totalCoinsDistributed: scanStats[0]?.totalCoinsDistributed || 0,
      productStats: formattedProductStats,
      withdrawalRequests: pendingWithdrawals || 0,
    };

    res.status(200).json({
      success: true,
      message: "Dashboard statistics fetched successfully",
      data: dashboardData,
    });
  } catch (error) {
    console.error("Get Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//withdrawal req api controllers

// // GET all withdrawal requests (admin)
export const getAllWithdrawalRequests = async (req, res) => {
  try {
    const requests = await WithdrawalRequest.find()
      .sort({ createdAt: -1 })
      .populate("user", "fullName phone profilePick");
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching requests" });
  }
};

export const updateWithdrawalRequestStatus = async (req, res) => {
  try {
    const { id } = req.params; // request ID
    const { status } = req.body; // expected: "approved" or "rejected"

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await WithdrawalRequest.findById(id).populate("user");

    if (!request) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This request has already been processed" });
    }

    // Update request status
    request.status = status;
    request.processedAt = new Date();
    await request.save();

    // If approved, deduct amount from user's coins
    if (status === "approved") {
      // request.user.coinsEarned -= request.amount;
      // 👇 Add to user's withdrawal history
      request.user.withdrawalHistory.push({
        withdrawalId: request._id,
        amount: request.amount,
        status: "approved",
        processedAt: new Date(),
      });
      await request.user.save();
    }

    if (status === "rejected") {
      // ✅ Refund coins back to user
      request.user.coinsEarned += request.amount;

      request.user.withdrawalHistory.push({
        withdrawalId: request._id,
        amount: request.amount,
        status: "rejected",
        processedAt: new Date(),
      });
      await request.user.save();
    }

    return res.status(200).json({
      success: true,
      message: `Withdrawal request ${status}`,
      data: request,
    });
  } catch (err) {
    console.error("Error updating withdrawal request status:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// // GET requests for a specific user
// export const getUserWithdrawalRequests = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const requests = await WithdrawalRequest.find({ user: userId }).sort({
//       createdAt: -1,
//     });
//     res.status(200).json(requests);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching user's requests" });
//   }
// };

export const updateUserCoin = async (req, res) => {
  try {
    const { id } = req.params;
    const { coinsEarned } = req.body;
    console.log("frontend received data: ", coinsEarned);
    if (!id || coinsEarned === undefined || coinsEarned === null) {
      return res.status(404).json({
        message: "please provide the required info",
      });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    const isValidCoin = isValidNonNegativeNumber(coinsEarned);
    if (!isValidCoin) {
      return res
        .status(400)
        .json({ message: "please provide valid coin amount" });
    }
    console.log("coines aened:", coinsEarned);
    user.coinsEarned = coinsEarned;
    user.save();
    return res.status(200).json({
      success: true,
      message: "coins updated Successfully",
    });
  } catch (error) {
    console.error("Error updating user coins", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkgiftCode = async (req, res) => {
  try {
    const { giftCode } = req.body;
    let product = await Product.findOne({ "qrCodes.qrCode": giftCode });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }
    const matchedQrs = product.qrCodes.filter((qr) => qr.qrCode === giftCode);
    let matchedQr = matchedQrs[0];

    return res.status(200).json({
      success: true,
      message: "qr data fetched successfully",
      data: {
        productId: product.productName,
        qrCreatedAt: matchedQr.createdAt,
        qrStatus: matchedQr.qrStatus,
        scannedBy: matchedQr.scannedBy,
        scannedAt: matchedQr.scannedAt,
        coin: product.coinReward,
        category: product.category,
        description: product.description,
        productImage: product.productImage,
        qrCodeImage: matchedQr.qrCodeImage,
      },
    });
  } catch (error) {
    console.error("Check Product ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
