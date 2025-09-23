"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Header from "../../components/header/Header";
import { IoIosArrowRoundBack, IoIosSearch, IoIosClose } from "react-icons/io";
import { Link } from "react-router-dom";
import { api } from "../../helpers/api/api";

export default function Users() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState(null);
  const usersPerPage = 9;

  // 🚀 Helper function to get status color and text
  const getStatusInfo = (status) => {
    switch (status) {
      case "verified":
        return {
          color: "bg-green-400",
          text: "Verified",
          textColor: "text-green-600",
          bgColor: "bg-green-50",
        };
      case "processing":
        return {
          color: "bg-yellow-400",
          text: "Processing",
          textColor: "text-yellow-600",
          bgColor: "bg-yellow-50",
        };
      case "rejected":
        return {
          color: "bg-red-400",
          text: "Rejected",
          textColor: "text-red-600",
          bgColor: "bg-red-50",
        };
      case "incomplete":
      default:
        return {
          color: "bg-gray-300",
          text: "Incomplete",
          textColor: "text-gray-500",
          bgColor: "bg-gray-50",
        };
    }
  };

  // 🚀 Helper function to get KYC status info
  const getKYCStatusInfo = (kycStatus) => {
    switch (kycStatus) {
      case "approved":
        return {
          color: "bg-green-100 text-green-800",
          text: "KYC Approved",
          icon: "✅",
        };
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800",
          text: "KYC Pending",
          icon: "⏳",
        };
      case "rejected":
        return {
          color: "bg-red-100 text-red-800",
          text: "KYC Rejected",
          icon: "❌",
        };
      case "incomplete":
      default:
        return {
          color: "bg-gray-100 text-gray-600",
          text: "KYC Incomplete",
          icon: "📋",
        };
    }
  };

  // 🚀 Enhanced API call with complete field mapping
  useEffect(() => {
    const getAllUsers = async () => {
      setUsersLoading(true);
      setError(null);

      try {
        const response = await api.get("/api/admin/all-users");

        if (response.data.success) {
          // 🔧 Complete data transformation with all new fields
          const transformedUsers = response.data.data.map((user, index) => ({
            id: user._id || `user_${index}`,
            userId: user.userId || "",
            name: user.fullName || "Unknown User",
            phone: user.phone || "No phone",
            image: user.profilePick || "/placeholder.svg?height=48&width=48",
            role: "User",
            email: user.email || "No email",
            dateOfBirth: user.dob || "Not provided",
            address: user.address || "Not provided",
            pinCode: user.pinCode || "Not provided",
            state: user.state || "Not provided",
            country: user.country || "Not provided",
            accountNumber: user.accountNumber
              ? "****" + user.accountNumber.slice(-4)
              : "Not provided",
            accountHolder:
              user.accountHolderName || user.fullName || "Not provided",
            bankName: user.bankName || "Not provided",
            ifsc: user.ifscCode || "Not provided",
            coinsEarned: user.coinsEarned || 0,
            scanHistory: user.scanHistory || "Not provided",

            // 🚀 NEW: Complete status-based verification fields
            panVerificationStatus: user.panVerificationStatus || "incomplete",
            aadharVerificationStatus:
              user.aadharVerificationStatus || "incomplete",
            passbookVerificationStatus:
              user.passbookVerificationStatus || "incomplete",
            panRejectionReason: user.panRejectionReason || "",
            aadharRejectionReason: user.aadharRejectionReason || "",
            passbookRejectionReason: user.passbookRejectionReason || "",

            // 🚀 NEW: KYC status fields
            kycStatus: user.kycStatus || "incomplete",
            kycRequestDate: user.kycRequestDate,
            kycApprovalDate: user.kycApprovalDate,
            kycRejectionReason: user.kycRejectionReason || "",
            isProfileComplete: user.isProfileComplete || false,

            // Legacy boolean fields for backward compatibility
            isPanVerified: user.panVerificationStatus === "verified",
            isAadharVerified: user.aadharVerificationStatus === "verified",
            isPassbookVerified: user.passbookVerificationStatus === "verified",

            // Document URLs
            panPhoto: user.panPhoto,
            aadharPhoto: user.aadharPhoto,
            passbookPhoto: user.passbookPhoto,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          }));

          setUsers(transformedUsers);
          console.log("✅ Users loaded:", transformedUsers.length);
        } else {
          setError("Failed to fetch users from server");
        }
      } catch (err) {
        console.error("❌ API Error:", err);
        setError(err.response?.data?.message || "Network error occurred");
      } finally {
        setUsersLoading(false);
      }
    };

    getAllUsers();
  }, []);

  // 🚀 Optimized search with useMemo
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;

    const term = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.phone.includes(searchTerm) ||
        user.email.toLowerCase().includes(term) ||
        user.userId.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);
  // 🚀 Optimized pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    return filteredUsers.slice(startIndex, startIndex + usersPerPage);
  }, [filteredUsers, currentPage, usersPerPage]);

  // 🚀 Optimized callbacks with useCallback
  const handleViewDetails = useCallback((contact) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedUser(contact);
      setIsLoading(false);
    }, 200);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedUser(null);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    setSelectedUser(null);
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
    setSelectedUser(null);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  const handleViewDocument = useCallback((documentUrl, documentType) => {
    if (documentUrl && documentUrl !== "Not provided") {
      window.open(documentUrl, "_blank");
    } else {
      alert(`${documentType} not uploaded yet`);
    }
  }, []);

  // 🚀 Loading state
  if (usersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#C3E8FF] to-white">
        <div className="px-4 sm:px-6 lg:px-10 pt-7 pb-12 space-y-6">
          <Header />
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700 font-semibold">Loading users...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🚀 Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#C3E8FF] to-white">
        <div className="px-4 sm:px-6 lg:px-10 pt-7 pb-12 space-y-6">
          <Header />
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                Error Loading Users
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C3E8FF] to-white">
      <div className="px-4 sm:px-6 lg:px-10 pt-7 pb-12 space-y-6">
        <Header />

        {/* Header with back button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="font-semibold text-black text-lg flex items-center">
            <Link to="/">
              <IoIosArrowRoundBack size={35} className="mr-1 text-black" />
            </Link>
            Registered Users ({filteredUsers.length})
          </h2>

          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoIosSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <IoIosClose className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          Showing {currentContacts.length} of {filteredUsers.length} users
          {searchTerm && ` for "${searchTerm}"`}
        </div>

        {/* Main content */}
        <div className="relative">
          {!selectedUser ? (
            <div className="space-y-6">
              {/* Users grid */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {currentContacts.map((contact) => {
                  const kycInfo = getKYCStatusInfo(contact.kycStatus);
                  return (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <img
                          src={contact.image || "/placeholder.svg"}
                          alt={contact.name}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {contact.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {contact.phone}
                          </p>
                          {/* 🚀 Enhanced status indicators */}
                          <div className="flex items-center space-x-2 mt-1">
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${
                                getStatusInfo(contact.panVerificationStatus)
                                  .color
                              }`}
                              title={`PAN ${
                                getStatusInfo(contact.panVerificationStatus)
                                  .text
                              }`}
                            />
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${
                                getStatusInfo(contact.aadharVerificationStatus)
                                  .color
                              }`}
                              title={`Aadhar ${
                                getStatusInfo(contact.aadharVerificationStatus)
                                  .text
                              }`}
                            />
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${
                                getStatusInfo(
                                  contact.passbookVerificationStatus
                                ).color
                              }`}
                              title={`Passbook ${
                                getStatusInfo(
                                  contact.passbookVerificationStatus
                                ).text
                              }`}
                            />
                            <span className="text-xs text-gray-400">
                              {contact.coinsEarned} coins
                            </span>
                          </div>
                          {/* 🚀 KYC Status Badge */}
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${kycInfo.color}`}
                            >
                              <span className="mr-1">{kycInfo.icon}</span>
                              {kycInfo.text}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewDetails(contact)}
                        disabled={isLoading}
                        className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50 flex-shrink-0 ml-2"
                      >
                        {isLoading ? "Loading..." : "View Details"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex space-x-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-1 text-sm rounded-md ${
                                currentPage === pageNum
                                  ? "bg-blue-600 text-white"
                                  : "border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // 🚀 Enhanced User details view
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
              {/* Left side - User list (hidden on mobile) */}
              <div className="hidden lg:block lg:w-1/3">
                <div className="bg-white rounded-xl shadow-sm h-full flex flex-col">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">All Users</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {filteredUsers.map((contact) => {
                      const kycInfo = getKYCStatusInfo(contact.kycStatus);
                      return (
                        <div
                          key={contact.id}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                            selectedUser.id === contact.id
                              ? "bg-blue-50 border border-blue-200"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => handleViewDetails(contact)}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <img
                              src={contact.image || "/placeholder.svg"}
                              alt={contact.name}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                              loading="lazy"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {contact.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {contact.phone}
                              </p>
                              <div className="flex items-center space-x-1 mt-1">
                                <span className="text-xs">{kycInfo.icon}</span>
                                <span className="text-xs text-gray-400">
                                  {contact.coinsEarned} coins
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right side - Enhanced User details */}
              <div className="w-full lg:w-2/3">
                <div className="bg-white rounded-xl shadow-sm h-full flex flex-col">
                  {/* 🚀 Enhanced Header with more info */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleCloseDetails}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
                      >
                        <IoIosArrowRoundBack size={24} />
                      </button>
                      <img
                        src={selectedUser.image || "/placeholder.svg"}
                        alt={selectedUser.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {selectedUser.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ID: {selectedUser.userId} • {selectedUser.coinsEarned}{" "}
                          coins
                        </p>
                        {/* 🚀 KYC Status in header */}
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                              getKYCStatusInfo(selectedUser.kycStatus).color
                            }`}
                          >
                            <span className="mr-1">
                              {getKYCStatusInfo(selectedUser.kycStatus).icon}
                            </span>
                            {getKYCStatusInfo(selectedUser.kycStatus).text}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {/* 🚀 Enhanced verification status */}
                      <div className="flex space-x-1">
                        <span
                          className={`inline-block w-3 h-3 rounded-full ${
                            getStatusInfo(selectedUser.panVerificationStatus)
                              .color
                          }`}
                          title={`PAN ${
                            getStatusInfo(selectedUser.panVerificationStatus)
                              .text
                          }`}
                        />
                        <span
                          className={`inline-block w-3 h-3 rounded-full ${
                            getStatusInfo(selectedUser.aadharVerificationStatus)
                              .color
                          }`}
                          title={`Aadhar ${
                            getStatusInfo(selectedUser.aadharVerificationStatus)
                              .text
                          }`}
                        />
                        <span
                          className={`inline-block w-3 h-3 rounded-full ${
                            getStatusInfo(
                              selectedUser.passbookVerificationStatus
                            ).color
                          }`}
                          title={`Passbook ${
                            getStatusInfo(
                              selectedUser.passbookVerificationStatus
                            ).text
                          }`}
                        />
                      </div>
                      <button
                        onClick={handleCloseDetails}
                        className="hidden lg:block p-2 hover:bg-gray-100 rounded-full"
                      >
                        <IoIosClose size={24} />
                      </button>
                    </div>
                  </div>

                  {/* 🚀 Enhanced Scrollable content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* 🚀 NEW: KYC Overview Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                      <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="mr-2">🔐</span>
                        KYC & Verification Overview
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              KYC Status
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                                getKYCStatusInfo(selectedUser.kycStatus).color
                              }`}
                            >
                              <span className="mr-1">
                                {getKYCStatusInfo(selectedUser.kycStatus).icon}
                              </span>
                              {getKYCStatusInfo(selectedUser.kycStatus).text}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Profile Complete
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                selectedUser.isProfileComplete
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {selectedUser.isProfileComplete
                                ? "✅ Yes"
                                : "❌ No"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {selectedUser.kycRequestDate && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                KYC Requested
                              </span>
                              <span className="text-sm font-medium text-gray-800">
                                {new Date(
                                  selectedUser.kycRequestDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {selectedUser.kycApprovalDate && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                KYC Approved
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                {new Date(
                                  selectedUser.kycApprovalDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedUser.kycRejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">
                            <strong>KYC Rejection Reason:</strong>{" "}
                            {selectedUser.kycRejectionReason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Personal Details */}
                    <div>
                      <h4 className="text-base font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2 flex items-center">
                        <span className="mr-2">👤</span>
                        Personal Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-600">
                              Full Name
                            </span>
                            <span className="text-sm font-medium text-gray-800">
                              {selectedUser.name}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-600">
                              Contact Number
                            </span>
                            <span className="text-sm font-medium text-gray-800">
                              {selectedUser.phone}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-600">
                              Email Address
                            </span>
                            <span className="text-sm font-medium text-gray-800">
                              {selectedUser.email}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-600">
                              Date of Birth
                            </span>
                            <span className="text-sm font-medium text-gray-800">
                              {selectedUser.dateOfBirth}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-600">
                              Permanent Address
                            </span>
                            <span className="text-sm font-medium text-gray-800">
                              {selectedUser.address}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-600">
                              Pin Code
                            </span>
                            <span className="text-sm font-medium text-gray-800">
                              {selectedUser.pinCode}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-600">State</span>
                            <span className="text-sm font-medium text-gray-800">
                              {selectedUser.state}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-600">
                              Country
                            </span>
                            <span className="text-sm font-medium text-gray-800">
                              {selectedUser.country}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bank Details */}
                    <div>
                      <h4 className="text-base font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2 flex items-center">
                        <span className="mr-2">🏦</span>
                        Bank Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-600">
                              Account Number
                            </span>
                            <span className="text-sm font-medium text-gray-800 font-mono">
                              {selectedUser.accountNumber}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-600">
                              Account Holder Name
                            </span>
                            <span className="text-sm font-medium text-gray-800">
                              {selectedUser.accountHolder}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-600">
                              Bank Name
                            </span>
                            <span className="text-sm font-medium text-gray-800">
                              {selectedUser.bankName}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-600">
                              IFSC Code
                            </span>
                            <span className="text-sm font-medium text-gray-800 font-mono">
                              {selectedUser.ifsc}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 🚀 Enhanced Documents Section */}
                    <div>
                      <h4 className="text-base font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2 flex items-center">
                        <span className="mr-2">📄</span>
                        Documents & Verification Status
                      </h4>
                      <div className="space-y-4">
                        {/* PAN Card */}
                        <div
                          className={`p-4 rounded-lg border-2 ${
                            getStatusInfo(selectedUser.panVerificationStatus)
                              .bgColor
                          } ${
                            selectedUser.panVerificationStatus === "verified"
                              ? "border-green-200"
                              : selectedUser.panVerificationStatus ===
                                "rejected"
                              ? "border-red-200"
                              : selectedUser.panVerificationStatus ===
                                "processing"
                              ? "border-yellow-200"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">🆔</span>
                              <div>
                                <span className="text-sm font-medium text-gray-700">
                                  PAN Card
                                </span>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                                      getStatusInfo(
                                        selectedUser.panVerificationStatus
                                      ).textColor
                                    } bg-white bg-opacity-70`}
                                  >
                                    <span
                                      className={`inline-block w-2 h-2 rounded-full mr-1 ${
                                        getStatusInfo(
                                          selectedUser.panVerificationStatus
                                        ).color
                                      }`}
                                    />
                                    {
                                      getStatusInfo(
                                        selectedUser.panVerificationStatus
                                      ).text
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {selectedUser.panRejectionReason && (
                            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-600">
                                <strong>❌ Rejection Reason:</strong>{" "}
                                {selectedUser.panRejectionReason}
                              </p>
                            </div>
                          )}

                          <button
                            onClick={() =>
                              handleViewDocument(
                                selectedUser.panPhoto,
                                "PAN Card"
                              )
                            }
                            className={`flex items-center justify-center space-x-2 text-sm font-medium px-4 py-2 rounded-md transition-colors duration-200 w-full ${
                              selectedUser.panPhoto &&
                              selectedUser.panPhoto !== "Not provided"
                                ? "text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                                : "text-gray-400 bg-gray-100 cursor-not-allowed border border-gray-200"
                            }`}
                            disabled={
                              !selectedUser.panPhoto ||
                              selectedUser.panPhoto === "Not provided"
                            }
                          >
                            <span>👁</span>
                            <span>
                              {selectedUser.panPhoto &&
                              selectedUser.panPhoto !== "Not provided"
                                ? "View Document"
                                : "Document Not Uploaded"}
                            </span>
                          </button>
                        </div>

                        {/* Aadhar Card */}
                        <div
                          className={`p-4 rounded-lg border-2 ${
                            getStatusInfo(selectedUser.aadharVerificationStatus)
                              .bgColor
                          } ${
                            selectedUser.aadharVerificationStatus === "verified"
                              ? "border-green-200"
                              : selectedUser.aadharVerificationStatus ===
                                "rejected"
                              ? "border-red-200"
                              : selectedUser.aadharVerificationStatus ===
                                "processing"
                              ? "border-yellow-200"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">🏛️</span>
                              <div>
                                <span className="text-sm font-medium text-gray-700">
                                  Aadhar Card
                                </span>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                                      getStatusInfo(
                                        selectedUser.aadharVerificationStatus
                                      ).textColor
                                    } bg-white bg-opacity-70`}
                                  >
                                    <span
                                      className={`inline-block w-2 h-2 rounded-full mr-1 ${
                                        getStatusInfo(
                                          selectedUser.aadharVerificationStatus
                                        ).color
                                      }`}
                                    />
                                    {
                                      getStatusInfo(
                                        selectedUser.aadharVerificationStatus
                                      ).text
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {selectedUser.aadharRejectionReason && (
                            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-600">
                                <strong>❌ Rejection Reason:</strong>{" "}
                                {selectedUser.aadharRejectionReason}
                              </p>
                            </div>
                          )}

                          <button
                            onClick={() =>
                              handleViewDocument(
                                selectedUser.aadharPhoto,
                                "Aadhar Card"
                              )
                            }
                            className={`flex items-center justify-center space-x-2 text-sm font-medium px-4 py-2 rounded-md transition-colors duration-200 w-full ${
                              selectedUser.aadharPhoto &&
                              selectedUser.aadharPhoto !== "Not provided"
                                ? "text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                                : "text-gray-400 bg-gray-100 cursor-not-allowed border border-gray-200"
                            }`}
                            disabled={
                              !selectedUser.aadharPhoto ||
                              selectedUser.aadharPhoto === "Not provided"
                            }
                          >
                            <span>👁</span>
                            <span>
                              {selectedUser.aadharPhoto &&
                              selectedUser.aadharPhoto !== "Not provided"
                                ? "View Document"
                                : "Document Not Uploaded"}
                            </span>
                          </button>
                        </div>

                        {/* Passbook */}
                        <div
                          className={`p-4 rounded-lg border-2 ${
                            getStatusInfo(
                              selectedUser.passbookVerificationStatus
                            ).bgColor
                          } ${
                            selectedUser.passbookVerificationStatus ===
                            "verified"
                              ? "border-green-200"
                              : selectedUser.passbookVerificationStatus ===
                                "rejected"
                              ? "border-red-200"
                              : selectedUser.passbookVerificationStatus ===
                                "processing"
                              ? "border-yellow-200"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">📖</span>
                              <div>
                                <span className="text-sm font-medium text-gray-700">
                                  Bank Passbook
                                </span>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                                      getStatusInfo(
                                        selectedUser.passbookVerificationStatus
                                      ).textColor
                                    } bg-white bg-opacity-70`}
                                  >
                                    <span
                                      className={`inline-block w-2 h-2 rounded-full mr-1 ${
                                        getStatusInfo(
                                          selectedUser.passbookVerificationStatus
                                        ).color
                                      }`}
                                    />
                                    {
                                      getStatusInfo(
                                        selectedUser.passbookVerificationStatus
                                      ).text
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {selectedUser.passbookRejectionReason && (
                            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-600">
                                <strong>❌ Rejection Reason:</strong>{" "}
                                {selectedUser.passbookRejectionReason}
                              </p>
                            </div>
                          )}

                          <button
                            onClick={() =>
                              handleViewDocument(
                                selectedUser.passbookPhoto,
                                "Passbook"
                              )
                            }
                            className={`flex items-center justify-center space-x-2 text-sm font-medium px-4 py-2 rounded-md transition-colors duration-200 w-full ${
                              selectedUser.passbookPhoto &&
                              selectedUser.passbookPhoto !== "Not provided"
                                ? "text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                                : "text-gray-400 bg-gray-100 cursor-not-allowed border border-gray-200"
                            }`}
                            disabled={
                              !selectedUser.passbookPhoto ||
                              selectedUser.passbookPhoto === "Not provided"
                            }
                          >
                            <span>👁</span>
                            <span>
                              {selectedUser.passbookPhoto &&
                              selectedUser.passbookPhoto !== "Not provided"
                                ? "View Document"
                                : "Document Not Uploaded"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 🚀 Account Statistics */}
                    <div>
                      <h4 className="text-base font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2 flex items-center">
                        <span className="mr-2">📊</span>
                        Account Statistics
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">🪙</span>
                            <div>
                              <p className="text-sm text-gray-600">
                                Coins Earned
                              </p>
                              <p className="text-lg font-semibold text-green-600">
                                {selectedUser.coinsEarned}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">🆔</span>
                            <div>
                              <p className="text-sm text-gray-600">User ID</p>
                              <p className="text-sm font-mono font-semibold text-blue-600">
                                {selectedUser.userId}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">📅</span>
                            <div>
                              <p className="text-sm text-gray-600">
                                Member Since
                              </p>
                              <p className="text-sm font-semibold text-purple-600">
                                {selectedUser.createdAt
                                  ? new Date(
                                      selectedUser.createdAt
                                    ).toLocaleDateString()
                                  : "Unknown"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2 text-blue-500 text-xl">💳</span>
                        Scan History
                      </h4>

                      {Array.isArray(selectedUser.scanHistory) &&
                      selectedUser.scanHistory.length > 0 ? (
                        <>
                          {/* Summary Section */}
                          <div className="flex justify-between items-center bg-blue-50 border border-blue-100 rounded-md p-3 mb-4 text-sm text-blue-800 font-medium">
                            <span>
                              🧾 Total Scanned:{" "}
                              {selectedUser.scanHistory.length} items
                            </span>
                            <span>
                              🪙 Total Coins Earned: {selectedUser.coinsEarned}
                            </span>
                          </div>

                          {/* Scrollable List */}
                          <div className="max-h-80 overflow-y-auto pr-1 space-y-3">
                            {selectedUser.scanHistory.map((item, index) => (
                              <div
                                key={item._id || index}
                                className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition duration-200 ease-in-out"
                              >
                                <div className="text-sm text-gray-800">
                                  <span className="font-medium text-blue-600">
                                    📦 Product:
                                  </span>{" "}
                                  {item.productName}
                                </div>
                                <div className="text-sm text-gray-700">
                                  <span className="font-medium text-green-600">
                                    🏷️ Category:
                                  </span>{" "}
                                  {item.categoryName}
                                </div>
                                <div className="text-sm text-gray-700">
                                  <span className="font-medium text-yellow-600">
                                    🪙 Coins Earned:
                                  </span>{" "}
                                  {item.coinsEarned}
                                </div>
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium text-purple-600">
                                    📅 Scanned At:
                                  </span>{" "}
                                  {new Date(item.scannedAt).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          No scan history available.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* No results message */}
        {filteredUsers.length === 0 && !usersLoading && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">
              {searchTerm
                ? `No users found for "${searchTerm}"`
                : "No users found"}
            </div>
            <div className="text-gray-400 text-sm">
              {searchTerm
                ? "Try adjusting your search terms"
                : "No users have been registered yet"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
