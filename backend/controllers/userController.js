import User from "../models/User.js";
import { customAlphabet } from "nanoid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import WithdrawalRequest from "../models/WithdrawalRequest.js";

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 16);

export const userSignup = async (req, res) => {
  try {
    const { fullName, phone, email, password } = req.body;

    if (!fullName || !phone || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email or Phone already registered" });
    }

    let user;
    let saved = false;

    while (!saved) {
      try {
        user = new User({
          fullName,
          phone,
          email,
          password,
          userId: nanoid(),
        });

        await user.save();
        saved = true;
      } catch (err) {
        if (err.code === 11000 && err.keyPattern && err.keyPattern.userId) {
          console.warn("Duplicate userId generated, retrying...");
        } else {
          throw err; // some other error
        }
      }
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          userId: user.userId,
          fullName: user.fullName,
          phone: user.phone,
          email: user.email,
          coinsEarned: user.coinsEarned,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Phone and password are required",
      });
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // If user requested deletion, cancel it
    if (user.isDeletionRequested) {
      user.isDeletionRequested = false;
      user.deletionDate = null;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId }).select(
      "-password -__v"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User profile fetched",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;

    const restrictedFields = [
      // User identity (never changeable)
      "userId",
      "email",
      "phone",
      "password",

      // System managed fields
      "coinsEarned",
      "productsQrScanned",
      "createdAt",
      "updatedAt",
      "__v",

      // 🚀 Document photos (use dedicated endpoints)
      "panPhoto",
      "aadharPhoto",
      // "passbookPhoto",

      // Document verification (admin only)
      "panVerificationStatus",
      "aadharVerificationStatus",
      "passbookVerificationStatus",
      "panRejectionReason",
      "aadharRejectionReason",
      "passbookRejectionReason",

      // KYC system (system managed)
      "kycStatus",
      "kycRequestDate",
      "kycApprovalDate",
      "kycRejectionReason",
      "isProfileComplete",
    ];

    restrictedFields.forEach((field) => {
      console.log(updateData, field);
      if (updateData[field]) {
        delete updateData[field];
      }
    });

    if (req.files?.profilePick?.[0]) {
      updateData.profilePick = req.files.profilePick[0].path;
    }

    if (updateData.pinCode && !/^\d{6}$/.test(updateData.pinCode)) {
      return res.status(400).json({
        success: false,
        message: "Pin code must be 6 digits",
      });
    }

    if (
      updateData.ifscCode &&
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(updateData.ifscCode)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid IFSC code format",
      });
    }

    if (updateData.accountNumber && updateData.accountNumber.length < 9) {
      return res.status(400).json({
        success: false,
        message: "Account number must be at least 9 digits",
      });
    }

    if (updateData.dob && updateData.dob.trim() !== "") {
      const dobRegex =
        /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$|^\d{2}-\d{2}-\d{4}$/;
      if (!dobRegex.test(updateData.dob)) {
        return res.status(400).json({
          success: false,
          message:
            "Date of birth must be in valid format (YYYY-MM-DD, DD/MM/YYYY, or DD-MM-YYYY)",
        });
      }
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user data
    Object.keys(updateData).forEach((key) => {
      user[key] = updateData[key];
    });

    // ✅ Handle passbook photo if uploaded
    if (req.files?.passbookPhoto?.[0]) {
      user.passbookPhoto = req.files.passbookPhoto[0].path;
      user.passbookVerificationStatus = "processing";
      user.passbookRejectionReason = "";
    }

    // 🚀 NEW: Check if profile is complete and create KYC request
    let kycRequestCreated = false;
    if (user.checkProfileCompletion() && user.kycStatus === "incomplete") {
      kycRequestCreated = user.createKYCRequest();
    }

    await user.save();

    const responseData = {
      success: true,
      message: kycRequestCreated
        ? "Profile updated successfully! KYC verification request has been submitted."
        : "Profile updated successfully",
      data: user,
      kycRequestCreated,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Update Profile Error:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// change password for future implementation
export const updatePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Find user with password
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.findOneAndUpdate(
      { userId },
      { $set: { password: hashedNewPassword } }
    );

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// 🚀 UPDATED: Upload PAN Photo with Status
export const uploadPanPhoto = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PAN photo is required",
      });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.panPhoto = req.file.path;
    user.panVerificationStatus = "processing";
    user.panRejectionReason = "";

    // Check if profile is complete and create KYC request
    let kycRequestCreated = false;
    if (user.checkProfileCompletion() && user.kycStatus === "incomplete") {
      kycRequestCreated = user.createKYCRequest();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: kycRequestCreated
        ? "PAN photo uploaded successfully. KYC verification request has been submitted."
        : "PAN photo uploaded successfully. Verification in progress.",
      data: {
        panPhoto: user.panPhoto,
        panVerificationStatus: user.panVerificationStatus,
        kycStatus: user.kycStatus,
      },
      kycRequestCreated,
    });
  } catch (error) {
    console.error("Upload PAN Photo Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// 🚀 UPDATED: Upload Aadhar Photo with Status
export const uploadAadharPhoto = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Aadhar photo is required",
      });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.aadharPhoto = req.file.path;
    user.aadharVerificationStatus = "processing";
    user.aadharRejectionReason = "";

    let kycRequestCreated = false;
    if (user.checkProfileCompletion() && user.kycStatus === "incomplete") {
      kycRequestCreated = user.createKYCRequest();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: kycRequestCreated
        ? "Aadhar photo uploaded successfully. KYC verification request has been submitted."
        : "Aadhar photo uploaded successfully. Verification in progress.",
      data: {
        aadharPhoto: user.aadharPhoto,
        aadharVerificationStatus: user.aadharVerificationStatus,
        kycStatus: user.kycStatus,
      },
      kycRequestCreated,
    });
  } catch (error) {
    console.error("Upload Aadhar Photo Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// 🚀 UPDATED: Upload Passbook Photo with Status
export const uploadPassbookPhoto = async (req, res) => {
  console.log("uplaod passbook running");
  try {
    const userId = req.user.userId;
    const { accountNumber, accountHolderName, bankName, ifscCode } = req.body;
    const passbookPhoto = req.file;
    const requiredFields = {
      accountNumber,
      accountHolderName,
      bankName,
      ifscCode,
      passbookPhoto,
    };

    for (const field in requiredFields) {
      if (!requiredFields[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    if (ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid IFSC code format",
      });
    }

    if (accountNumber && accountNumber.length < 9) {
      return res.status(400).json({
        success: false,
        message: "Account number must be at least 9 digits",
      });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.passbookPhoto = req.file.path;
    user.passbookVerificationStatus = "processing";
    user.passbookRejectionReason = "";
    user.accountNumber = accountNumber;
    user.accountHolderName = accountHolderName;
    user.bankName = bankName;
    user.ifscCode = ifscCode;

    let kycRequestCreated = false;
    if (user.checkProfileCompletion() && user.kycStatus === "incomplete") {
      kycRequestCreated = user.createKYCRequest();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: kycRequestCreated
        ? "Passbook photo and other details uploaded successfully. KYC verification request has been submitted."
        : "Passbook photo and other details uploaded successfully. Verification in progress.",
      data: {
        passbookPhoto: user.passbookPhoto,
        passbookVerificationStatus: user.passbookVerificationStatus,
        kycStatus: user.kycStatus,
      },
      kycRequestCreated,
    });
  } catch (error) {
    console.error("Upload Passbook Photo Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// CREATE a withdrawal request
export const createWithdrawalRequest = async (req, res) => {
  try {
    const { amount } = req.body;
    const { userId } = req.user;

    const amountNumber = Number(amount);

    if (!userId || amount == null) {
      return res
        .status(400)
        .json({ message: "User ID and amount are required" });
    }

    if (isNaN(amountNumber) || amountNumber <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be a valid number greater than 0" });
    }

    const user = await User.findOne({ userId });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.kycStatus !== "approved") {
      return res.status(400).json({
        message:
          "KYC must be approved before withdrawal. complete your profile first",
      });
    }

    if (user.coinsEarned < amountNumber) {
      return res.status(400).json({ message: "Not enough coins to withdraw" });
    }

    user.coinsEarned -= amountNumber
    await user.save();

    const newRequest = new WithdrawalRequest({
      user: user._id,
      amount: amountNumber,
    });

    await newRequest.save();

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted",
      data: newRequest,
    });
  } catch (err) {
    console.error("Error creating withdrawal request:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPendingWithdrawals = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId }).select("_id");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const pendingWithdrawals = await WithdrawalRequest.find({
      user: user._id,
      status: "pending",
    });
    return res.status(200).json({
      success: true,
      message: "Pending withdrawal requests fetched successfully",
      data: pendingWithdrawals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//delete user web request
export const deleteUserReq = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Phone and password are required",
      });
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (user.isDeletionRequested) {
      return res.status(400).json({
        success: false,
        message:
          "already requested to delete account. Login to Reactivate account before deletion",
      });
    }

    user.isDeletionRequested = true;
    user.deletionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 days

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Your account will be deleted after 7 days unless you log in again.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//delete user app request
export const deleteAppUserReq = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isDeletionRequested) {
      return res.status(400).json({
        success: false,
        message:
          "already requested to delete account. Login to Reactivate account before deletion",
      });
    }

    user.isDeletionRequested = true;
    user.deletionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 days

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Your account will be deleted after 7 days unless you log in again.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
