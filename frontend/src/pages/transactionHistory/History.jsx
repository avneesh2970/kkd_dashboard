"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import Header from "../../components/header/Header"
import { IoIosArrowRoundBack } from "react-icons/io"
import { CiFilter } from "react-icons/ci"
import { Link } from "react-router-dom"
import { api } from "../../helpers/api/api"

export default function History() {
  // Real transaction state
  const [transactions, setTransactions] = useState([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const filterRef = useRef(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [isFiltered, setIsFiltered] = useState(false)

  // Export state
  const [isExporting, setIsExporting] = useState(false)

  // Optimized fetch function with retry logic
  const fetchTransactionHistory = useCallback(async (page = 1, limit = 20, append = false, retryCount = 0) => {
    try {
      if (!append) {
        setIsLoadingTransactions(true)
        setError(null)
      } else {
        setIsLoadingMore(true)
      }

      const response = await api.get(`/api/admin/transaction-history?page=${page}&limit=${limit}`)

      if (response.data.success) {
        const newTransactions = response.data.data || []

        if (append) {
          setTransactions((prev) => {
            // Prevent duplicates
            const existingIds = new Set(prev.map((t) => t.scanId || `${t.userId}_${t.scannedAt}`))
            const uniqueNew = newTransactions.filter((t) => !existingIds.has(t.scanId || `${t.userId}_${t.scannedAt}`))
            return [...prev, ...uniqueNew]
          })
        } else {
          setTransactions(newTransactions)
        }

        setTotalTransactions(response.data.pagination?.totalTransactions || newTransactions.length)
        setHasMore(response.data.pagination?.hasMore || false)
        setCurrentPage(page)
        setLastUpdated(new Date())

        console.log("✅ Transaction history loaded:", {
          page,
          count: newTransactions.length,
          total: response.data.pagination?.totalTransactions,
          timestamp: new Date().toISOString(),
        })
      } else {
        throw new Error(response.data.message || "Failed to fetch transactions")
      }
    } catch (error) {
      console.error("❌ Error fetching transaction history:", error)

      // Retry logic for network errors
      if (retryCount < 2 && (error.code === "NETWORK_ERROR" || error.response?.status >= 500)) {
        console.log(`🔄 Retrying fetch (attempt ${retryCount + 1})...`)
        setTimeout(
          () => {
            fetchTransactionHistory(page, limit, append, retryCount + 1)
          },
          1000 * (retryCount + 1),
        )
        return
      }

      setError(error.response?.data?.message || error.message || "Failed to load transactions")

      if (!append) {
        setTransactions([])
      }
    } finally {
      setIsLoadingTransactions(false)
      setIsLoadingMore(false)
    }
  }, [])

  // Optimized load more function
  const loadMoreTransactions = useCallback(() => {
    if (!isLoadingMore && hasMore && !error) {
      fetchTransactionHistory(currentPage + 1, 20, true)
    }
  }, [isLoadingMore, hasMore, currentPage, error, fetchTransactionHistory])

  // Optimized date formatting with error handling
  const formatDate = useCallback((dateString) => {
    try {
      if (!dateString) return "N/A"

      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        console.warn("Invalid date string:", dateString)
        return "Invalid Date"
      }

      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch (error) {
      console.error("Error formatting date:", error, "Date string:", dateString)
      return "Error"
    }
  }, [])

  // Optimized filter function with memoization
  const applyDateFilter = useCallback(() => {
    if (!startDate && !endDate) {
      setFilteredTransactions([])
      setIsFiltered(false)
      return
    }

    const startTime = startDate ? new Date(startDate).getTime() : 0
    const endTime = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Number.POSITIVE_INFINITY

    const filtered = transactions.filter((transaction) => {
      try {
        const transactionTime = new Date(transaction.scannedAt).getTime()
        return transactionTime >= startTime && transactionTime <= endTime
      } catch (error) {
        console.warn("Error filtering transaction:", transaction, error)
        return false
      }
    })

    setFilteredTransactions(filtered)
    setIsFiltered(true)
    console.log(`✅ Filtered ${filtered.length} transactions from ${transactions.length} total`)
  }, [transactions, startDate, endDate])

  // Optimized CSV export with better error handling
  const exportToCSV = useCallback(async () => {
    try {
      setIsExporting(true)

      // Use current data if filtered, otherwise fetch all
      let dataToExport
      if (isFiltered) {
        dataToExport = filteredTransactions
      } else {
        const response = await api.get("/api/admin/transaction-history?limit=10000")
        if (response.data.success) {
          dataToExport = response.data.data || []
        } else {
          throw new Error("Failed to fetch data for export")
        }
      }

      if (dataToExport.length === 0) {
        alert("No data to export")
        return
      }

      // Create CSV content with proper escaping
      const headers = ["User ID", "User Name", "Contact", "Product ID", "Product Name", "Date & Time", "Coins Earned"]
      const csvContent = [
        headers.join(","),
        ...dataToExport.map((transaction) => {
          const escapeCsvField = (field) => {
            if (field == null) return '""'
            const str = String(field)
            if (str.includes(",") || str.includes('"') || str.includes("\n")) {
              return `"${str.replace(/"/g, '""')}"`
            }
            return str
          }

          return [
            escapeCsvField(transaction.userId),
            escapeCsvField(transaction.userName),
            escapeCsvField(transaction.contact),
            escapeCsvField(transaction.productId),
            escapeCsvField(transaction.productName),
            escapeCsvField(formatDate(transaction.scannedAt)),
            escapeCsvField(transaction.coinsEarned),
          ].join(",")
        }),
      ].join("\n")

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `transaction_history_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url) // Clean up

      console.log(`✅ Exported ${dataToExport.length} transactions to CSV`)
    } catch (error) {
      console.error("❌ Error exporting CSV:", error)
      alert(`Failed to export CSV: ${error.message}. Please try again.`)
    } finally {
      setIsExporting(false)
    }
  }, [isFiltered, filteredTransactions, formatDate])

  const toggleFilter = useCallback(() => {
    setIsFilterOpen(!isFilterOpen)
  }, [isFilterOpen])

  const handleClean = useCallback(() => {
    setStartDate("")
    setEndDate("")
    setFilteredTransactions([])
    setIsFiltered(false)
    setIsFilterOpen(false)
  }, [])

  const handleApply = useCallback(() => {
    applyDateFilter()
    setIsFilterOpen(false)
  }, [applyDateFilter])

  // Refresh function
  const handleRefresh = useCallback(() => {
    setCurrentPage(1)
    setHasMore(false)
    fetchTransactionHistory(1, 20, false)
  }, [fetchTransactionHistory])

  // Memoized current transactions to display
  const currentTransactions = useMemo(() => {
    return isFiltered ? filteredTransactions : transactions
  }, [isFiltered, filteredTransactions, transactions])

  // Memoized transaction count display
  const transactionCountText = useMemo(() => {
    const count = isFiltered ? filteredTransactions.length : totalTransactions
    return `(${count.toLocaleString()} transaction${count !== 1 ? "s" : ""})`
  }, [isFiltered, filteredTransactions.length, totalTransactions])

  useEffect(() => {
    fetchTransactionHistory()

    const handleClickOutside = (event) => {
      if (isFilterOpen && filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isFilterOpen, fetchTransactionHistory])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C3E8FF] to-white px-10 pt-7 pb-12 space-y-8 relative">
      <Header />

      <div className={`space-y-3 ${isFilterOpen ? "blur-sm" : ""}`}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-black text-lg flex items-center">
            <Link to="/">
              <IoIosArrowRoundBack size={35} className="mr-1 text-black" />
            </Link>
            Transaction History
            <span className="ml-2 text-sm text-gray-600 font-normal">{transactionCountText}</span>
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isLoadingTransactions}
              className="ml-3 text-xs px-2 py-1 border border-gray-300 rounded text-gray-600 hover:text-blue-600 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Refresh transaction history"
            >
              {isLoadingTransactions ? "🔄" : "↻"}
            </button>
            {/* Last updated indicator */}
            {lastUpdated && !isLoadingTransactions && (
              <span className="ml-2 text-xs text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            {error && (
              <span className="ml-2 text-xs text-red-500 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                Failed to update
              </span>
            )}
          </h2>

          <div className="flex items-center gap-8">
            <button
              onClick={toggleFilter}
              className={`flex items-center gap-1 border-2 rounded-lg px-4 py-2 font-semibold transition-colors ${
                isFiltered
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-[#333333] text-[#333333] hover:bg-[#333333] hover:text-white"
              }`}
            >
              <CiFilter size={20} />
              Filter {isFiltered && "(Active)"}
            </button>

            <button
              onClick={exportToCSV}
              disabled={isExporting || currentTransactions.length === 0}
              className="bg-[#333333] hover:bg-black text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isExporting ? (
                <div className="flex items-center space-x-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                  <span>Exporting...</span>
                </div>
              ) : (
                "Download CSV"
              )}
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && !isLoadingTransactions && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
            <span className="text-red-800 text-sm">⚠️ {error}</span>
            <button onClick={handleRefresh} className="text-red-600 hover:text-red-800 text-sm font-medium">
              Retry
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoadingTransactions ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              <span className="text-gray-700 font-semibold">Loading transaction history...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Filter status */}
            {isFiltered && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                <span className="text-blue-800 text-sm">
                  Showing {filteredTransactions.length.toLocaleString()} filtered transactions
                  {startDate && ` from ${new Date(startDate).toLocaleDateString()}`}
                  {endDate && ` to ${new Date(endDate).toLocaleDateString()}`}
                </span>
                <button onClick={handleClean} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Clear Filter
                </button>
              </div>
            )}

            <div className="overflow-auto rounded-xl">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="font-bold text-sm text-black border-b border-[#565454]">
                    <th className="py-3">User ID</th>
                    <th className="py-3">User Name</th>
                    <th className="py-3">Contact Detail</th>
                    <th className="py-3">Product ID</th>
                    <th className="py-3">Product Name</th>
                    <th className="py-3">Date & Time</th>
                    <th className="py-3 text-right pr-0 pl-0 w-10">Coins</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-gray-500">
                        {isFiltered ? "No transactions found for the selected date range" : "No transactions found"}
                      </td>
                    </tr>
                  ) : (
                    currentTransactions.map((item, idx) => (
                      <tr
                        key={`${item.scanId || item.userId}_${idx}`}
                        className="font-semibold text-sm text-black border-b border-[#565454] hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3">{item.userId || "N/A"}</td>
                        <td className="py-3">{item.userName || "N/A"}</td>
                        <td className="py-3">{item.contact || "N/A"}</td>
                        <td className="py-3">{item.productId || "N/A"}</td>
                        <td className="py-3">{item.productName || "N/A"}</td>
                        <td className="py-3 whitespace-nowrap">{formatDate(item.scannedAt)}</td>
                        <td className="py-3 text-right pr-0 pl-0 w-10">{item.coinsEarned || 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Load More Button */}
            {!isFiltered && hasMore && !error && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={loadMoreTransactions}
                  disabled={isLoadingMore}
                  className="bg-[#333333] hover:bg-black text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoadingMore ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter popup */}
      {isFilterOpen && (
        <>
          <div
            className="fixed inset-0 bg-transparent backdrop-blur-md z-40"
            style={{
              WebkitBackdropFilter: "blur(5px)",
              backdropFilter: "blur(5px)",
            }}
          ></div>

          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative" ref={filterRef}>
              <h3 className="text-lg font-semibold mb-4">Filter Transactions</h3>
              <button
                onClick={toggleFilter}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate || new Date().toISOString().split("T")[0]}
                    className="w-full p-2 border rounded-lg bg-gray-50 focus:bg-white focus:border-blue-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full p-2 border rounded-lg bg-gray-50 focus:bg-white focus:border-blue-500 outline-none transition-colors"
                  />
                </div>

                {/* Filter preview */}
                {(startDate || endDate) && (
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <strong>Preview:</strong>
                    {startDate && ` From ${new Date(startDate).toLocaleDateString()}`}
                    {endDate && ` To ${new Date(endDate).toLocaleDateString()}`}
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <button
                    onClick={handleClean}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={!startDate && !endDate}
                    className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Apply Filter
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
