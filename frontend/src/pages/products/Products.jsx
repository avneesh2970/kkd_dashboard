// import { useState, useEffect, useRef, useCallback } from "react";
// import Header from "../../components/header/Header";
// import { Link, useNavigate } from "react-router-dom";
// import { IoIosArrowRoundBack, IoIosClose } from "react-icons/io";
// import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
// import { Loader2, AlertTriangle } from "lucide-react";
// import toast from "react-hot-toast";
// import { api } from "../../helpers/api/api";

// export default function Products() {
//   const navigate = useNavigate();
//   // Main state
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Popup and form state
//   const [isPopupOpen, setIsPopupOpen] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [formData, setFormData] = useState({
//     productName: "",
//     categoryId: "",
//     coinReward: "",
//     qrCount: "",
//     productImage: null,
//   });
//   const [imagePreview, setImagePreview] = useState(null);

//   const popupRef = useRef(null);

//   // Fetch initial data (products and categories)
//   const fetchData = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const [productsRes, categoriesRes] = await Promise.all([
//         api.get("/api/admin/products"),
//         api.get("/api/admin/categories"),
//       ]);
//       setProducts(productsRes.data.data);
//       setCategories(categoriesRes.data.data);
//       setError(null);
//     } catch (err) {
//       console.error("Failed to fetch data:", err);
//       setError("Could not load products or categories. Please try again.");
//       toast.error("Failed to load data.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // Handle closing popup on outside click
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         isPopupOpen &&
//         popupRef.current &&
//         !popupRef.current.contains(event.target)
//       ) {
//         closePopup();
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isPopupOpen]);

//   // Form handling
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData((prev) => ({ ...prev, productImage: file }));
//       setImagePreview(URL.createObjectURL(file));
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       productName: "",
//       categoryId: "",
//       coinReward: "",
//       qrCount: "",
//       productImage: null,
//     });
//     setImagePreview(null);
//     setEditingProduct(null);
//   };

//   const openPopup = (product = null) => {
//     if (product) {
//       setEditingProduct(product);
//       setFormData({
//         productName: product.productName,
//         categoryId: product.category._id,
//         coinReward: product.coinReward,
//         qrCount: product.qrCodes.length,
//         productImage: null, // Not editing image by default
//       });
//       setImagePreview(product.productImage);
//     } else {
//       resetForm();
//     }
//     setIsPopupOpen(true);
//   };

//   const closePopup = () => {
//     setIsPopupOpen(false);
//     resetForm();
//   };

