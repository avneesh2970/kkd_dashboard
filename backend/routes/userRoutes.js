import express from "express";
import {
  getUser,
  updateProfile,
  userLogin,
  userSignup,
  updatePassword,
  uploadPanPhoto,
  uploadAadharPhoto,
  uploadPassbookPhoto,
  createWithdrawalRequest,
  getPendingWithdrawals,
  deleteUserReq,
  deleteAppUserReq
} from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/userAuthMiddleware.js";
import { getAllCategories } from "../controllers/adminController.js";
import uploadProfile from "../middlewares/uploads/profile.js";
import {
  uploadPan,
  uploadAadhar,
  uploadPassbook,
} from "../middlewares/uploads/documents.js";
import { getAllPromotions } from "../controllers/promotionController.js";
import { getFeaturedProducts, getUserProductById, getUserProducts, getUserProductsByCategory, scanProductQR } from "../controllers/productController.js";
import { getUserOfferProducts } from "../controllers/offerController.js";
import uploadProfileAndPassbook from "../middlewares/uploads/passAndProfile.js";

const userRouter = express.Router();

// Authentication routes
userRouter.post("/signup", userSignup);
userRouter.post("/login", userLogin);

// Protected routes
userRouter.get("/get-user", authenticateToken, getUser);
userRouter.get("/get-categories", authenticateToken, getAllCategories);
userRouter.get("/get-promotions", authenticateToken, getAllPromotions);
userRouter.get("/get-products", authenticateToken, getUserProducts);
userRouter.get("/get-offer-products", authenticateToken, getUserOfferProducts);
userRouter.get("/get-product/:productId", authenticateToken, getUserProductById);
userRouter.get("/get-products-by-category/:categoryId", authenticateToken, getUserProductsByCategory);
userRouter.get("/get-featured-products", authenticateToken, getFeaturedProducts);
userRouter.get("/get-pending-withdrawals", authenticateToken, getPendingWithdrawals)

// Profile update routes
// userRouter.put(
//   "/update-profile",
//   authenticateToken,
//   uploadProfile.single("profilePick"),
//   updateProfile
// );
userRouter.put(
  "/update-profile",
  authenticateToken,
  uploadProfileAndPassbook.fields([
    { name: "profilePick", maxCount: 1 },
    { name: "passbookPhoto", maxCount: 1 },
  ]),
  updateProfile
);
userRouter.put("/update-password", authenticateToken, updatePassword);

// Document upload routes
userRouter.post(
  "/upload-pan",
  authenticateToken,
  uploadPan.single("panPhoto"),
  uploadPanPhoto
);
userRouter.post(
  "/upload-aadhar",
  authenticateToken,
  uploadAadhar.single("aadharPhoto"),
  uploadAadharPhoto
);
userRouter.post(
  "/upload-passbook",
  authenticateToken,
  uploadPassbook.single("passbookPhoto"),
  uploadPassbookPhoto
);

userRouter.post("/create-withdrawal-req", authenticateToken, createWithdrawalRequest)

// QR Scan Route
userRouter.post("/scan-qr", authenticateToken, scanProductQR)

//delete user
// userRouter.delete("/request-delete", authenticateToken, deleteUserReq)
userRouter.delete("/request-delete", deleteUserReq)

userRouter.delete("/app/request-delete", authenticateToken, deleteAppUserReq)

export default userRouter;
