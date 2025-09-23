import React from "react";
import { useRef } from "react";
import { useState } from "react";
import { api } from "../../helpers/api/api";
import toast from "react-hot-toast";
import { useCallback } from "react";
import { FaPlus } from "react-icons/fa6";
import { IoIosClose } from "react-icons/io";
import { useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function ProductAddButton() {
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    categoryId: "",
    coinReward: "",
    productImage: null,
  });
  //   const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setFormData({
      productName: "",
      categoryId: "",
      coinReward: "",
      productImage: null,
    });
    setImagePreview(null);
    setEditingProduct(null);
  };

  const openPopup = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        productName: product.productName,
        categoryId: product.category._id,
        coinReward: product.coinReward,
        productImage: null, // Not editing image by default
      });
      setImagePreview(product.productImage);
    } else {
      resetForm();
    }
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, productImage: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      //   const [productsRes, categoriesRes] = await Promise.all([
      //     api.get("/api/admin/products"),
      //     api.get("/api/admin/categories"),
      //   ]);
      const categoriesRes = await api.get("/api/admin/categories");
      //   setProducts(productsRes.data.data);
      setCategories(categoriesRes.data.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Could not load products or categories. Please try again.");
      toast.error("Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error("Please select a category.");
      return;
    }
    if (!editingProduct && !formData.productImage) {
      toast.error("Please upload a product image.");
      return;
    }

    setIsSubmitting(true);
    const payload = new FormData();
    payload.append("productName", formData.productName);
    payload.append("categoryId", formData.categoryId);
    payload.append("coinReward", formData.coinReward);
    if (formData.productImage) {
      payload.append("productImage", formData.productImage);
    }

    try {
      if (editingProduct) {
        await api.put(
          `/api/admin/update-product/${editingProduct._id}`,
          payload
        );
        toast.success("Product updated successfully!");
      } else {
        await api.post("/api/admin/add-product", payload);
        toast.success("Product added successfully!");
      }
      closePopup();
      fetchData();
    } catch (err) {
      console.error("Form submission error:", err);
      toast.error(err.response?.data?.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const popupRef = useRef(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-semibold">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-lg font-medium text-red-600">
          Loading Failed
        </h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => openPopup()}
        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition text-sm"
      >
        <FaPlus /> Add Product
      </button>

      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div
            ref={popupRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button onClick={closePopup}>
                <IoIosClose size={28} />
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4 overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Coin Reward
                  </label>
                  <input
                    type="number"
                    name="coinReward"
                    value={formData.coinReward}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Product Image
                </label>
                <div className="mt-1 flex items-center gap-4">
                  <div className="w-24 h-24 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">Preview</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t mt-4">
                <button
                  type="button"
                  onClick={closePopup}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
