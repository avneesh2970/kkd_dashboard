import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
    },
    categoryImage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Category = new mongoose.model("Category", categorySchema);
export default Category;
