/* eslint-disable no-unused-vars */
"use client"

import { useState, useRef, useEffect } from "react"
import Header from "../../components/header/Header"
import { Link } from "react-router-dom"
import { IoIosArrowRoundBack } from "react-icons/io"
import { Camera, Upload, Loader2, TestTube } from "lucide-react"
import toast from "react-hot-toast"
import { api } from "../../helpers/api/api"

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [qrResult, setQrResult] = useState("")
  const [manualInput, setManualInput] = useState("")
  const [testUserId, setTestUserId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scanHistory, setScanHistory] = useState([])
  const [testMode, setTestMode] = useState(true) // Default to test mode for admin
  const fileInputRef = useRef(null)

  // Load scan history from localStorage
  useEffect(() => {
    const history = localStorage.getItem("qr_scan_history")
    if (history) {
      setScanHistory(JSON.parse(history))
    }
  }, [])

  // Save to scan history
  const addToHistory = (result) => {
    const newHistory = [
      { qrData: result, timestamp: new Date().toISOString() },
      ...scanHistory.slice(0, 9), // Keep only last 10
    ]
    setScanHistory(newHistory)
    localStorage.setItem("qr_scan_history", JSON.stringify(newHistory))
  }

  // Handle file upload for QR scanning
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        // For demo purposes, we'll use a simple approach
        // In a real app, you'd use a QR code library like jsQR
        toast.info("QR scanning from image is not implemented in this demo. Please use manual input.")
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }

  // Submit QR data to backend
  const handleScanSubmit = async (qrData) => {
    if (!qrData.trim()) {
      toast.error("Please provide QR data")
      return
    }

    setIsSubmitting(true)
    try {
      let response

      if (testMode) {
        // Use admin test endpoint
        response = await api.post("/api/admin/test-qr-scan", {
          qrData: qrData.trim(),
          testUserId: testUserId.trim() || undefined,
        })
      } else {
        // Use regular user endpoint (requires user token)
        response = await api.post("/api/user/scan-qr", { qrData: qrData.trim() })
      }

      if (response.data.success) {
        toast.success(response.data.message)
        addToHistory(qrData)
        setQrResult("")
        setManualInput("")

        // Show detailed success info
        const data = response.data.data
        if (data.coinsEarned) {
          setTimeout(() => {
            toast.success(`🎉 +${data.coinsEarned} coins! ${data.totalCoins ? `Total: ${data.totalCoins}` : ""}`, {
              duration: 5000,
            })
          }, 1000)
        }
      }
    } catch (error) {
      console.error("QR Scan Error:", error)
      const errorMessage = error.response?.data?.message || "Failed to scan QR code"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C3E8FF] to-white px-4 sm:px-6 lg:px-10 pt-7 pb-12 space-y-6">
      <Header />

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-black text-lg flex items-center">
          <Link to="/">
            <IoIosArrowRoundBack size={35} className="mr-1 text-black" />
          </Link>
          QR Code Scanner (Testing)
        </h2>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Test Mode Toggle */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Testing Mode
            </h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={testMode}
                onChange={(e) => setTestMode(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-blue-700">Admin Test Mode</span>
            </label>
          </div>
          <p className="text-sm text-blue-700">
            {testMode
              ? "✅ Using admin test endpoint - no user authentication required"
              : "⚠️ Using user endpoint - requires user authentication"}
          </p>

          {testMode && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-blue-700 mb-1">Test User ID (optional)</label>
              <input
                type="text"
                value={testUserId}
                onChange={(e) => setTestUserId(e.target.value)}
                placeholder="Enter user ID to test with specific user (leave empty for validation only)"
                className="w-full p-2 border border-blue-300 rounded-lg text-sm"
              />
              <p className="text-xs text-blue-600 mt-1">
                If provided, will actually update user coins. If empty, will only validate QR.
              </p>
            </div>
          )}
        </div>

        {/* Manual Input Method */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Manual QR Data Input
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Copy the QR code data from your generated QR and paste it here for testing.
          </p>
          <div className="space-y-4">
            <textarea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder='Paste QR data here (e.g., {"productId":"PROD_ABC123","type":"PRODUCT_QR",...})'
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24"
            />
            <button
              onClick={() => handleScanSubmit(manualInput)}
              disabled={isSubmitting || !manualInput.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Processing..." : testMode ? "Test QR Data" : "Submit QR Data"}
            </button>
          </div>
        </div>

        {/* File Upload Method */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Upload QR Image
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload a QR code image to scan (Note: This is a demo - real implementation would use jsQR library).
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Scans</h3>
            <div className="space-y-2">
              {scanHistory.map((scan, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-gray-800 truncate">
                      {scan.qrData.length > 50 ? `${scan.qrData.substring(0, 50)}...` : scan.qrData}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(scan.timestamp).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => setManualInput(scan.qrData)}
                    className="ml-2 text-blue-600 text-sm hover:underline"
                  >
                    Use Again
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Testing Instructions</h3>
          <ol className="text-sm text-yellow-700 space-y-2 list-decimal list-inside">
            <li>Go to Products page and create a product</li>
            <li>Click "View" on the product to see its QR code</li>
            <li>Right-click the QR image and inspect element to see the data</li>
            <li>Copy the QR data and paste it in the manual input above</li>
            <li>
              {testMode
                ? "Click 'Test QR Data' to test with admin privileges"
                : "Click 'Submit QR Data' to test with user authentication"}
            </li>
            <li>
              <strong>Note:</strong> QR codes never expire and remain valid indefinitely
            </li>
            {testMode && (
              <li className="text-blue-700">
                <strong>Admin Test Mode:</strong> You can test without user authentication. Provide a User ID to
                actually update coins, or leave empty for validation only.
              </li>
            )}
          </ol>
        </div>
      </div>
    </div>
  )
}
