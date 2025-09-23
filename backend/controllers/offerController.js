import Product from "../models/Product.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import cloudinary from "../helpers/cloudinary/cloudinary.js";
import { customAlphabet } from "nanoid";
import qrcode from "qrcode";
import Offer from "../models/OfferProduct.js";

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
      folder: "kkd/offerqrcodes",
    });
    return result.secure_url;
  } catch (err) {
    console.error("QR Code Upload Error:", err);
    throw new Error("Failed to generate or upload QR code.");
  }
};

// 🚀 Get all products for users (only active products)
export const getUserOfferProducts = async (req, res) => {
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
        { productDescription: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);

    const products = await Offer.find(filter)
      .populate("category", "categoryName categoryImage")
      .select(
        "productId productName description productImage category coinReward createdAt"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit));

    const totalProducts = await Offer.countDocuments(filter);

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
export const getUserOfferProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Offer.findOne({
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
      productDescription: product.productDescription,
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
export const getUserOfferProductsByCategory = async (req, res) => {
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

    const products = await Offer.find(filter)
      .populate("category", "categoryName categoryImage")
      .select(
        "productId productName productDescription productImage category coinReward createdAt"
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
export const getFeaturedOfferProducts = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    // Get products with highest coin rewards (featured) and recently added
    const featuredProducts = await Offer.find({
      qrStatus: "active",
    })
      .populate("category", "categoryName categoryImage")
      .select(
        "productId productName productDescription productImage category coinReward createdAt"
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

export const addOfferProduct = async (req, res) => {
  try {
    const { productName, categoryId, description, coinReward } = req.body;
    console.log(description)
    if (!productName || !categoryId || !coinReward || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Product name, category, coin reward, and image are required.",
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    const productId = `PROD_${generateProductId()}`;
    const qrData = {
      productId,
      type: "PRODUCT_QR",
      timestamp: Date.now(),
      // Add a simple hash for basic validation
      hash: Buffer.from(`${productId}-${Date.now()}-KKD_SECRET`)
        .toString("base64")
        .slice(0, 16),
    };
    const qrCodeImage = await uploadQRToCloudinary(JSON.stringify(qrData));

    const newProduct = new Offer({
      productId,
      productName,
      category: categoryId,
      description,
      coinReward,
      productImage: req.file.path,
      qrCodeImage,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully with a unique QR code.",
      data: newProduct,
    });
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// 🚀 ADMIN: Get all products
export const getAllOfferProducts = async (req, res) => {
  try {
    const products = await Offer.find()
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
export const updateOfferProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, categoryId, coinReward } = req.body;

    const product = await Offer.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    if (productName) product.productName = productName;
    if (categoryId) product.category = categoryId;
    if (coinReward) product.coinReward = coinReward;

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
export const deleteOfferProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Offer.findByIdAndDelete(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    // Delete images from Cloudinary
    const productImagePublicId = `kkd/products/${
      product.productImage.split("/").pop().split(".")[0]
    }`;
    const qrImagePublicId = `kkd/offerqrcodes/${
      product.qrCodeImage.split("/").pop().split(".")[0]
    }`;

    await Promise.all([
      cloudinary.uploader.destroy(productImagePublicId),
      cloudinary.uploader.destroy(qrImagePublicId),
    ]);

    res.status(200).json({
      success: true,
      message: "Product and its QR code deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// 🚀 ADMIN: Toggle product QR status
export const toggleOfferProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Offer.findById(id);

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
export const testOfferQRScan = async (req, res) => {
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

    const product = await Offer.findOne({ productId: parsedData.productId });
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
export const scanOfferProductQR = async (req, res) => {
  try {
    const { qrData } = req.body; // Changed from productId to qrData
    const userId = req.user.userId;

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

    const product = await Offer.findOne({
      productId: parsedData.productId,
    }).populate("scannedBy", "fullName");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found. Invalid QR code.",
      });
    }

    if (product.qrStatus !== "active") {
      if (product.qrStatus === "scanned") {
        return res.status(200).json({
          success: false,
          scanned: true,
          message: "This QR code has already been used.",
          data: {
            scannedByName: product.scannedBy?.fullName || "Unknown",
            scannedAt: product.scannedAt,
            productName: product.productName,
            productImage: product.productImage,
          },
        });
      }

      return res.status(400).json({
        success: false,
        scanned: false,
        message: "This QR code is currently inactive.",
      });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Check if user already scanned this product
    if (user.productsQrScanned.includes(product.productId)) {
      return res.status(400).json({
        success: false,
        message: "You have already scanned this product.",
      });
    }
    // Update product status
    product.qrStatus = "scanned";
    product.scannedBy = user._id;
    product.scannedAt = new Date();

    // Get category name for scan history
    const categoryName = await Category.findById(product.category).select(
      "categoryName"
    );

    // Use the recordScan method to properly update user data
    user.recordScan(
      product.productId,
      product.productName,
      categoryName?.categoryName || "",
      product.coinReward
    );

    await Promise.all([product.save(), user.save()]);

    res.status(200).json({
      success: true,
      message: `Congratulations! You've earned ${product.coinReward} coins for scanning ${product.productName}.`,
      data: {
        productName: product.productName,
        coinsEarned: product.coinReward,
        totalCoins: user.coinsEarned,
        scannedAt: product.scannedAt,
      },
    });
  } catch (error) {
    console.error("Scan QR Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