//   // API Calls
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.categoryId) {
//       toast.error("Please select a category.");
//       return;
//     }
//     if (!formData.qrCount) {
//       toast.error("Please Provide the QR Count");
//       return;
//     }
//     if (!editingProduct && !formData.productImage) {
//       toast.error("Please upload a product image.");
//       return;
//     }

//     setIsSubmitting(true);
//     const payload = new FormData();
//     payload.append("productName", formData.productName);
//     payload.append("categoryId", formData.categoryId);
//     payload.append("coinReward", formData.coinReward);
//     payload.append("qrCount", formData.qrCount);
//     if (formData.productImage) {
//       payload.append("productImage", formData.productImage);
//     }

//     try {
//       if (editingProduct) {
//         await api.put(
//           `/api/admin/update-product/${editingProduct._id}`,
//           payload
//         );
//         toast.success("Product updated successfully!");
//       } else {
//         await api.post("/api/admin/add-product", payload);
//         toast.success("Product added successfully!");
//       }
//       closePopup();
//       fetchData();
//     } catch (err) {
//       console.error("Form submission error:", err);
//       toast.error(err.response?.data?.message || "An error occurred.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (
//       window.confirm(
//         "Are you sure you want to delete this product? This action cannot be undone."
//       )
//     ) {
//       const toastId = toast.loading("Deleting product...");
//       try {
//         await api.delete(`/api/admin/delete-product/${id}`);
//         toast.success("Product deleted.", { id: toastId });
//         fetchData();
//         // eslint-disable-next-line no-unused-vars
//       } catch (err) {
//         toast.error("Failed to delete product.", { id: toastId });
//       }
//     }
//   };
//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="flex justify-center items-center py-20">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//             <p className="text-gray-700 font-semibold">Loading users...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center py-20">
//         <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
//         <h3 className="mt-2 text-lg font-medium text-red-600">
//           Loading Failed
//         </h3>
//         <p className="mt-1 text-sm text-gray-500">{error}</p>
//         <button
//           onClick={fetchData}
//           className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[#C3E8FF] to-white px-4 sm:px-6 lg:px-10 pt-7 pb-12 space-y-6">
//       <Header />
//       <div className="flex items-center justify-between">
//         <h2 className="font-semibold text-black text-lg flex items-center">
//           <Link to="/">
//             <IoIosArrowRoundBack size={35} className="mr-1 text-black" />
//           </Link>
//           Product Management ({products.length})
//         </h2>
//         <button
//           onClick={() => openPopup()}
//           className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition text-sm"
//         >
//           <FaPlus /> Add Product
//         </button>
//       </div>

//       {/* Products Table */}
//       <div className="bg-white rounded-xl shadow-md overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Product
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Category
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Coins
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   QrCount
//                 </th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {products.map((product) => (
//                 <tr key={product._id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <div className="flex-shrink-0 h-10 w-10">
//                         <img
//                           className="h-10 w-10 rounded-md object-cover"
//                           src={product.productImage || "/placeholder.svg"}
//                           alt={product.productName}
//                         />
//                       </div>
//                       <div className="ml-4">
//                         <div className="text-sm font-medium text-gray-900">
//                           {product.productName}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {product.productId}
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {product.category?.categoryName || "N/A"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-yellow-600">
//                     {product.coinReward}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-yellow-600">
//                     {product.qrCodes.length}
//                   </td>

//                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                     <div className="flex items-center justify-end gap-3">
//                       <button
//                         onClick={() => navigate(`/products/${product._id}`)}
//                         className="text-blue-600 hover:text-blue-900"
//                         title="View Details & QR"
//                       >
//                         View
//                       </button>
//                       <button
//                         onClick={() => openPopup(product)}
//                         className="text-indigo-600 hover:text-indigo-900"
//                         title="Edit"
//                       >
//                         <FaEdit />
//                       </button>

//                       <button
//                         onClick={() => handleDelete(product._id)}
//                         className="text-red-600 hover:text-red-900"
//                         title="Delete"
//                       >
//                         <FaTrash />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Add/Edit Product Popup */}
//       {isPopupOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
//           <div
//             ref={popupRef}
//             className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
//           >
//             <div className="flex items-center justify-between p-6 border-b">
//               <h3 className="text-xl font-semibold">
//                 {editingProduct ? "Edit Product" : "Add New Product"}
//               </h3>
//               <button onClick={closePopup}>
//                 <IoIosClose size={28} />
//               </button>
//             </div>
//             <form
//               onSubmit={handleSubmit}
//               className="p-6 space-y-4 overflow-y-auto"
//             >
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     Product Name
//                   </label>
//                   <input
//                     type="text"
//                     name="productName"
//                     value={formData.productName}
//                     onChange={handleInputChange}
//                     required
//                     className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     Coin Reward
//                   </label>
//                   <input
//                     type="number"
//                     name="coinReward"
//                     value={formData.coinReward}
//                     onChange={handleInputChange}
//                     required
//                     min="0"
//                     className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Category
//                 </label>
//                 <select
//                   name="categoryId"
//                   value={formData.categoryId}
//                   onChange={handleInputChange}
//                   required
//                   className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
//                 >
//                   <option value="" disabled>
//                     Select a category
//                   </option>
//                   {categories.map((cat) => (
//                     <option key={cat._id} value={cat._id}>
//                       {cat.categoryName}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   QR Count
//                 </label>
//                 <input
//                   type="number"
//                   min={1}
//                   // max={50}
//                   name="qrCount"
//                   value={formData.qrCount}
//                   onChange={handleInputChange}
//                   required
//                   className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Product Image
//                 </label>
//                 <div className="mt-1 flex items-center gap-4">
//                   <div className="w-24 h-24 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
//                     {imagePreview ? (
//                       <img
//                         src={imagePreview || "/placeholder.svg"}
//                         alt="Preview"
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <span className="text-xs text-gray-400">Preview</span>
//                     )}
//                   </div>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleImageChange}
//                     className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                   />
//                 </div>
//               </div>
//               <div className="pt-4 flex justify-end gap-3 border-t mt-4">
//                 <button
//                   type="button"
//                   onClick={closePopup}
//                   className="px-4 py-2 border rounded-lg"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
//                 >
//                   {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
//                   {isSubmitting ? "Saving..." : "Save Product"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Header from "../../components/header/Header";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack, IoIosClose } from "react-icons/io";
import { FaPlus, FaTrash, FaEdit, FaDownload, FaFilter } from "react-icons/fa";
import { Loader2, AlertTriangle, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../helpers/api/api";

export default function Products() {
  const navigate = useNavigate();
  // Main state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minCoins, setMinCoins] = useState("");
  const [maxCoins, setMaxCoins] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Popup and form state
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    categoryId: "",
    coinReward: "",
    qrCount: "",
    productImage: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

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

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.productId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "" || product.category?._id === selectedCategory;

    const matchesMinCoins =
      minCoins === "" || product.coinReward >= Number.parseInt(minCoins);

    const matchesMaxCoins =
      maxCoins === "" || product.coinReward <= Number.parseInt(maxCoins);

    return (
      matchesSearch && matchesCategory && matchesMinCoins && matchesMaxCoins
    );
  });

  const exportToCSV = () => {
    const headers = [
      "Product Name",
      "Product ID",
      "Category",
      "Coin Reward",
      "QR Count",
    ];
    const csvData = filteredProducts.map((product) => [
      product.productName,
      product.productId,
      product.category?.categoryName || "N/A",
      product.coinReward,
      product.qrCodes.length,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `products_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully!");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setMinCoins("");
    setMaxCoins("");
    toast.success("Filters cleared!");
  };

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
      qrCount: "",
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
        qrCount: product.qrCodes.length,
        productImage: null,
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
    if (!formData.qrCount) {
      toast.error("Please Provide the QR Count");
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
    payload.append("qrCount", formData.qrCount);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-semibold">Loading products...</p>
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

      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-semibold text-black text-lg flex items-center">
          <Link to="/">
            <IoIosArrowRoundBack size={35} className="mr-1 text-black" />
          </Link>
          Product Management ({filteredProducts.length} of {products.length})
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition text-sm"
          >
            <FaFilter /> {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <button
            onClick={exportToCSV}
            disabled={filteredProducts.length === 0}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaDownload /> Export CSV
          </button>
          <button
            onClick={() => openPopup()}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition text-sm"
          >
            <FaPlus /> Add Product
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <X size={16} /> Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Products
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Coins */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Coins
              </label>
              <input
                type="number"
                placeholder="0"
                value={minCoins}
                onChange={(e) => setMinCoins(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Max Coins */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Coins
              </label>
              <input
                type="number"
                placeholder="1000"
                value={maxCoins}
                onChange={(e) => setMaxCoins(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || selectedCategory || minCoins || maxCoins
              ? "Try adjusting your filters to see more results."
              : "Get started by adding your first product."}
          </p>
          {(searchQuery || selectedCategory || minCoins || maxCoins) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        /* Products Table */
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
                    QrCount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-yellow-600">
                      {product.qrCodes.length}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => navigate(`/products/${product._id}`)}
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
      )}

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
                  QR Count
                </label>
                <input
                  type="number"
                  min={1}
                  name="qrCount"
                  value={formData.qrCount}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                />
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
    </div>
  );
}
