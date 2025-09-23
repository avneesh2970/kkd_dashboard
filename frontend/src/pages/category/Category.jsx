import { FaPlus, FaTrash } from "react-icons/fa6";
import Header from "../../components/header/Header";
import { IoIosArrowRoundBack } from "react-icons/io";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { api } from "../../helpers/api/api";

export default function Category() {
  const [isCategoryPopup, setIsCategoryPopup] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const categoryRef = useRef(null);

  // Toggle category popup
  const toggleCategory = () => {
    setIsCategoryPopup(!isCategoryPopup);
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/categories");
      setCategories(res.data.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, []);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isCategoryPopup &&
        categoryRef.current &&
        !categoryRef.current.contains(event.target)
      ) {
        setIsCategoryPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCategoryPopup]);

  // Add new category API call
  const handleSaveCategory = async () => {
    if (!categoryName || !imageFile) {
      toast.error("Please provide category name and image!");
      return;
    }

    setAddingCategory(true);
    const formData = new FormData();
    formData.append("categoryName", categoryName);
    formData.append("categoryImage", imageFile);

    try {
      await api.post(
        "/api/admin/add-category",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Category added successfully!");
      setIsCategoryPopup(false);
      setCategoryName("");
      setImageFile(null);
      setImage(null);
      fetchCategories(); // refresh list
    } catch (err) {
      console.error(err);
      toast.error("Error adding category!");
    } finally {
      setAddingCategory(false);
    }
  };

  // Delete category API call
  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setDeletingId(id);
      try {
        await api.delete(
          `/api/admin/delete-category/${id}`
        );
        toast.success("Category deleted successfully!");
        fetchCategories(); // refresh list
      } catch (error) {
        console.error("Delete category error:", error);
        toast.error("Failed to delete category");
      } finally {
        setDeletingId(null);
      }
    }
  };

  // 🆕 Skeleton loader component
  const CategorySkeleton = () => (
    <div className="w-[180px] animate-pulse">
      <div className="w-full aspect-square bg-gray-200 rounded"></div>
      <div className="mt-1 h-4 bg-gray-200 rounded mx-auto w-3/4"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C3E8FF] to-white px-10 pt-7 pb-12 space-y-8">
      <Header />
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-black text-lg flex items-center">
          <Link to="/">
            <IoIosArrowRoundBack size={35} className="mr-1 text-black" />
          </Link>
          Category
        </h2>
        <button
          onClick={toggleCategory}
          disabled={addingCategory}
          className="w-8 h-8 rounded-full bg-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPlus className="text-black text-sm" />
        </button>
      </div>

      {/* Category Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-wrap gap-3">
            {/* Show skeleton loaders */}
            {Array.from({ length: 8 }).map((_, index) => (
              <CategorySkeleton key={index} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">
              No categories found
            </div>
            <p className="text-gray-400 text-sm">
              Click the + button to add your first category
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <div key={category._id} className="w-[180px] relative group">
                <img
                  src={category.categoryImage || "/placeholder.svg"}
                  alt={category.categoryName}
                  className="w-full aspect-square object-cover rounded"
                />
                <p className="mt-1 text-sm font-medium text-black text-center">
                  {category.categoryName}
                </p>
                {/* Delete button with loading state */}
                <button
                  onClick={() => handleDeleteCategory(category._id)}
                  disabled={deletingId === category._id}
                  className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                  title="Delete"
                >
                  {deletingId === category._id ? (
                    <Loader2 className="text-red-600 text-xs animate-spin" />
                  ) : (
                    <FaTrash className="text-red-600 text-xs" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* category popup */}
      {isCategoryPopup && (
        <>
          {/* Blurred backdrop covering the entire screen except Header */}
          <div className="fixed inset-0 bg-transparent backdrop-blur-md z-40"></div>
          {/* Popup */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              className="bg-white p-6 rounded-lg shadow-lg w-96 relative"
              ref={categoryRef}
            >
              <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
              <button
                onClick={toggleCategory}
                disabled={addingCategory}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✕
              </button>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Category Name"
                    disabled={addingCategory}
                    className="w-full p-2 border rounded-lg bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="max-w-xs">
                  <div className="block text-sm font-medium mb-1">
                    Category Image
                  </div>
                  <label
                    className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-40 cursor-pointer hover:border-blue-500 transition ${
                      addingCategory ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {image ? (
                      <img
                        src={image || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-500 text-sm">
                        Click to upload image
                      </span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={addingCategory}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => {
                      setCategoryName("");
                      setImage(null);
                      setImageFile(null);
                    }}
                    disabled={addingCategory}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clean
                  </button>
                  <button
                    onClick={handleSaveCategory}
                    disabled={addingCategory || !categoryName || !imageFile}
                    className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {addingCategory && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {addingCategory ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
