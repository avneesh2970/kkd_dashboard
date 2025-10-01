import Product from "../models/Product.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import cloudinary from "../helpers/cloudinary/cloudinary.js";
import { customAlphabet } from "nanoid";
import qrcode from "qrcode";
import Offer from "../models/OfferProduct.js";
import { isValidQrCount } from "../helpers/utils/helperFunctions/index.js";

const generateProductId = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  10
);

const uploadQRToCloudinary = async (data) => {
  try {
    const qrImage = await qrcode.toDataURL(data, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 2,
      width: 300, // Larger QR for better scanning
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    const result = await cloudinary.uploader.upload(qrImage, {
      folder: "kkd/qrcodes",
    });
    return result.secure_url;
  } catch (err) {
    console.error("QR Code Upload Error:", err);
    throw new Error("Failed to generate or upload QR code.");
  }
};

// 🚀 Get all products for users (only active products)
export const getUserProducts = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search } = req.query;

    // Build filter object - only show active products for users
    const filter = {
      qrStatus: "active", // Only show products that can still be scanned
    };

    if (category) {
      filter.category = category;
    }

    // Add search functionality
    if (search) {
      filter.$or = [
        { productName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);

    const products = await Product.find(filter)
      .populate("category", "categoryName categoryImage")
      .select(
        "productId productName description productImage category coinReward createdAt"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit));

    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalProducts / Number.parseInt(limit)),
        totalProducts,
        hasMore: skip + products.length < totalProducts,
      },
    });
  } catch (error) {
    console.error("Get User Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// 🚀 NEW: Get single product details for users
export const getUserProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({
      productId,
      qrStatus: "active",
    }).populate("category", "categoryName categoryImage");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or not available",
      });
    }

    // Don't expose sensitive admin data to users
    const userProduct = {
      productId: product.productId,
      productName: product.productName,
      description: product.description,
      productImage: product.productImage,
      category: product.category,
      coinReward: product.coinReward,
      isAvailable: product.qrStatus === "active",
      createdAt: product.createdAt,
    };

    res.status(200).json({
      success: true,
      message: "Product details fetched successfully",
      data: userProduct,
    });
  } catch (error) {
    console.error("Get User Product By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// 🚀 NEW: Get products by category for users
export const getUserProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const filter = {
      category: categoryId,
      qrStatus: "active",
    };

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);

    const products = await Product.find(filter)
      .populate("category", "categoryName categoryImage")
      .select(
        "productId productName description productImage category coinReward createdAt"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit));

    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: `Products in ${category.categoryName} fetched successfully`,
      data: products,
      category: {
        id: category._id,
        name: category.categoryName,
        image: category.categoryImage,
      },
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalProducts / Number.parseInt(limit)),
        totalProducts,
        hasMore: skip + products.length < totalProducts,
      },
    });
  } catch (error) {
    console.error("Get User Products By Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// 🚀 Get featured/popular products for users
export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    // Get products with highest coin rewards (featured) and recently added
    const featuredProducts = await Product.find({
      qrStatus: "active",
    })
      .populate("category", "categoryName categoryImage")
      .select(
        "productId productName description productImage category coinReward createdAt"
      )
      .sort({ coinReward: -1, createdAt: -1 })
      .limit(Number.parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Featured products fetched successfully",
      data: featuredProducts,
    });
  } catch (error) {
    console.error("Get Featured Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { productName, categoryId, coinReward, description, qrCount } =
      req.body;

    if (!productName || !categoryId || !coinReward || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Product name, category, coin reward, and image are required.",
      });
    }

    if (!isValidQrCount(qrCount)) {
      return res
        .status(400)
        .json({ message: "qrCount must be a valid number" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    const productId = `PROD_${generateProductId()}`;
    const qrCodes = [];
    const count = qrCount && qrCount > 0 ? parseInt(qrCount) : 1;

    for (let i = 0; i < count; i++) {
      const now = Date.now();
      const qrCode = generateProductId();
      const qrData = {
        productId,
        type: "PRODUCT_QR",
        index: i,
        giftCode: qrCode,
        timestamp: now,
        hash: Buffer.from(`${productId}-${now}-${i}-KKD_SECRET`)
          .toString("base64")
          .slice(0, 16),
      };
      const qrCodeImage = await uploadQRToCloudinary(JSON.stringify(qrData));

      qrCodes.push({
        qrCodeImage,
        qrCode,
        qrStatus: "active",
      });
    }

    const newProduct = new Product({
      productId,
      productName,
      description: description || "",
      category: categoryId,
      coinReward,
      productImage: req.file.path,
      qrCodes,
      qrCodeImage: "please refer to updated api to get the qrImage",
      qrCode: "please refer to updated api to get the qrCode",
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully with a unique QR code.",
      data: newProduct,
      meta: { qrCode: "not available is this api version" },
    });
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/* add more qr code to the existing product */
// export const addQrToProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { qrCount } = req.body;

//     const product = await Product.findById(id);
//     if (!product) {
//       return res.status(404).json({ success: false, message: "Product not found." });
//     }

//     const newQrs = [];
//     const count = qrCount && qrCount > 0 ? parseInt(qrCount) : 1;

//     for (let i = 0; i < count; i++) {
//       const now = Date.now();
//       const qrData = {
//         productId: product.productId,
//         type: "PRODUCT_QR",
//         index: product.qrCodes.length + i,
//         timestamp: now,
//         hash: Buffer.from(`${product.productId}-${now}-${i}-KKD_SECRET`)
//           .toString("base64")
//           .slice(0, 16),
//       };

//       const qrCodeImage = await uploadQRToCloudinary(JSON.stringify(qrData));
//       const qrCode = generateProductId();

//       newQrs.push({ qrCodeImage, qrCode, qrStatus: "active" });
//     }

//     product.qrCodes.push(...newQrs);
//     await product.save();

//     res.status(200).json({
//       success: true,
//       message: `${count} QR code(s) added successfully.`,
//       data: product,
//     });
//   } catch (error) {
//     console.error("Add QR Error:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

// 🚀 ADMIN: Get all products

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "categoryName")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      data: products,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// 🚀 ADMIN: Update a product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, categoryId, coinReward, qrCount } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    if (productName) product.productName = productName;
    if (categoryId) product.category = categoryId;
    if (coinReward) product.coinReward = coinReward;
    //////////////////////////////////////////////////////////////
    if (!isValidQrCount(qrCount)) {
      return res
        .status(400)
        .json({ message: "qrCount must be a valid number" });
    }

    // const productId = `PROD_${generateProductId()}`;
    const productId = product.productId;
    const newQrCodes = [];
    const count = qrCount && qrCount > 0 && parseInt(qrCount);

    for (let i = 0; i < count; i++) {
      const now = Date.now();
      const qrCode = generateProductId();
      const qrData = {
        productId,
        type: "PRODUCT_QR",
        index: product.qrCodes.length + i, // naye QR ka index purane ke baad se,
        giftCode: qrCode,
        timestamp: now,
        hash: Buffer.from(`${productId}-${now}-${i}-KKD_SECRET`)
          .toString("base64")
          .slice(0, 16),
      };
      const qrCodeImage = await uploadQRToCloudinary(JSON.stringify(qrData));
      newQrCodes.push({
        qrCodeImage,
        qrCode,
        qrStatus: "active",
      });
    }
    product.qrCodes.push(...newQrCodes);

    if (req.file) {
      // Optional: Delete old image from Cloudinary
      product.productImage = req.file.path;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// 🚀 ADMIN: Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id: ", id);
    const product = await Product.findByIdAndDelete(id);
    console.log("product: ", product);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// 🚀 ADMIN: Toggle product QR status
export const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    if (product.qrStatus === "scanned") {
      return res.status(400).json({
        success: false,
        message: "Cannot change status of an already scanned QR.",
      });
    }

    product.qrStatus = product.qrStatus === "active" ? "disabled" : "active";
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product status changed to ${product.qrStatus}.`,
      data: product,
    });
  } catch (error) {
    console.error("Toggle Product Status Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// 🚀 NEW: ADMIN: Test QR scanning (for admin testing purposes)
export const testQRScan = async (req, res) => {
  try {
    const { qrData, testUserId } = req.body;
    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: "QR data is required.",
      });
    }

    // Parse QR data
    let parsedData;
    if (typeof qrData === "string") {
      try {
        parsedData = JSON.parse(qrData);
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: "Invalid QR code format.",
        });
      }
    } else if (typeof qrData === "object" && qrData !== null) {
      parsedData = qrData;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid QR code format.",
      });
    }

    // Validate QR structure
    if (!parsedData.productId || parsedData.type !== "PRODUCT_QR") {
      return res.status(400).json({
        success: false,
        message: "Invalid QR code. This is not a valid product QR.",
      });
    }

    const product = await Product.findOne({ productId: parsedData.productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found. Invalid QR code.",
      });
    }

    if (product.qrStatus !== "active") {
      const message =
        product.qrStatus === "scanned"
          ? "This QR code has already been used."
          : "This QR code is currently inactive.";
      return res.status(400).json({ success: false, message });
    }

    // For testing, we can either:
    // 1. Use a test user ID if provided
    // 2. Just validate the QR without actually updating anything
    // 3. Create a mock response

    if (testUserId) {
      // Test with specific user
      const user = await User.findOne({ userId: testUserId });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Test user not found." });
      }

      // Check if user already scanned this product
      if (user.productsQrScanned.includes(product.productId)) {
        return res.status(400).json({
          success: false,
          message: "This test user has already scanned this product.",
        });
      }

      // Update product status
      product.qrStatus = "scanned";
      product.scannedBy = user._id;
      product.scannedAt = new Date();

      // Get category name for scan history
      const category = await Category.findById(product.category).select(
        "categoryName"
      );

      // Use the recordScan method to properly update user data
      user.recordScan(
        product.productId,
        product.productName,
        category?.categoryName || "",
        product.coinReward
      );

      await Promise.all([product.save(), user.save()]);

      res.status(200).json({
        success: true,
        message: `✅ QR Test Successful! ${product.coinReward} coins would be awarded for scanning ${product.productName}.`,
        data: {
          productName: product.productName,
          coinsEarned: product.coinReward,
          totalCoins: user.coinsEarned,
          scannedAt: product.scannedAt,
          testUserId: user.userId,
        },
      });
    } else {
      // Just validate QR without updating anything
      res.status(200).json({
        success: true,
        message: `✅ QR Validation Successful! This QR would award ${product.coinReward} coins for ${product.productName}.`,
        data: {
          productName: product.productName,
          productId: product.productId,
          coinsEarned: product.coinReward,
          qrStatus: product.qrStatus,
          isValid: true,
          testMode: true,
        },
      });
    }
  } catch (error) {
    console.error("Test QR Scan Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// 🚀 USER: Scan a product QR code
export const scanProductQR = async (req, res) => {
  try {
    const { qrData, code } = req.body;
    const userId = req.user.userId;
    // ✅ Common user fetch
    const user = await User.findOne({ userId });
    if (user.kycStatus !== "approved") {
      return res.status(400).json({
        success: false,
        message: "KYC Must be approved",
      });
    }
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // =====================================
    // Case 1: QR data object/string provided
    // =====================================
    if (qrData) {
      let parsedData;

      if (typeof qrData === "string") {
        try {
          parsedData = JSON.parse(qrData);
        } catch (err) {
          return res.status(400).json({
            success: false,
            message: "Invalid QR code format.",
          });
        }
      } else if (typeof qrData === "object" && qrData !== null) {
        parsedData = qrData;
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid QR code format.",
        });
      }

      if (!parsedData.productId || parsedData.type !== "PRODUCT_QR") {
        return res.status(400).json({
          success: false,
          message: "Invalid QR code. This is not a valid product QR.",
        });
      }

      // ✅ Product or Offer find
      let product =
        (await Product.findOne({ productId: parsedData.productId })) ||
        (await Offer.findOne({ productId: parsedData.productId }));

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found. Invalid QR code.",
        });
      }

      // ✅ Match QR inside product.qrCodes
      const scannedQrCode = parsedData.giftCode;
      const matchedQr = product.qrCodes.find(
        (qr) => qr.qrCode === scannedQrCode
      );
      if (!matchedQr) {
        return res.status(404).json({
          success: false,
          message: "QR code not found in this product.",
        });
      }

      if (matchedQr.qrStatus !== "active") {
        return res.status(400).json({
          success: false,
          message: "This QR code is currently inactive.",
        });
      }

      // ✅ Update
      matchedQr.scannedBy = user._id;
      matchedQr.scannedAt = Date.now();
      matchedQr.qrStatus = "scanned";

      const categoryName = await Category.findById(product.category).select(
        "categoryName"
      );

      user.recordScan(
        product.productId,
        product.productName,
        categoryName?.categoryName || "",
        product.coinReward
      );

      await Promise.all([product.save(), user.save()]);
      user.productsQrScanned.push();
      return res.status(200).json({
        success: true,
        message: `Congratulations! You've earned ${product.coinReward} coins for scanning ${product.productName}.`,
        data: {
          productName: product.productName,
          coinsEarned: product.coinReward,
          totalCoins: user.coinsEarned,
          scannedAt: matchedQr.scannedAt,
        },
      });
    }

    // =====================================
    // Case 2: Only code provided
    // =====================================
    if (code) {
      // ✅ Product or Offer find by qrCodes.qrCode
      let product =
        (await Product.findOne({ "qrCodes.qrCode": code })) ||
        (await Offer.findOne({ "qrCodes.qrCode": code }));

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found. Invalid QR code.",
        });
      }

      // ✅ Match QR object
      const matchedQr = product.qrCodes.find((qr) => qr.qrCode === code);

      if (!matchedQr) {
        return res.status(404).json({
          success: false,
          message: "QR code not found in this product.",
        });
      }

      if (matchedQr.qrStatus !== "active") {
        return res.status(400).json({
          success: false,
          message: "This QR code is currently inactive.",
        });
      }

      // ✅ Update QR + User
      matchedQr.scannedBy = user._id;
      matchedQr.scannedAt = Date.now();
      matchedQr.qrStatus = "scanned";
      const categoryName = await Category.findById(product.category).select(
        "categoryName"
      );

      user.recordScan(
        product.productId,
        product.productName,
        categoryName?.categoryName || "",
        product.coinReward
      );

      await Promise.all([product.save(), user.save()]);

      return res.status(200).json({
        success: true,
        message: `Congratulations! You've earned ${product.coinReward} coins for scanning ${product.productName}.`,
        data: {
          productName: product.productName,
          coinsEarned: product.coinReward,
          totalCoins: user.coinsEarned,
          scannedAt: matchedQr.scannedAt,
        },
      });
    }

    // If neither qrData nor code
    return res.status(400).json({
      success: false,
      message: "QR data or code is required.",
    });
  } catch (error) {
    console.error("Scan QR Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// Helper to find QR object inside product
// function findQrCode(product, code) {
//   return product.qrCodes.find(qr => qr.code === code);
// }

// export const scanProductQR = async (req, res) => {
//   try {
//     const { qrData, code } = req.body;

//     if (!qrData && !code) {
//       return res.status(400).json({
//         success: false,
//         message: "QR data or code is required.",
//       });
//     }

//     const userId = req.user.userId;

//     // STEP 1: Parse QR data if it's JSON
//     let parsedData = qrData;
//     if (qrData && typeof qrData === "string") {
//       try {
//         parsedData = JSON.parse(qrData);
//       } catch (err) {
//         return res.status(400).json({ success: false, message: "Invalid QR data format." });
//       }
//     }

//     // STEP 2: Validate QR data structure
//     const productId = parsedData?.productId || null;

//     let product = null;
//     let isOfferProduct = false;

//     if (productId) {
//       product = await Product.findOne({ productId }).populate("qrCodes.scannedBy", "fullName");
//       if (!product) {
//         product = await Offer.findOne({ productId }).populate("qrCodes.scannedBy", "fullName");
//         isOfferProduct = true;
//       }
//     } else if (code) {
//       product = await Product.findOne({ "qrCodes.code": code }).populate("qrCodes.scannedBy", "fullName");
//       if (!product) {
//         product = await Offer.findOne({ "qrCodes.code": code }).populate("qrCodes.scannedBy", "fullName");
//         isOfferProduct = true;
//       }
//     }

//     if (!product) {
//       return res.status(404).json({ success: false, message: "Product not found. Invalid QR code." });
//     }

//     // STEP 3: Get specific QR object
//     const qrCode = code ? findQrCode(product, code) : findQrCode(product, parsedData.qrCode);

//     if (!qrCode) {
//       return res.status(400).json({ success: false, message: "QR code not found in product." });
//     }

//     // STEP 4: Check QR status
//     if (qrCode.status !== "active") {
//       if (qrCode.status === "scanned") {
//         return res.status(200).json({
//           success: false,
//           scanned: true,
//           message: "This QR code has already been used.",
//           data: {
//             scannedByName: qrCode.scannedBy?.fullName || "Unknown",
//             scannedAt: qrCode.scannedAt,
//             productName: product.productName,
//             productImage: product.productImage,
//           },
//         });
//       }
//       return res.status(400).json({ success: false, message: "This QR code is inactive." });
//     }

//     // STEP 5: Update QR status
//     const user = await User.findOne({ userId });
//     if (!user) return res.status(404).json({ success: false, message: "User not found." });

//     if (user.productsQrScanned.includes(product.productId)) {
//       return res.status(400).json({ success: false, message: "You already scanned this product." });
//     }

//     qrCode.status = "scanned";
//     qrCode.scannedBy = user._id;
//     qrCode.scannedAt = new Date();

//     // Add scan history to user
//     const categoryName = await Category.findById(product.category).select("categoryName");
//     user.recordScan(
//       product.productId,
//       product.productName,
//       categoryName?.categoryName || "",
//       product.coinReward
//     );

//     await Promise.all([product.save(), user.save()]);

//     return res.status(200).json({
//       success: true,
//       message: `Congratulations! You've earned ${product.coinReward} coins for scanning ${product.productName}.`,
//       data: {
//         productName: product.productName,
//         coinsEarned: product.coinReward,
//         totalCoins: user.coinsEarned,
//         scannedAt: qrCode.scannedAt,
//       },
//     });

//   } catch (error) {
//     console.error("Scan QR Error:", error);
//     return res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };
