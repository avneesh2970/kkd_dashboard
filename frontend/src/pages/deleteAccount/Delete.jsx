import React, { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function DeleteAccountForm() {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Replace with your API endpoint
      const res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_API}/api/user/request-delete`,
        {
          data: formData, // body must be inside "data"
          headers: { "Content-Type": "application/json" },
        }
      );

      setMessage(res.data.message || "Account deleted successfully.");
      toast.success(res.data.message || "Account deleted successfully.");
      setFormData({ identifier: "", password: "" });
      navigate("/terms-and-privacy");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to delete account. Try again."
      );
      toast.error(
        error.response?.data?.message || "Failed to delete account. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C3E8FF] to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold text-center text-red-600 mb-6">
          Delete Account
        </h1>
        <p className="text-center text-gray-600 mb-6 text-sm">
          Enter your details to permanently delete your account.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identifier */}
          <div>
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="identifier"
            >
              Full Name or Email / Phone
            </label>
            <input
              type="text"
              id="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Enter your full name or email/phone"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          {/* Password with eye toggle */}
          <div>
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 rounded-xl shadow-md hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete Account"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <p className="text-center mt-4 text-sm font-medium text-gray-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
