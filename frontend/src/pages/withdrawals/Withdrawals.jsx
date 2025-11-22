import { useEffect, useState, useMemo } from "react";
import Header from "../../components/header/Header";
import { Link } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FiDownload, FiFilter, FiGrid, FiList } from "react-icons/fi";
import { api } from "../../helpers/api/api";

export default function Withdrawals() {
  const [loading, setLoading] = useState(false);
  const [withdrawalReq, setWithdrawalReq] = useState([]);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // View and pagination states
  const [viewMode, setViewMode] = useState("card"); // 'card' or 'table'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

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

  const filteredReqs = useMemo(() => {
    let filtered = withdrawalReq;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (req) =>
          req.user?.fullName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          req.user?.phone?.includes(searchQuery) ||
          req.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Amount range filter
    if (minAmount) {
      filtered = filtered.filter((req) => req.amount >= Number(minAmount));
    }
    if (maxAmount) {
      filtered = filtered.filter((req) => req.amount <= Number(maxAmount));
    }

    return filtered;
  }, [withdrawalReq, statusFilter, searchQuery, minAmount, maxAmount]);

  const totalPages = Math.ceil(filteredReqs.length / itemsPerPage);
  const paginatedReqs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReqs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReqs, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, minAmount, maxAmount]);

  const exportToCSV = () => {
    const headers = ["User Name", "Phone", "Email", "Amount", "Status", "Date"];
    const csvData = filteredReqs.map((req) => [
      req.user?.fullName || "N/A",
      req.user?.phone || "N/A",
      req.user?.email || "N/A",
      req.amount,
      req.status,
      new Date(req.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `withdrawals_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
    setMinAmount("");
    setMaxAmount("");
  };

  const statusOptions = ["all", "approved", "rejected", "pending", "completed"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C3E8FF] to-white px-4 sm:px-10 pt-6 pb-12 space-y-8">
      <Header />

      {/* Page Title and Actions */}
      <div className="flex flex-col gap-4">
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

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() =>
                setViewMode(viewMode === "card" ? "table" : "card")
              }
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              title={`Switch to ${viewMode === "card" ? "table" : "card"} view`}
            >
              {viewMode === "card" ? (
                <FiList size={18} />
              ) : (
                <FiGrid size={18} />
              )}
              {viewMode === "card" ? "Table View" : "Card View"}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <FiFilter size={18} />
              Filters
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <FiDownload size={18} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="w-full">
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {showFilters && (
          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex gap-2 flex-wrap">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setStatusFilter(opt)}
                      className={`px-3 py-1 rounded-full text-sm capitalize border ${
                        statusFilter === opt
                          ? "bg-black text-white"
                          : "bg-white text-black border-gray-300 hover:bg-gray-100"
                      } transition`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Amount
                </label>
                <input
                  type="number"
                  placeholder="Min"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Amount
                </label>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600">
          Showing {paginatedReqs.length} of {filteredReqs.length} requests
          {filteredReqs.length !== withdrawalReq.length &&
            ` (filtered from ${withdrawalReq.length} total)`}
        </div>
      </div>

      {/* Requests Display */}
      <div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700 font-semibold">
                Loading withdrawals...
              </p>
            </div>
          </div>
        ) : paginatedReqs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-2">
              No withdrawal requests found
            </p>
            <p className="text-gray-400 text-sm">Try adjusting your filters</p>
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedReqs.map((req, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between border gap-4"
              >
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={req.user?.profilePick || "/placeholder.svg"}
                    alt={req.user?.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {req.user?.fullName}
                    </h3>
                    <p className="text-sm text-gray-500">{req.user?.phone}</p>
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
                ) : req.status === "approved" ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium rounded-full px-3 py-1 bg-blue-100 text-blue-700 text-center">
                      Approved
                    </span>
                    <button
                      className="px-4 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                      onClick={() =>
                        updateWithdrawalStatus(req._id, "completed")
                      }
                    >
                      Complete
                    </button>
                  </div>
                ) : req.status === "completed" ? (
                  <span className="text-sm font-medium rounded-full px-3 py-1 bg-green-100 text-green-700">
                    Completed
                  </span>
                ) : (
                  <span className="text-sm font-medium rounded-full px-3 py-1 bg-red-100 text-red-600">
                    {req.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedReqs.map((req, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={req.user?.profilePick || "/placeholder.svg"}
                            alt={req.user?.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="font-medium text-gray-900">
                            {req.user?.fullName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {req.user?.phone}
                        </div>
                        <div className="text-sm text-gray-500">
                          {req.user?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-semibold text-black">
                          <img
                            src="/coin.png"
                            alt="coin"
                            className="w-5 h-5 object-contain"
                          />
                          {req.amount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-medium rounded-full px-3 py-1 ${
                            req.status === "approved"
                              ? "bg-blue-100 text-blue-700"
                              : req.status === "rejected"
                              ? "bg-red-100 text-red-600"
                              : req.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {req.status === "pending" ? (
                          <div className="flex gap-2">
                            <button
                              className="px-3 py-1 border border-gray-400 rounded-lg text-sm text-gray-800 hover:bg-gray-100 transition"
                              onClick={() =>
                                updateWithdrawalStatus(req._id, "rejected")
                              }
                            >
                              Reject
                            </button>
                            <button
                              className="px-3 py-1 bg-gray-900 text-white rounded-lg text-sm hover:bg-black transition"
                              onClick={() =>
                                updateWithdrawalStatus(req._id, "approved")
                              }
                            >
                              Accept
                            </button>
                          </div>
                        ) : req.status === "approved" ? (
                          <button
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                            onClick={() =>
                              updateWithdrawalStatus(req._id, "completed")
                            }
                          >
                            Complete
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">
                            No actions
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Items per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value={96}>96</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
