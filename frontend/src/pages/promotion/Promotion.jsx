"use client"

import { FaPlus, FaTrash } from "react-icons/fa6"
import Header from "../../components/header/Header"
import { IoIosArrowRoundBack } from "react-icons/io"
import { Link } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"
import { api } from "../../helpers/api/api"

export default function Promotion() {
  const [isPromotionPopup, setIsPromotionPopup] = useState(false)
  const [promotionName, setPromotionName] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [image, setImage] = useState(null)
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(false)
  const [addingPromotion, setAddingPromotion] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const promotionRef = useRef(null)

  // Toggle promotion popup
  const togglePromotion = () => {
    setIsPromotionPopup(!isPromotionPopup)
  }

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImage(URL.createObjectURL(file))
    }
  }

  // Fetch all promotions
  const fetchPromotions = async () => {
    setLoading(true)
    try {
      const res = await api.get("/api/admin/promotions")
      setPromotions(res.data.data)
    } catch (error) {
      console.error("Failed to fetch promotions", error)
      toast.error("Failed to load promotions")
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchPromotions()
  }, [])

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isPromotionPopup && promotionRef.current && !promotionRef.current.contains(event.target)) {
        setIsPromotionPopup(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isPromotionPopup])

  // Add new promotion API call
  const handleSavePromotion = async () => {
    if (!promotionName || !imageFile) {
      toast.error("Please provide promotion name and image!")
      return
    }

    setAddingPromotion(true)
    const formData = new FormData()
    formData.append("promotionName", promotionName)
    formData.append("promotionImage", imageFile)

    try {
      await api.post("/api/admin/add-promotion", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Promotion added successfully!")
      setIsPromotionPopup(false)
      setPromotionName("")
      setImageFile(null)
      setImage(null)
      fetchPromotions() // refresh list
    } catch (err) {
      console.error(err)
      toast.error("Error adding promotion!")
    } finally {
      setAddingPromotion(false)
    }
  }

  // Delete promotion API call
  const handleDeletePromotion = async (id) => {
    if (window.confirm("Are you sure you want to delete this promotion?")) {
      setDeletingId(id)
      try {
        await api.delete(`/api/admin/delete-promotion/${id}`)
        toast.success("Promotion deleted successfully!")
        fetchPromotions() // refresh list
      } catch (error) {
        console.error("Delete promotion error:", error)
        toast.error("Failed to delete promotion")
      } finally {
        setDeletingId(null)
      }
    }
  }

  // Skeleton loader component
  const PromotionSkeleton = () => (
    <div className="w-[180px] animate-pulse">
      <div className="w-full aspect-square bg-gray-200 rounded"></div>
      <div className="mt-1 h-4 bg-gray-200 rounded mx-auto w-3/4"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C3E8FF] to-white px-10 pt-7 pb-12 space-y-8">
      <Header />
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-black text-lg flex items-center">
          <Link to="/">
            <IoIosArrowRoundBack size={35} className="mr-1 text-black" />
          </Link>
          Promotion
        </h2>
        <button
          onClick={togglePromotion}
          disabled={addingPromotion}
          className="w-8 h-8 rounded-full bg-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPlus className="text-black text-sm" />
        </button>
      </div>

      {/* Promotion Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-wrap gap-3">
            {/* Show skeleton loaders */}
            {Array.from({ length: 8 }).map((_, index) => (
              <PromotionSkeleton key={index} />
            ))}
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No promotions found</div>
            <p className="text-gray-400 text-sm">Click the + button to add your first promotion</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {promotions.map((promotion) => (
              <div key={promotion._id} className="w-[180px] relative group">
                <img
                  src={promotion.promotionImage || "/placeholder.svg"}
                  alt={promotion.promotionName}
                  className="w-full aspect-square object-cover rounded"
                />
                <p className="mt-1 text-sm font-medium text-black text-center">{promotion.promotionName}</p>
                {/* Delete button with loading state */}
                <button
                  onClick={() => handleDeletePromotion(promotion._id)}
                  disabled={deletingId === promotion._id}
                  className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                  title="Delete"
                >
                  {deletingId === promotion._id ? (
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

      {/* promotion popup */}
      {isPromotionPopup && (
        <>
          {/* Blurred backdrop covering the entire screen except Header */}
          <div className="fixed inset-0 bg-transparent backdrop-blur-md z-40"></div>
          {/* Popup */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative" ref={promotionRef}>
              <h3 className="text-lg font-semibold mb-4">Add New Promotion</h3>
              <button
                onClick={togglePromotion}
                disabled={addingPromotion}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✕
              </button>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Promotion Name</label>
                  <input
                    type="text"
                    value={promotionName}
                    onChange={(e) => setPromotionName(e.target.value)}
                    placeholder="Promotion Name"
                    disabled={addingPromotion}
                    className="w-full p-2 border rounded-lg bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="max-w-xs">
                  <div className="block text-sm font-medium mb-1">Promotion Image</div>
                  <label
                    className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-40 cursor-pointer hover:border-blue-500 transition ${
                      addingPromotion ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {image ? (
                      <img
                        src={image || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-500 text-sm">Click to upload image</span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={addingPromotion}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => {
                      setPromotionName("")
                      setImage(null)
                      setImageFile(null)
                    }}
                    disabled={addingPromotion}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clean
                  </button>
                  <button
                    onClick={handleSavePromotion}
                    disabled={addingPromotion || !promotionName || !imageFile}
                    className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {addingPromotion && <Loader2 className="w-4 h-4 animate-spin" />}
                    {addingPromotion ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
