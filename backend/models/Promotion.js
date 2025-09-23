import mongoose from "mongoose"

const promotionSchema = new mongoose.Schema(
  {
    promotionName: {
      type: String,
      required: true,
      trim: true,
    },
    promotionImage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
)

const Promotion = mongoose.model("Promotion", promotionSchema)
export default Promotion
