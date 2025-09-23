import Promotion from "../models/Promotion.js"
import cloudinary from "../helpers/cloudinary/cloudinary.js"

// 🚀 Add new promotion
export const addPromotion = async (req, res) => {
  try {
    const { promotionName } = req.body

    if (!promotionName || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Promotion name and image are required",
      })
    }

    const imageUrl = req.file.path

    const newPromotion = await Promotion.create({
      promotionName,
      promotionImage: imageUrl,
    })

    res.status(201).json({
      success: true,
      message: "Promotion created successfully",
      data: newPromotion,
    })
  } catch (error) {
    console.error("Add Promotion Error:", error)
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    })
  }
}

// 🚀 Get all promotions
export const getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      message: "Promotions fetched successfully",
      data: promotions,
    })
  } catch (error) {
    console.error("Get Promotions Error:", error)
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    })
  }
}

// 🚀 Delete promotion
export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params

    const promotion = await Promotion.findById(id)
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found",
      })
    }

    // Delete image from Cloudinary
    const imageUrl = promotion.promotionImage
    const segments = imageUrl.split("/")
    const publicIdWithExtension = segments[segments.length - 1]
    const publicId = `kkd/promotions/${publicIdWithExtension.split(".")[0]}`

    await cloudinary.uploader.destroy(publicId)

    // Delete promotion from database
    await Promotion.findByIdAndDelete(id)

    res.status(200).json({
      success: true,
      message: "Promotion deleted successfully",
    })
  } catch (error) {
    console.error("Delete Promotion Error:", error)
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    })
  }
}
