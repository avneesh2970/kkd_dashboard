import React, { useEffect, useState } from "react";
import Header from "../../components/header/Header";
import { Link } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { api } from "../../helpers/api/api";

export default function Withdrawals() {
  const [loading, setLoading] = useState(false);
  const [withdrawalReq, setWithdrawalReq] = useState([]);
  const [filter, setFilter] = useState("all");

  const fetchWithdrawalReq = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/admin/get-all-Withdrawals");
      setWithdrawalReq(response.data);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateWithdrawalStatus = async (id, status) => {
    try {
      await api.patch(`/api/admin/withdrawals/${id}/status`, { status });
      fetchWithdrawalReq(); // refresh after update
    } catch (error) {
      console.error(
        "Error updating status:",
        error.response?.data?.message || error.message
      );
    }
  };

  useEffect(() => {
    fetchWithdrawalReq();
  }, []);

  const filteredReqs =
    filter === "all"
      ? withdrawalReq
      : withdrawalReq.filter((req) => req.status === filter);

  const statusOptions = ["all", "approved", "rejected", "pending"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C3E8FF] to-white px-4 sm:px-10 pt-6 pb-12 space-y-8">
      <Header />

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-semibold text-black text-lg flex items-center">
          <Link to="/">
            <IoIosArrowRoundBack
              size={35}
              className="mr-1 text-black hover:text-gray-700 transition-colors"
            />
          </Link>
          Withdrawal Requests
        </h2>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-4 py-1 rounded-full text-sm capitalize border ${
                filter === opt
                  ? "bg-black text-white"
                  : "bg-white text-black border-gray-300 hover:bg-gray-100"
              } transition`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Requests */}
      <div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700 font-semibold">Loading users...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReqs.length === 0 ? (
              <p className="text-center text-gray-500 col-span-full">
                No requests found.
              </p>
            ) : (
              filteredReqs.map((req, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between border gap-4"
                >
                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={req.user.profilePick || "/placeholder.svg"}
                      alt={req.user.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {req.user.fullName}
                      </h3>
                      <p className="text-sm text-gray-500">{req.user.phone}</p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center gap-1 font-semibold text-black">
                    <img
                      src="/coin.png"
                      alt="coin"
                      className="w-5 h-5 object-contain"
                    />
                    {req.amount}
                  </div>

                  {/* Status Actions */}
                  {req.status === "pending" ? (
                    <div className="flex flex-col gap-2">
                      <button
                        className="px-4 py-1 border border-gray-400 rounded-full text-gray-800 hover:bg-gray-100 transition"
                        onClick={() =>
                          updateWithdrawalStatus(req._id, "rejected")
                        }
                      >
                        Reject
                      </button>
                      <button
                        className="px-4 py-1 bg-gray-900 text-white rounded-full hover:bg-black transition"
                        onClick={() =>
                          updateWithdrawalStatus(req._id, "approved")
                        }
                      >
                        Accept
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`text-sm font-medium rounded-full px-3 py-1 ${
                        req.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {req.status}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
