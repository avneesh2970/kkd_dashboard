// "use client";

// import { useState, useEffect } from "react";
// import { useParams, Link, useNavigate } from "react-router-dom";
// import { IoIosArrowRoundBack, IoMdDownload } from "react-icons/io";
// import {
//   FaQrcode,
//   FaCoins,
//   FaTag,
//   FaCalendar,
//   FaCheckCircle,
//   FaClock,
// } from "react-icons/fa";
// import { Loader2, AlertTriangle } from "lucide-react";
// import toast from "react-hot-toast";
// import { api } from "../../helpers/api/api";
// import Header from "../../components/header/Header";

// export default function ProductDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [product, setProduct] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState("overview");
//   const [qrStatus, setQrStatus] = useState("all");

//   useEffect(() => {
//     const fetchProduct = async () => {
//       setIsLoading(true);
//       try {
//         const response = await api.get(`/api/admin/products/${id}`);
//         setProduct(response.data.data);
//         setError(null);
//       } catch (err) {
//         console.error("Failed to fetch product:", err);
//         setError("Could not load product details. Please try again.");
//         toast.error("Failed to load product.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (id) {
//       fetchProduct();
//     }
//   }, [id]);

//   const downloadQRCode = (qrCodeImage, qrCode) => {
//     const link = document.createElement("a");
//     link.href = qrCodeImage;
//     link.download = `QR_${qrCode}.png`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     toast.success("QR Code downloaded!");
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "active":
//         return "bg-green-100 text-green-800 border-green-200";
//       case "scanned":
//         return "bg-blue-100 text-blue-800 border-blue-200";
//       case "disabled":
//         return "bg-red-100 text-red-800 border-red-200";
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-[#C3E8FF] to-white flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-700 font-semibold">
//             Loading product details...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !product) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-[#C3E8FF] to-white px-4 sm:px-6 lg:px-10 pt-7">
//         <Header />
//         <div className="text-center py-20">
//           <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
//           <h3 className="mt-2 text-lg font-medium text-red-600">
//             Loading Failed
//           </h3>
//           <p className="mt-1 text-sm text-gray-500">{error}</p>
//           <div className="mt-6 flex gap-3 justify-center">
//             <button
//               onClick={() => navigate("/products")}
//               className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
//             >
//               Back to Products
//             </button>
//             <button
//               onClick={() => window.location.reload()}
//               className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const activeQRCodes = product.qrCodes.filter(
//     (qr) => qr.qrStatus === "active"
//   );
//   const scannedQRCodes = product.qrCodes.filter(
//     (qr) => qr.qrStatus === "scanned"
//   );

//   // Choose which list to show based on dropdown selection
//   const filteredQRCodes =
//     qrStatus === "active"
//       ? activeQRCodes
//       : qrStatus === "scanned"
//       ? scannedQRCodes
//       : product.qrCodes;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[#C3E8FF] to-white px-4 sm:px-6 lg:px-10 pt-7 pb-12">
//       <Header />

//       {/* Back Button */}
//       <div className="mb-6">
//         <Link
//           to="/products"
//           className="inline-flex items-center text-gray-700 hover:text-black font-medium transition"
//         >
//           <IoIosArrowRoundBack size={32} className="mr-1" />
//           Back to Products
//         </Link>
//       </div>

//       {/* Product Header */}
//       <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
//         <div className="md:flex">
//           {/* Product Image */}
//           <div className="md:w-1/3 bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
//             <img
//               src={product.productImage || "/placeholder.svg"}
//               alt={product.productName}
//               className="w-full max-w-xs h-auto object-contain rounded-lg shadow-md"
//             />
//           </div>

//           {/* Product Info */}
//           <div className="md:w-2/3 p-8">
//             <div className="flex items-start justify-between mb-4">
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                   {product.productName}
//                 </h1>
//                 <p className="text-sm text-gray-500 font-mono">
//                   {product.productId}
//                 </p>
//               </div>
//               <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">
//                 <FaCoins className="text-yellow-600" />
//                 <span className="text-xl font-bold text-yellow-700">
//                   {product.coinReward}
//                 </span>
//                 <span className="text-sm text-yellow-600">coins</span>
//               </div>
//             </div>

//             {product.description && (
//               <p className="text-gray-700 mb-6 leading-relaxed">
//                 {product.description}
//               </p>
//             )}

//             {/* Stats Grid */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//               <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
//                 <div className="flex items-center gap-2 mb-1">
//                   <FaTag className="text-blue-600" />
//                   <span className="text-xs text-blue-600 font-medium">
//                     Category
//                   </span>
//                 </div>
//                 <p className="text-lg font-semibold text-blue-900">
//                   {product.category?.categoryName || "N/A"}
//                 </p>
//               </div>

//               <div className="bg-green-50 rounded-lg p-4 border border-green-100">
//                 <div className="flex items-center gap-2 mb-1">
//                   <FaCheckCircle className="text-green-600" />
//                   <span className="text-xs text-green-600 font-medium">
//                     Active QR
//                   </span>
//                 </div>
//                 <p className="text-lg font-semibold text-green-900">
//                   {activeQRCodes.length}
//                 </p>
//               </div>

//               <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
//                 <div className="flex items-center gap-2 mb-1">
//                   <FaClock className="text-purple-600" />
//                   <span className="text-xs text-purple-600 font-medium">
//                     Scanned
//                   </span>
//                 </div>
//                 <p className="text-lg font-semibold text-purple-900">
//                   {scannedQRCodes.length}
//                 </p>
//               </div>

//               <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//                 <div className="flex items-center gap-2 mb-1">
//                   <FaQrcode className="text-gray-600" />
//                   <span className="text-xs text-gray-600 font-medium">
//                     Total QR
//                   </span>
//                 </div>
//                 <p className="text-lg font-semibold text-gray-900">
//                   {product.qrCodes.length}
//                 </p>
//               </div>
//             </div>

//             {/* Timestamps */}
//             <div className="flex flex-wrap gap-4 text-sm text-gray-600">
//               <div className="flex items-center gap-2">
//                 <FaCalendar className="text-gray-400" />
//                 <span>Created: {formatDate(product.createdAt)}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <FaCalendar className="text-gray-400" />
//                 <span>Updated: {formatDate(product.updatedAt)}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
//         <div className="border-b border-gray-200">
//           <div className="flex">
//             <button
//               onClick={() => setActiveTab("overview")}
//               className={`px-6 py-4 font-medium transition ${
//                 activeTab === "overview"
//                   ? "border-b-2 border-blue-600 text-blue-600"
//                   : "text-gray-600 hover:text-gray-900"
//               }`}
//             >
//               Overview
//             </button>
//             <button
//               onClick={() => setActiveTab("qrcodes")}
//               className={`px-6 py-4 font-medium transition ${
//                 activeTab === "qrcodes"
//                   ? "border-b-2 border-blue-600 text-blue-600"
//                   : "text-gray-600 hover:text-gray-900"
//               }`}
//             >
//               QR Codes ({product.qrCodes.length})
//             </button>
//           </div>
//         </div>

//         <div className="p-6">
//           {activeTab === "overview" && (
//             <div className="space-y-6">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                   Product Information
//                 </h3>
//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div className="bg-gray-50 rounded-lg p-4">
//                     <p className="text-sm text-gray-600 mb-1">Product ID</p>
//                     <p className="font-mono font-semibold text-gray-900">
//                       {product.productId}
//                     </p>
//                   </div>
//                   <div className="bg-gray-50 rounded-lg p-4">
//                     <p className="text-sm text-gray-600 mb-1">Product Name</p>
//                     <p className="font-semibold text-gray-900">
//                       {product.productName}
//                     </p>
//                   </div>
//                   <div className="bg-gray-50 rounded-lg p-4">
//                     <p className="text-sm text-gray-600 mb-1">Category</p>
//                     <p className="font-semibold text-gray-900">
//                       {product.category?.categoryName || "N/A"}
//                     </p>
//                   </div>
//                   <div className="bg-gray-50 rounded-lg p-4">
//                     <p className="text-sm text-gray-600 mb-1">Coin Reward</p>
//                     <p className="font-semibold text-yellow-700 flex items-center gap-2">
//                       <FaCoins /> {product.coinReward} coins
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                   QR Code Statistics
//                 </h3>
//                 <div className="grid md:grid-cols-3 gap-4">
//                   <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
//                     <p className="text-sm text-green-700 mb-2">
//                       Active QR Codes
//                     </p>
//                     <p className="text-3xl font-bold text-green-900">
//                       {activeQRCodes.length}
//                     </p>
//                     <p className="text-xs text-green-600 mt-1">Ready to scan</p>
//                   </div>
//                   <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
//                     <p className="text-sm text-blue-700 mb-2">
//                       Scanned QR Codes
//                     </p>
//                     <p className="text-3xl font-bold text-blue-900">
//                       {scannedQRCodes.length}
//                     </p>
//                     <p className="text-xs text-blue-600 mt-1">Already used</p>
//                   </div>
//                   <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
//                     <p className="text-sm text-purple-700 mb-2">
//                       Total QR Codes
//                     </p>
//                     <p className="text-3xl font-bold text-purple-900">
//                       {product.qrCodes.length}
//                     </p>
//                     <p className="text-xs text-purple-600 mt-1">All codes</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === "qrcodes" && (
//             <div>
//               <div className="flex items-center justify-between mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   All QR Codes
//                 </h3>
//                 {/* <p className="text-sm text-gray-600">
//                   {product.qrCodes.length} code
//                   {product.qrCodes.length !== 1 ? "s" : ""} total
//                 </p> */}
//                 <select
//                   id="qrStatus"
//                   name="qrStatus"
//                   className="block w-full md:w-48 p-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
//                   onChange={(e) => setQrStatus(e.target.value)}
//                 >
//                   <option value="all">All</option>
//                   <option value="active">Active</option>
//                   <option value="scanned">Scanned</option>
//                 </select>
//               </div>

//               <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                 {[...filteredQRCodes].reverse().map((qr) => (
//                   <div
//                     key={qr._id}
//                     className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all hover:border-blue-300"
//                   >
//                     {/* QR Code Image */}
//                     <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center justify-center">
//                       <img
//                         src={qr.qrCodeImage || "/placeholder.svg"}
//                         alt={qr.qrCode}
//                         className="w-full h-auto max-w-[200px]"
//                       />
//                     </div>

//                     {/* QR Code Info */}
//                     <div className="space-y-3">
//                       <div className="flex justify-between">
//                         <div>
//                           <p className="text-xs text-gray-500 mb-1">
//                             Gift Code
//                           </p>
//                           <p className="font-mono text-sm font-semibold text-gray-900 break-all">
//                             {qr.qrCode}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-xs text-gray-500 mb-1">
//                             Created At
//                           </p>
//                           <p className="text-sm font-semibold text-gray-900">
//                             {qr.createdAt
//                               ? formatDate(qr.createdAt)
//                               : "not provided"}
//                           </p>
//                         </div>
//                       </div>

//                       <div>
//                         <p className="text-xs text-gray-500 mb-1">Status</p>
//                         <span
//                           className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
//                             qr.qrStatus
//                           )}`}
//                         >
//                           <span
//                             className={`w-2 h-2 mr-1.5 rounded-full ${
//                               qr.qrStatus === "active"
//                                 ? "bg-green-500"
//                                 : qr.qrStatus === "scanned"
//                                 ? "bg-blue-500"
//                                 : "bg-red-500"
//                             }`}
//                           ></span>
//                           {qr.qrStatus?.charAt(0).toUpperCase() +
//                             qr.qrStatus?.slice(1)}
//                         </span>
//                       </div>

//                       {qr.scannedBy && (
//                         <div>
//                           <p className="text-xs text-gray-500 mb-1">
//                             Scanned By
//                           </p>
//                           <p className="text-sm text-gray-900">
//                             {qr.scannedBy}
//                           </p>
//                         </div>
//                       )}

//                       {qr.scannedAt && (
//                         <div>
//                           <p className="text-xs text-gray-500 mb-1">
//                             Scanned At
//                           </p>
//                           <p className="text-sm text-gray-900">
//                             {formatDate(qr.scannedAt)}
//                           </p>
//                         </div>
//                       )}

//                       {/* Download Button */}
//                       <button
//                         onClick={() =>
//                           downloadQRCode(qr.qrCodeImage, qr.qrCode)
//                         }
//                         className="w-full mt-3 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
//                       >
//                         <IoMdDownload size={18} />
//                         Download
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {product.qrCodes.length === 0 && (
//                 <div className="text-center py-12">
//                   <FaQrcode className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//                   <p className="text-gray-600">
//                     No QR codes available for this product.
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack, IoMdDownload } from "react-icons/io";
import {
  FaQrcode,
  FaCoins,
  FaTag,
  FaCalendar,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import { Loader2, AlertTriangle, Download } from "lucide-react";
import toast from "react-hot-toast";
import JSZip from "jszip";
import { api } from "../../helpers/api/api";
import Header from "../../components/header/Header";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [qrStatus, setQrStatus] = useState("all");
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/api/admin/products/${id}`);
        setProduct(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Could not load product details. Please try again.");
        toast.error("Failed to load product.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const downloadQRCode = async (qrCodeImage, qrCode) => {
    try {
      const response = await fetch(qrCodeImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `QR_${qrCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("QR Code downloaded!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download QR code");
    }
  };

  const downloadBulkQRCodes = async (qrCodes, zipName) => {
    if (qrCodes.length === 0) {
      toast.error("No QR codes to download");
      return;
    }

    setIsBulkDownloading(true);
    const zip = new JSZip();
    const folder = zip.folder("qr-codes");

    try {
      // Fetch all QR code images and add to ZIP
      // eslint-disable-next-line no-unused-vars
      const downloadPromises = qrCodes.map(async (qr, index) => {
        try {
          const response = await fetch(qr.qrCodeImage);
          const blob = await response.blob();
          folder.file(`${qr.qrCode}.png`, blob);
        } catch (error) {
          console.error(`Failed to fetch QR code ${qr.qrCode}:`, error);
        }
      });

      await Promise.all(downloadPromises);

      // Generate ZIP file and trigger download
      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${zipName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Downloaded ${qrCodes.length} QR codes successfully!`);
    } catch (error) {
      console.error("Bulk download failed:", error);
      toast.error("Failed to download QR codes");
    } finally {
      setIsBulkDownloading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "scanned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "disabled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#C3E8FF] to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 font-semibold">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#C3E8FF] to-white px-4 sm:px-6 lg:px-10 pt-7">
        <Header />
        <div className="text-center py-20">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-lg font-medium text-red-600">
            Loading Failed
          </h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={() => navigate("/products")}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to Products
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeQRCodes = product.qrCodes.filter(
    (qr) => qr.qrStatus === "active"
  );
  const scannedQRCodes = product.qrCodes.filter(
    (qr) => qr.qrStatus === "scanned"
  );

  const filteredQRCodes =
    qrStatus === "active"
      ? activeQRCodes
      : qrStatus === "scanned"
      ? scannedQRCodes
      : product.qrCodes;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C3E8FF] to-white px-4 sm:px-6 lg:px-10 pt-7 pb-12">
      <Header />

      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/products"
          className="inline-flex items-center text-gray-700 hover:text-black font-medium transition"
        >
          <IoIosArrowRoundBack size={32} className="mr-1" />
          Back to Products
        </Link>
      </div>

      {/* Product Header */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
        <div className="md:flex">
          {/* Product Image */}
          <div className="md:w-1/3 bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
            <img
              src={product.productImage || "/placeholder.svg"}
              alt={product.productName}
              className="w-full max-w-xs h-auto object-contain rounded-lg shadow-md"
            />
          </div>

          {/* Product Info */}
          <div className="md:w-2/3 p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.productName}
                </h1>
                <p className="text-sm text-gray-500 font-mono">
                  {product.productId}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">
                <FaCoins className="text-yellow-600" />
                <span className="text-xl font-bold text-yellow-700">
                  {product.coinReward}
                </span>
                <span className="text-sm text-yellow-600">coins</span>
              </div>
            </div>

            {product.description && (
              <p className="text-gray-700 mb-6 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <FaTag className="text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">
                    Category
                  </span>
                </div>
                <p className="text-lg font-semibold text-blue-900">
                  {product.category?.categoryName || "N/A"}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <FaCheckCircle className="text-green-600" />
                  <span className="text-xs text-green-600 font-medium">
                    Active QR
                  </span>
                </div>
                <p className="text-lg font-semibold text-green-900">
                  {activeQRCodes.length}
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <FaClock className="text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium">
                    Scanned
                  </span>
                </div>
                <p className="text-lg font-semibold text-purple-900">
                  {scannedQRCodes.length}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <FaQrcode className="text-gray-600" />
                  <span className="text-xs text-gray-600 font-medium">
                    Total QR
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {product.qrCodes.length}
                </p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FaCalendar className="text-gray-400" />
                <span>Created: {formatDate(product.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendar className="text-gray-400" />
                <span>Updated: {formatDate(product.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-4 font-medium transition ${
                activeTab === "overview"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("qrcodes")}
              className={`px-6 py-4 font-medium transition ${
                activeTab === "qrcodes"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              QR Codes ({product.qrCodes.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Product Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Product ID</p>
                    <p className="font-mono font-semibold text-gray-900">
                      {product.productId}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Product Name</p>
                    <p className="font-semibold text-gray-900">
                      {product.productName}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="font-semibold text-gray-900">
                      {product.category?.categoryName || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Coin Reward</p>
                    <p className="font-semibold text-yellow-700 flex items-center gap-2">
                      <FaCoins /> {product.coinReward} coins
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  QR Code Statistics
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                    <p className="text-sm text-green-700 mb-2">
                      Active QR Codes
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {activeQRCodes.length}
                    </p>
                    <p className="text-xs text-green-600 mt-1">Ready to scan</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                    <p className="text-sm text-blue-700 mb-2">
                      Scanned QR Codes
                    </p>
                    <p className="text-3xl font-bold text-blue-900">
                      {scannedQRCodes.length}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">Already used</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                    <p className="text-sm text-purple-700 mb-2">
                      Total QR Codes
                    </p>
                    <p className="text-3xl font-bold text-purple-900">
                      {product.qrCodes.length}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">All codes</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "qrcodes" && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    All QR Codes
                  </h3>
                  <select
                    id="qrStatus"
                    name="qrStatus"
                    className="block w-full sm:w-48 p-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    onChange={(e) => setQrStatus(e.target.value)}
                    value={qrStatus}
                  >
                    <option value="all">All ({product.qrCodes.length})</option>
                    <option value="active">
                      Active ({activeQRCodes.length})
                    </option>
                    <option value="scanned">
                      Scanned ({scannedQRCodes.length})
                    </option>
                  </select>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      downloadBulkQRCodes(
                        filteredQRCodes,
                        `${product.productId}_${qrStatus}_qrcodes`
                      )
                    }
                    disabled={isBulkDownloading || filteredQRCodes.length === 0}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-md"
                  >
                    {isBulkDownloading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        Download{" "}
                        {qrStatus === "all"
                          ? "All"
                          : qrStatus.charAt(0).toUpperCase() +
                            qrStatus.slice(1)}{" "}
                        ({filteredQRCodes.length})
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...filteredQRCodes].reverse().map((qr) => (
                  <div
                    key={qr._id}
                    className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all hover:border-blue-300"
                  >
                    {/* QR Code Image */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center justify-center">
                      <img
                        src={qr.qrCodeImage || "/placeholder.svg"}
                        alt={qr.qrCode}
                        className="w-full h-auto max-w-[200px]"
                      />
                    </div>

                    {/* QR Code Info */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Gift Code
                          </p>
                          <p className="font-mono text-sm font-semibold text-gray-900 break-all">
                            {qr.qrCode}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Created At
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {qr.createdAt
                              ? formatDate(qr.createdAt)
                              : "not provided"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            qr.qrStatus
                          )}`}
                        >
                          <span
                            className={`w-2 h-2 mr-1.5 rounded-full ${
                              qr.qrStatus === "active"
                                ? "bg-green-500"
                                : qr.qrStatus === "scanned"
                                ? "bg-blue-500"
                                : "bg-red-500"
                            }`}
                          ></span>
                          {qr.qrStatus?.charAt(0).toUpperCase() +
                            qr.qrStatus?.slice(1)}
                        </span>
                      </div>

                      {qr.scannedBy && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Scanned By
                          </p>
                          <p className="text-sm text-gray-900">
                            {qr.scannedBy}
                          </p>
                        </div>
                      )}

                      {qr.scannedAt && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Scanned At
                          </p>
                          <p className="text-sm text-gray-900">
                            {formatDate(qr.scannedAt)}
                          </p>
                        </div>
                      )}

                      {/* Download Button */}
                      <button
                        onClick={() =>
                          downloadQRCode(qr.qrCodeImage, qr.qrCode)
                        }
                        className="w-full mt-3 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                      >
                        <IoMdDownload size={18} />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredQRCodes.length === 0 && (
                <div className="text-center py-12">
                  <FaQrcode className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    No {qrStatus !== "all" ? qrStatus : ""} QR codes available
                    for this product.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
