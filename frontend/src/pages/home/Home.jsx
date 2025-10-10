import { useRef, useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import profileIcon from "../../assets/profile.png";
import { FaArrowRightLong } from "react-icons/fa6";
import { Link } from "react-router-dom";
import Header from "../../components/header/Header";
import { IoMdClose } from "react-icons/io";
import { ChevronRight } from "lucide-react";
import { api } from "../../helpers/api/api";
import ProductAddButton from "../../components/productAddPopup/ProductAddButton";

// Query keys - centralized for better cache management
const QUERY_KEYS = {
  dashboardStats: ["dashboard", "stats"],
  transactions: ["transactions", "recent"],
  users: ["users", "all"],
  products: ["products", "all"],
  kycStats: ["kyc", "stats"],
  checkProductId: (id) => ["product", "check", id],
  checkGiftCode: (code) => ["giftcode", "check", code],
};

// API functions - separated for better organization
const dashboardApi = {
  getAllUsers: () => api.get("/api/admin/all-users"),
  getKycStats: () => api.get("/api/admin/kyc-stats"),
  getProducts: () => api.get("/api/admin/products"),
  getDashboardStats: () => api.get("/api/admin/dashboard-stats"),
  getTransactionHistory: (limit = 5) =>
    api.get(`/api/admin/transaction-history?limit=${limit}`),
  checkProductId: (productId) =>
    api.post("/api/admin/check-product-id", { productId: productId.trim() }),
  checkGiftCode: (giftCode) =>
    api.post("/api/admin/check-gift-code", { giftCode: giftCode.trim() }),
};

export default function Home() {
  const queryClient = useQueryClient();
  const exploreRef = useRef(null);
  const checkQrRef = useRef(null);

  // UI state
  const [showExploreAllPopup, setShowExploreAllPopup] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showQrPopup, setShowQrPopup] = useState(false);
  const [giftCode, setGiftCode] = useState("");
  const [checkQrResult, setCheckQrResult] = useState(null);

  // Dashboard stats query with parallel fetching
  const {
    data: dashboardData,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
    dataUpdatedAt: statsUpdatedAt,
  } = useQuery({
    queryKey: QUERY_KEYS.dashboardStats,
    queryFn: async () => {
      // Fetch all data in parallel
      const [
        usersResponse,
        kycStatsResponse,
        productsResponse,
        dashboardResponse,
      ] = await Promise.all([
        dashboardApi.getAllUsers(),
        dashboardApi.getKycStats(),
        dashboardApi.getProducts(),
        dashboardApi.getDashboardStats(),
      ]);

      // Process and validate responses
      const totalUsers = usersResponse.data.success
        ? usersResponse.data.data?.length || 0
        : 0;
      const pendingKYC = kycStatsResponse.data.success
        ? kycStatsResponse.data.data?.pending || 0
        : 0;
      const totalProducts = productsResponse.data.success
        ? productsResponse.data.data?.length || 0
        : 0;
      const withdrawalRequests = dashboardResponse.data.success
        ? dashboardResponse.data.data?.withdrawalRequests || 0
        : 0;

      return {
        totalUsers,
        pendingKYC,
        totalProducts,
        withdrawalRequests,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: autoRefresh ? 60 * 1000 : false, // 1 minute if auto-refresh is on
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors
      if (
        failureCount < 3 &&
        (error.code === "NETWORK_ERROR" || error.message === "Request timeout")
      ) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Transaction history query
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: QUERY_KEYS.transactions,
    queryFn: async () => {
      const response = await dashboardApi.getTransactionHistory(5);
      if (response.data.success) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || "Failed to fetch transactions");
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: autoRefresh ? 30 * 1000 : false, // 30 seconds if auto-refresh is on
    refetchOnWindowFocus: true,
    retry: 2,
  });

  // Gift code check mutation
  const checkGiftCodeMutation = useMutation({
    mutationFn: dashboardApi.checkGiftCode,
    onSuccess: (response) => {
      if (response.data.success) {
        setCheckQrResult({
          success: true,
          message: response.data.message,
          data: response.data.data,
        });
      } else {
        setCheckQrResult({
          success: false,
          message: response.data.message,
          data: null,
        });
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Error checking Gift Code. Please try again.";
      setCheckQrResult({
        success: false,
        message: errorMessage,
        data: null,
      });
    },
  });

  // Computed dashboard stats
  const dashboardStats = useMemo(() => {
    if (isLoadingStats) {
      return [
        { title: "TOTAL USER", count: "Loading...", link: "/users" },
        { title: "TOTAL PRODUCT", count: "Loading...", link: "/products" },
        { title: "KYC REQUEST", count: "Loading...", link: "/kyc-requests" },
        {
          title: "WITHDRAWAL REQUEST",
          count: "Loading...",
          link: "/withdrawal-requests",
        },
      ];
    }

    if (statsError) {
      return [
        { title: "TOTAL USER", count: "Error", link: "/users" },
        { title: "TOTAL PRODUCT", count: "Error", link: "/products" },
        { title: "KYC REQUEST", count: "Error", link: "/kyc-requests" },
        {
          title: "WITHDRAWAL REQUEST",
          count: "Error",
          link: "/withdrawal-requests",
        },
      ];
    }

    if (dashboardData) {
      return [
        {
          title: "TOTAL USER",
          count: dashboardData.totalUsers.toLocaleString(),
          link: "/users",
        },
        {
          title: "TOTAL PRODUCT",
          count: dashboardData.totalProducts.toLocaleString(),
          link: "/products",
        },
        {
          title: "KYC REQUEST",
          count: dashboardData.pendingKYC.toString(),
          link: "/kyc-requests",
        },
        {
          title: "WITHDRAWAL REQUEST",
          count: dashboardData.withdrawalRequests.toString(),
          link: "/withdrawal-requests",
        },
      ];
    }

    return [];
  }, [dashboardData, isLoadingStats, statsError]);


  const handleCheckGiftCode = useCallback(async () => {
    if (!giftCode.trim()) {
      alert("Please enter a Gift Code");
      return;
    }

    setCheckQrResult(null);
    checkGiftCodeMutation.mutate(giftCode);
  }, [giftCode, checkGiftCodeMutation]);

  const handleRefresh = useCallback(() => {
    refetchStats();
    refetchTransactions();
    // Invalidate all dashboard related queries to force fresh data
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  }, [refetchStats, refetchTransactions, queryClient]);

  // Prefetch data for better UX
  const prefetchUserData = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ["users", "all"],
      queryFn: dashboardApi.getAllUsers,
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  const prefetchProductData = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ["products", "all"],
      queryFn: dashboardApi.getProducts,
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  // Date formatting function
  const formatDate = useCallback((dateString) => {
    try {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";

      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Error";
    }
  }, []);

  // Last updated display
  const lastUpdatedDisplay = useMemo(() => {
    if (!statsUpdatedAt) return null;

    const lastUpdated = new Date(statsUpdatedAt);
    return (
      <div className="flex items-center text-xs text-gray-500">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>
    );
  }, [statsUpdatedAt]);

  // Close popup handlers with cleanup
  const closeExplorePopup = useCallback(() => {
    setShowExploreAllPopup(false);
  }, []);

  const closeQrPopup = useCallback(() => {
    setShowQrPopup(false);
    setCheckQrResult(null);
    setGiftCode("");
    checkGiftCodeMutation.reset();
  }, [checkGiftCodeMutation]);

  // Error state
  const error = statsError || transactionsError;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C3E8FF] to-white px-10 pt-7 pb-12 space-y-8">
      {/* Header Bar */}
      <Header />

      {/* Welcome & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-2 items-center">
          <h1 className="text-2xl font-semibold text-black">
            Welcome back, Admin!
          </h1>
          <button
            onClick={handleRefresh}
            disabled={isLoadingStats}
            className="text-sm px-3 py-1 border border-gray-300 rounded-md text-gray-600 hover:text-blue-600 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Refresh dashboard stats"
          >
            {isLoadingStats ? (
              <div className="flex items-center space-x-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-600"></div>
                <span>Refreshing...</span>
              </div>
            ) : (
              "↻ Refresh"
            )}
          </button>
          {lastUpdatedDisplay}
          {error && (
            <span className="text-xs text-red-500 flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
              Failed to update
            </span>
          )}
          <label className="flex items-center text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-1 w-3 h-3"
            />
            Auto-refresh
          </label>
        </div>
        <div className="flex gap-8">
          <button
            onClick={() => setShowQrPopup(true)}
            className="border-2 border-[#333333] text-[#333333] font-semibold px-6 py-2 rounded-xl hover:bg-[#333333] hover:text-white transition text-sm"
          >
            Check QR
          </button>
          <button
            onClick={() => setShowExploreAllPopup(true)}
            className="bg-[#333333] text-white px-6 py-2 rounded-xl font-semibold hover:bg-black transition text-sm"
          >
            Explore All{" "}
            <FaArrowRightLong className="inline ml-2" strokeWidth={50} />
          </button>
          <ProductAddButton />
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-red-800 text-sm">
            ⚠️ {error?.message || "Failed to load data"}
          </span>
          <button
            onClick={handleRefresh}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {dashboardStats.map((item, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-[#FFFDED] to-[#DFE2F6] rounded-2xl shadow p-5 flex flex-col space-y-3"
          >
            <div className="flex items-center">
              <img
                src={profileIcon || "/placeholder.svg"}
                alt="profileIcon"
                className="w-10 h-10"
              />
            </div>
            <h2 className="text-black text-sm font-medium uppercase tracking-wide">
              {item.title}
            </h2>
            <p
              className={`text-4xl font-bold text-black ${
                isLoadingStats &&
                (item.count === "Loading..." || item.count === "Error")
                  ? "animate-pulse"
                  : ""
              }`}
            >
              {item.count}
            </p>
            <div className="flex justify-end">
              <Link
                to={item.link}
                className={`text-sm text-black font-medium hover:underline ${
                  isLoadingStats &&
                  (item.count === "Loading..." || item.count === "Error")
                    ? "pointer-events-none opacity-50"
                    : ""
                }`}
                onMouseEnter={() => {
                  // Prefetch data when user hovers over links
                  if (item.link === "/users") prefetchUserData();
                  if (item.link === "/products") prefetchProductData();
                }}
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-gray-300">
          <h2 className="font-semibold text-black">
            Transaction History
            {isLoadingTransactions && (
              <span className="text-sm text-gray-500 ml-2">Loading...</span>
            )}
          </h2>
          <Link
            to="/transaction-history"
            className="text-blue-500 font-semibold hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="overflow-auto rounded-xl">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="font-bold text-sm text-black border-b border-[#565454]">
                <th className="py-3">User ID</th>
                <th className="py-3">User Name</th>
                <th className="py-3">Phone</th>
                <th className="py-3">Product ID</th>
                <th className="py-3">Product Name</th>
                <th className="py-3">Date & Time</th>
                <th className="py-3 text-right pr-0 pl-0 w-10">Coins</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingTransactions ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      <span>Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((item, idx) => (
                  <tr
                    key={idx}
                    className="font-semibold text-sm text-black border-b border-[#565454] hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3">{item.userId || "N/A"}</td>
                    <td className="py-3">{item.userName || "N/A"}</td>
                    <td className="py-3">{item.contact || "N/A"}</td>
                    <td className="py-3">{item.productId || "N/A"}</td>
                    <td className="py-3">{item.productName || "N/A"}</td>
                    <td className="py-3 whitespace-nowrap">
                      {formatDate(item.scannedAt)}
                    </td>
                    <td className="py-3 text-right pr-0 pl-0 w-10">
                      {item.coinsEarned || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explore All Popup */}
      {showExploreAllPopup && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <div
            ref={exploreRef}
            className="bg-white rounded-3xl p-6 w-[320px] relative space-y-5 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-black">Explore All</h2>
              <button
                onClick={closeExplorePopup}
                className="text-black p-1 bg-gray-100 hover:bg-gray-200 rounded-full"
              >
                <IoMdClose size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { text: "Categories", link: "/category" },
                { text: "Promotions", link: "/promotion" },
                { text: "Offers", link: "/offers" },
                { text: "All Users", link: "/users" },
                { text: "All Products", link: "/products" },
                { text: "KYC Requests", link: "/kyc-requests" },
                { text: "Withdrawal Requests", link: "/withdrawal-requests" },
              ].map((label, idx) => (
                <Link
                  to={label.link}
                  key={idx}
                  className="w-full flex items-center justify-between border border-[#333333] rounded-2xl px-4 py-3 text-[#333333] text-sm font-medium hover:bg-gray-100 transition"
                  onClick={closeExplorePopup}
                >
                  {label.text}
                  <ChevronRight size={20} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Check QR Popup */}
      {showQrPopup && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <div
            ref={checkQrRef}
            className="bg-white rounded-2xl p-6 w-[500px] max-h-[90vh] overflow-y-auto relative space-y-5 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-black">Check Gift Code</h2>
              <button
                onClick={closeQrPopup}
                className="text-black p-1 hover:bg-gray-200 rounded-full"
              >
                <IoMdClose size={20} />
              </button>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-black">
                Gift Code
              </label>
              <input
                type="text"
                value={giftCode}
                onChange={(e) => setGiftCode(e.target.value)}
                placeholder="Enter Gift Code (e.g., GIFT123ABC)"
                className="w-full border-none outline-none bg-[#F1F4FF] rounded-lg px-4 py-3 text-sm text-black"
                disabled={checkGiftCodeMutation.isLoading}
                onKeyPress={(e) => {
                  if (
                    e.key === "Enter" &&
                    !checkGiftCodeMutation.isLoading &&
                    giftCode.trim()
                  ) {
                    handleCheckGiftCode();
                  }
                }}
              />
            </div>
            {checkQrResult && (
              <div
                className={`p-4 rounded-lg border-2 ${
                  checkQrResult.success
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <p
                  className={`text-sm font-medium mb-3 ${
                    checkQrResult.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {checkQrResult.message}
                </p>
                {checkQrResult.success && checkQrResult.data && (
                  <div className="space-y-3">
                    {/* Product and QR Images */}
                    <div className="grid grid-cols-2 gap-3">
                      {checkQrResult.data.productImage && (
                        <div>
                          <span className="text-xs font-medium text-green-700 block mb-1">
                            Product Image:
                          </span>
                          <img
                            src={
                              checkQrResult.data.productImage ||
                              "/placeholder.svg"
                            }
                            alt="Product"
                            className="w-full h-32 object-cover rounded-lg border border-green-200"
                          />
                        </div>
                      )}
                      {checkQrResult.data.qrCodeImage && (
                        <div>
                          <span className="text-xs font-medium text-green-700 block mb-1">
                            QR Code:
                          </span>
                          <img
                            src={
                              checkQrResult.data.qrCodeImage ||
                              "/placeholder.svg"
                            }
                            alt="QR Code"
                            className="w-full h-32 object-contain rounded-lg border border-green-200 bg-white p-2"
                          />
                        </div>
                      )}
                    </div>

                    {/* QR Details */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="font-medium text-green-700">
                          Product ID:
                        </span>
                        <p className="text-green-900 font-semibold">
                          {checkQrResult.data.productId}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-green-700">
                          Status:
                        </span>
                        <p
                          className={`font-semibold inline-block px-2 py-1 rounded-full text-xs ${
                            checkQrResult.data.qrStatus === "active"
                              ? "bg-green-200 text-green-800"
                              : checkQrResult.data.qrStatus === "scanned"
                              ? "bg-blue-200 text-blue-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {checkQrResult.data.qrStatus?.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-green-700">
                          Coin Value:
                        </span>
                        <p className="text-green-900 font-semibold">
                          {checkQrResult.data.coin} coins
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-green-700">
                          Created At:
                        </span>
                        <p className="text-green-900">
                          {formatDate(checkQrResult.data.qrCreatedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Scanned Info (if available) */}
                    {checkQrResult.data.scannedBy && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <span className="text-xs font-medium text-green-700 block mb-1">
                          Scanned Information:
                        </span>
                        <div className="text-xs space-y-1">
                          <p className="text-green-900">
                            <span className="font-medium">Scanned by:</span>{" "}
                            {checkQrResult.data.scannedBy}
                          </p>
                          <p className="text-green-900">
                            <span className="font-medium">Scanned at:</span>{" "}
                            {formatDate(checkQrResult.data.scannedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  setGiftCode("");
                  setCheckQrResult(null);
                  checkGiftCodeMutation.reset();
                }}
                className="flex-1 border border-black rounded-lg py-2 text-sm font-semibold hover:bg-gray-100 transition-colors"
                disabled={checkGiftCodeMutation.isLoading}
              >
                Clear
              </button>
              <button
                onClick={handleCheckGiftCode}
                className="flex-1 bg-black text-white rounded-lg py-2 text-sm font-semibold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={checkGiftCodeMutation.isLoading || !giftCode.trim()}
              >
                {checkGiftCodeMutation.isLoading ? "Checking..." : "Check Code"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
