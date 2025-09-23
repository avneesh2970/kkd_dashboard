"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Header from "../../components/header/Header";
import { Link } from "react-router-dom";
import { IoIosArrowRoundBack, IoIosClose } from "react-icons/io";
import { FaPlus, FaTrash, FaEdit, FaDownload } from "react-icons/fa";
import { Loader2, Power, PowerOff, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../helpers/api/api";

export default function Products() {
  // Main state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Popup and form state
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    categoryId: "",
    coinReward: "",
    productImage: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Details modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  console.log("selectedProduct: ", selectedProduct);
  const popupRef = useRef(null);

  // Fetch initial data (products and categories)
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/api/admin/products"),
        api.get("/api/admin/categories"),
      ]);
      setProducts(productsRes.data.data);
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

  // Handle closing popup on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isPopupOpen &&
        popupRef.current &&
        !popupRef.current.contains(event.target)
      ) {
        closePopup();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPopupOpen]);

  // Form handling
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

  // API Calls
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

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      const toastId = toast.loading("Deleting product...");
      try {
        await api.delete(`/api/admin/delete-product/${id}`);
        toast.success("Product deleted.", { id: toastId });
        fetchData();
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        toast.error("Failed to delete product.", { id: toastId });
      }
    }
  };

  const handleToggleStatus = async (id) => {
    const toastId = toast.loading("Updating status...");
    try {
      await api.patch(`/api/admin/toggle-product-status/${id}`);
      toast.success("Status updated.", { id: toastId });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.", {
        id: toastId,
      });
    }
  };

  const handleDownloadQR = (qrUrl, productName) => {
    fetch(qrUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `${productName.replace(/\s+/g, "_")}_QR.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => toast.error("Failed to download QR code."));
  };

  // UI Components
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      active: {
        bg: "bg-green-100",
        text: "text-green-800",
        dot: "bg-green-500",
      },
      scanned: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
      disabled: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500" },
    };
    const current = statusStyles[status] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      dot: "bg-gray-500",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${current.bg} ${current.text}`}
      >
        <span className={`w-2 h-2 mr-1.5 rounded-full ${current.dot}`}></span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

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
    <div className="min-h-screen bg-gradient-to-b from-[#C3E8FF] to-white px-4 sm:px-6 lg:px-10 pt-7 pb-12 space-y-6">
      <Header />
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-black text-lg flex items-center">
          <Link to="/">
            <IoIosArrowRoundBack size={35} className="mr-1 text-black" />
          </Link>
          Product Management ({products.length})
        </h2>
        <button
          onClick={() => openPopup()}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition text-sm"
        >
          <FaPlus /> Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coins
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QR Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-md object-cover"
                          src={product.productImage || "/placeholder.svg"}
                          alt={product.productName}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.productName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.productId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category?.categoryName || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-yellow-600">
                    {product.coinReward}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={product.qrStatus} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details & QR"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openPopup(product)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(product._id)}
                        title={
                          product.qrStatus === "active" ? "Disable" : "Enable"
                        }
                      >
                        {product.qrStatus === "active" ? (
                          <Power className="w-4 h-4 text-green-600" />
                        ) : (
                          <PowerOff className="w-4 h-4 text-red-600" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Popup */}
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

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">Product Details</h3>
              <button onClick={() => setSelectedProduct(null)}>
                <IoIosClose size={28} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-center overflow-y-auto">
              <h4 className="text-lg font-bold">
                {selectedProduct.productName}
              </h4>
              <p className="text-sm text-gray-500">
                {selectedProduct.category?.categoryName}
              </p>
              <p className="text-sm text-gray-500">
                {selectedProduct?.qrCode}
              </p>
              <div className="flex justify-center">
                <img
                  src={selectedProduct.qrCodeImage || "/placeholder.svg"}
                  alt="QR Code"
                  className="w-64 h-64 border-4 border-gray-200 p-2 rounded-lg"
                />
              </div>
              <p className="text-sm text-gray-600">
                Scan this QR code to earn {selectedProduct.coinReward} coins.
              </p>
              <StatusBadge status={selectedProduct.qrStatus} />
              {selectedProduct.scannedBy && (
                <p className="text-xs text-gray-500">
                  Scanned on:{" "}
                  {new Date(selectedProduct.scannedAt).toLocaleString()}
                </p>
              )}
              <button
                onClick={() =>
                  handleDownloadQR(
                    selectedProduct.qrCodeImage,
                    selectedProduct.productName
                  )
                }
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <FaDownload /> Download QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
