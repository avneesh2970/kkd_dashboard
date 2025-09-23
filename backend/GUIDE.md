# 🚀 KKD API Guide for Flutter Developers

**A complete, beginner-friendly guide to integrating our Express.js APIs into your Flutter mobile app.**

---

## 📚 Table of Contents

- [API Endpoints Overview](#-api-endpoints-overview)
- [Authentication APIs](#-authentication-apis)
  - [1. User Signup](#1️⃣-user-signup---post-request)
  - [2. User Login](#2️⃣-user-login---post-request)
- [User Profile APIs](#-user-profile-apis)
  - [3. Get User Profile](#3️⃣-get-user-profile---get-request)
  - [4. Update User Profile](#4️⃣-update-user-profile---put-request)
  - [5. Update Password](#5️⃣-update-password---put-request)
- [Document Upload APIs](#-document-upload-apis)
  - [6. Upload PAN Card](#6️⃣-upload-pan-card-photo---post-request)
  - [7. Upload Aadhar Card](#7️⃣-upload-aadhar-card-photo---post-request)
  - [8. Upload Bank Passbook](#8️⃣-upload-bank-passbook-photo---post-request)
- [Category & Content APIs](#-category--content-apis)
  - [9. Get All Categories](#9️⃣-get-all-categories---get-request)
  - [10. Get All Promotions](#1️⃣0️⃣-get-all-promotions---get-request)
- [Product APIs](#-product-apis)
  - [11. Get All Active Products](#1️⃣1️⃣-get-all-active-products---get-request)
  - [12. Get Single Product Details](#1️⃣2️⃣-get-single-product-details---get-request)
  - [13. Get Products by Category](#1️⃣3️⃣-get-products-by-category---get-request)
  - [14. Get Featured Products](#1️⃣4️⃣-get-featuredpopular-products---get-request)
- [QR Code Scanning API](#-qr-code-scanning-api)
  - [15. Scan QR Code for Coins](#1️⃣5️⃣-scan-qr-code-for-coins---post-request)
- [Complete Flutter Setup](#-complete-flutter-setup)
- [Error Handling Guide](#️-error-handling-guide)
- [Best Practices](#-important-notes--best-practices)
- [Testing & Resources](#-testing--resources)
- [Quick Start Checklist](#-quick-start-checklist)
- [What's New](#-whats-new-in-this-version)

---

## 📖 API Endpoints Overview

### 🔐 User Authentication APIs

| Method | Endpoint           | Description       | Auth Required |
| :----- | :----------------- | :---------------- | :------------ |
| `POST` | `/api/user/signup` | User Registration | ❌ No         |
| `POST` | `/api/user/login`  | User Login        | ❌ No         |

### 👤 User Profile APIs

| Method | Endpoint                    | Description         | Auth Required |
| :----- | :-------------------------- | :------------------ | :------------ |
| `GET`  | `/api/user/get-user`        | Get user profile    | ✅ Yes        |
| `PUT`  | `/api/user/update-profile`  | Update user profile | ✅ Yes        |
| `PUT`  | `/api/user/update-password` | Change password     | ✅ Yes        |

### 📄 Document Upload APIs

| Method | Endpoint                    | Description                | Auth Required |
| :----- | :-------------------------- | :------------------------- | :------------ |
| `POST` | `/api/user/upload-pan`      | Upload PAN card photo      | ✅ Yes        |
| `POST` | `/api/user/upload-aadhar`   | Upload Aadhar card photo   | ✅ Yes        |
| `POST` | `/api/user/upload-passbook` | Upload bank passbook photo | ✅ Yes        |

### 📂 Category & Content APIs

| Method | Endpoint                   | Description        | Auth Required |
| :----- | :------------------------- | :----------------- | :------------ |
| `GET`  | `/api/user/get-categories` | Get all categories | ✅ Yes        |
| `GET`  | `/api/user/get-promotions` | Get all promotions | ✅ Yes        |

### 🛍️ Product APIs

| Method | Endpoint                                  | Description                   | Auth Required |
| :----- | :---------------------------------------- | :---------------------------- | :------------ |
| `GET`  | `/api/user/products`                      | Get all active products       | ✅ Yes        |
| `GET`  | `/api/user/products/:productId`           | Get single product details    | ✅ Yes        |
| `GET`  | `/api/user/products/category/:categoryId` | Get products by category      | ✅ Yes        |
| `GET`  | `/api/user/products/featured`             | Get featured/popular products | ✅ Yes        |

### 🎯 QR Code Scanning API

| Method | Endpoint            | Description            | Auth Required |
| :----- | :------------------ | :--------------------- | :------------ |
| `POST` | `/api/user/scan-qr` | Scan QR code for coins | ✅ Yes        |

---

## 🔐 Authentication APIs

### 1️⃣ User Signup - `POST` Request

- **🌐 Endpoint:** `https://kkd-backend-api.onrender.com/api/user/signup`
- **📝 Method:** `POST`
- **🔒 Authentication:** Not Required

**📤 Request Body:**
\`\`\`json
{
  "fullName": "Ravish Bisht",
  "phone": "7060390453",
  "email": "ravishbisht03@gmail.com",
  "password": "123456"
}
\`\`\`

**✅ Success Response (201 Created):**
\`\`\`json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "userId": "ABC123XYZ456",
      "fullName": "Ravish Bisht",
      "phone": "7060390453",
      "email": "ravishbisht03@gmail.com",
      "coinsEarned": 0
    }
  }
}
\`\`\`

**❌ Error Response (409 Conflict):**
\`\`\`json
{
  "success": false,
  "message": "Email or Phone already registered"
}
\`\`\`

<details>
<summary>📱 Flutter Example</summary>

\`\`\`dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<Map<String, dynamic>> signupUser({
  required String fullName,
  required String phone,
  required String email,
  required String password,
}) async {
  try {
    final response = await http.post(
      Uri.parse('https://kkd-backend-api.onrender.com/api/user/signup'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'fullName': fullName,
        'phone': phone,
        'email': email,
        'password': password,
      }),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 201) {
      print('✅ Signup successful: ${data['message']}');
    } else {
      print('❌ Signup failed: ${data['message']}');
    }
    return data;
  } catch (e) {
    print('🌐 Network error: $e');
    return {'success': false, 'message': 'Network error occurred'};
  }
}
\`\`\`
</details>

---

### 2️⃣ User Login - `POST` Request

- **🌐 Endpoint:** `https://kkd-backend-api.onrender.com/api/user/login`
- **📝 Method:** `POST`
- **🔒 Authentication:** Not Required

**📤 Request Body:**
\`\`\`json
{
  "identifier": "ravishbisht03@gmail.com",
  "password": "123456"
}
\`\`\`
> **💡 Note:** `identifier` can be either an email or a phone number.

**✅ Success Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "ABC123XYZ456",
      "fullName": "Ravish Bisht",
      "email": "ravishbisht03@gmail.com",
      "phone": "7060390453",
      "coinsEarned": 0,
      "kycStatus": "incomplete",
      "isProfileComplete": false
    }
  }
}
\`\`\`

**❌ Error Response (401 Unauthorized):**
\`\`\`json
{
  "success": false,
  "message": "Invalid credentials"
}
\`\`\`

<details>
<summary>📱 Flutter Example</summary>

\`\`\`dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

Future<Map<String, dynamic>> loginUser({
  required String identifier, // email or phone
  required String password,
}) async {
  try {
    final response = await http.post(
      Uri.parse('https://kkd-backend-api.onrender.com/api/user/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'identifier': identifier,
        'password': password,
      }),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success']) {
      // Save token securely
      SharedPreferences prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', data['data']['token']);
      print('✅ Login successful!');
    } else {
      print('❌ Login failed: ${data['message']}');
    }
    return data;
  } catch (e) {
    print('🌐 Network error: $e');
    return {'success': false, 'message': 'Network error occurred'};
  }
}
\`\`\`
</details>

---

## 👤 User Profile APIs

### 3️⃣ Get User Profile - `GET` Request

- **🌐 Endpoint:** `https://kkd-backend-api.onrender.com/api/user/get-user`
- **📝 Method:** `GET`
- **🔒 Authentication:** Required (Bearer Token)

**📤 Request Headers:**
\`\`\`
Authorization: Bearer <your_auth_token>
\`\`\`

**✅ Success Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "User profile fetched",
  "data": {
    "userId": "ABC123XYZ456",
    "fullName": "Ravish Bisht",
    "email": "ravishbisht03@gmail.com",
    "phone": "7060390453",
    "profilePick": "https://cloudinary-url...",
    "coinsEarned": 150,
    "panVerificationStatus": "verified",
    "aadharVerificationStatus": "processing",
    "passbookVerificationStatus": "rejected",
    "passbookRejectionReason": "Document is not clear, please upload a clearer image",
    "kycStatus": "pending",
    "isProfileComplete": true,
    "scanHistory": [
      {
        "productName": "iPhone 15 Pro",
        "coinsEarned": 50,
        "scannedAt": "2023-07-15T14:30:00.000Z"
      }
    ]
  }
}
\`\`\`

**🔍 Status Values:**
- **Verification Status:** `incomplete`, `processing`, `verified`, `rejected`
- **KYC Status:** `incomplete`, `pending`, `approved`, `rejected`

<details>
<summary>📱 Flutter Example</summary>

\`\`\`dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

Future<Map<String, dynamic>> getUserProfile() async {
  try {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString('auth_token');

    if (token == null) {
      return {'success': false, 'message': 'No token found. Please login again.'};
    }

    final response = await http.get(
      Uri.parse('https://kkd-backend-api.onrender.com/api/user/get-user'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    return jsonDecode(response.body);
  } catch (e) {
    print('🌐 Network error: $e');
    return {'success': false, 'message': 'Network error occurred'};
  }
}
\`\`\`
</details>

---

### 4️⃣ Update User Profile - `PUT` Request

- **🌐 Endpoint:** `https://kkd-backend-api.onrender.com/api/user/update-profile`
- **📝 Method:** `PUT`
- **🔒 Authentication:** Required (Bearer Token)

> **💡 Note:** This endpoint supports both `application/json` for text data and `multipart/form-data` for file uploads (like a profile picture).

**📝 Updatable Fields:**
`fullName`, `dob`, `address`, `pinCode`, `state`, `country`, `accountNumber`, `accountHolderName`, `bankName`, `ifscCode`, `profilePick` (file).

#### Option A: JSON Update (Text fields only)

**📤 Request Body:**
\`\`\`json
{
  "fullName": "Updated Name",
  "dob": "1995-01-15",
  "address": "New Address Line"
}
\`\`\`

#### Option B: Multipart Update (With Profile Image)

**📤 Form Data:**
- Text fields: `fullName`, `dob`, `address`, etc.
- File field: `profilePick` (Image file - Max 5MB)

**✅ Success Response (with KYC Auto-trigger):**
\`\`\`json
{
  "success": true,
  "message": "Profile updated successfully! KYC verification request has been submitted.",
  "data": {
    "kycStatus": "pending",
    "isProfileComplete": true
  },
  "kycRequestCreated": true
}
\`\`\`

<details>
<summary>📱 Flutter Example (Multipart Update)</summary>

\`\`\`dart
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

Future<Map<String, dynamic>> updateProfileWithImage({
  String? fullName,
  File? profileImage,
}) async {
  try {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString('auth_token');
    if (token == null) return {'success': false, 'message': 'No token found'};

    var request = http.MultipartRequest(
      'PUT',
      Uri.parse('https://kkd-backend-api.onrender.com/api/user/update-profile'),
    );

    request.headers['Authorization'] = 'Bearer $token';
    if (fullName != null) request.fields['fullName'] = fullName;
    if (profileImage != null) {
      request.files.add(
        await http.MultipartFile.fromPath('profilePick', profileImage.path),
      );
    }

    var streamedResponse = await request.send();
    var response = await http.Response.fromStream(streamedResponse);
    return jsonDecode(response.body);
  } catch (e) {
    return {'success': false, 'message': 'Network error occurred'};
  }
}
\`\`\`
</details>

---

### 5️⃣ Update Password - `PUT` Request

- **🌐 Endpoint:** `https://kkd-backend-api.onrender.com/api/user/update-password`
- **📝 Method:** `PUT`
- **🔒 Authentication:** Required (Bearer Token)

**📤 Request Body:**
\`\`\`json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
\`\`\`

**✅ Success Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Password updated successfully"
}
\`\`\`

**❌ Error Response (400 Bad Request):**
\`\`\`json
{
  "success": false,
  "message": "Current password is incorrect"
}
\`\`\`

<details>
<summary>📱 Flutter Example</summary>

\`\`\`dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

Future<Map<String, dynamic>> updatePassword({
  required String currentPassword,
  required String newPassword,
}) async {
  try {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString('auth_token');
    if (token == null) return {'success': false, 'message': 'No token found'};

    final response = await http.put(
      Uri.parse('https://kkd-backend-api.onrender.com/api/user/update-password'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      }),
    );
    return jsonDecode(response.body);
  } catch (e) {
    return {'success': false, 'message': 'Network error occurred'};
  }
}
\`\`\`
</details>

---

## 📄 Document Upload APIs

> **💡 Note:** All document upload APIs use `multipart/form-data` and follow a similar structure. When all documents are uploaded and the profile is complete, a KYC request is automatically triggered.

### 6️⃣ Upload PAN Card Photo - `POST` Request
- **🌐 Endpoint:** `https://kkd-backend-api.onrender.com/api/user/upload-pan`
- **📤 Form Data:** `panPhoto` (Image file - Max 10MB)

### 7️⃣ Upload Aadhar Card Photo - `POST` Request
- **🌐 Endpoint:** `https://kkd-backend-api.onrender.com/api/user/upload-aadhar`
- **📤 Form Data:** `aadharPhoto` (Image file - Max 10MB)

### 8️⃣ Upload Bank Passbook Photo - `POST` Request
- **🌐 Endpoint:** `https://kkd-backend-api.onrender.com/api/user/upload-passbook`
- **📤 Form Data:** `passbookPhoto` (Image file - Max 10MB)

**✅ Success Response (with KYC Auto-trigger):**
\`\`\`json
{
  "success": true,
  "message": "PAN photo uploaded successfully. KYC verification request has been submitted.",
  "data": {
    "panPhoto": "https://res.cloudinary.com/.../pan/abc123.jpg",
    "panVerificationStatus": "processing",
    "kycStatus": "pending"
  },
  "kycRequestCreated": true
}
\`\`\`

<details>
<summary>📱 Flutter Example (Generic Document Upload)</summary>

\`\`\`dart
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

Future<Map<String, dynamic>> uploadDocument({
  required String documentType, // 'pan', 'aadhar', or 'passbook'
  required File documentFile,
}) async {
  try {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString('auth_token');
    if (token == null) return {'success': false, 'message': 'No token found'};

    var request = http.MultipartRequest(
      'POST',
      Uri.parse('https://kkd-backend-api.onrender.com/api/user/upload-$documentType'),
    );

    request.headers['Authorization'] = 'Bearer $token';
    request.files.add(
      await http.MultipartFile.fromPath('${documentType}Photo', documentFile.path),
    );

    var streamedResponse = await request.send();
    var response = await http.Response.fromStream(streamedResponse);
    return jsonDecode(response.body);
  } catch (e) {
    return {'success': false, 'message': 'Network error occurred'};
  }
}
\`\`\`
</details>

---

## 📂 Category & Content APIs

### 9️⃣ Get All Categories - `GET` Request
- **🌐 Endpoint:** `https://kkd-backend-api.onrender.com/api/user/get-categories`
- **✅ Success Response:** Returns a list of category objects.

### 1️⃣0️⃣ Get All Promotions - `GET` Request
- **🌐 Endpoint:** `https://kkd-backend-api.onrender.com/api/user/get-promotions`
- **✅ Success Response:** Returns a list of promotion objects.

<details>
<summary>📱 Flutter Example (Get Categories)</summary>

\`\`\`dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

Future<Map<String, dynamic>> getCategories() async {
  try {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString('auth_token');
    if (token == null) return {'success': false, 'message': 'No token found'};

    final response = await http.get(
      Uri.parse('https://kkd-backend-api.onrender.com/api/user/get-categories'),
      headers: {'Authorization': 'Bearer $token'},
    );
    return jsonDecode(response.body);
  } catch (e) {
    return {'success': false, 'message': 'Network error occurred'};
  }
}
\`\`\`
</details>

---

## 🛍️ Product APIs

### 1️⃣1️⃣ Get All Active Products - `GET` Request
- **🌐 Endpoint:** `https://kkd-backend-api.onrender.com/api/user/products`
- **쿼리 매개변수:** `category` (ID), `page` (number), `limit` (number), `search` (string)

### 1️⃣2️⃣ Get Single Product Details - `GET` Request
- **🌐 Endpoint:** `https://kkd-backend-api.onrender.com/api/user/products/:productId`

### 1️⃣3️⃣ Get Products by Category - `GET` Request
- **🌐 Endpoint:** `https://kkd-backend-api.onrender.com/api/user/products/category/:categoryId`

### 1️⃣4️⃣ Get Featured/Popular Products - `GET` Request
- **🌐 Endpoint:** `https://kkd-backend-api.onrender.com/api/user/products/featured`

**✅ Success Response (Get All Products):**
\`\`\`json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012350",
      "productId": "PROD_ABC123XYZ456",
      "productName": "iPhone 15 Pro",
      "productImage": "https://.../iphone15.jpg",
      "category": {
        "categoryName": "Electronics"
      },
      "coinReward": 50
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 50,
    "hasMore": true
  }
}
\`\`\`

<details>
<summary>📱 Flutter Example (Get Products with Pagination & Search)</summary>

\`\`\`dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

Future<Map<String, dynamic>> getProducts({
  String? category,
  int page = 1,
  int limit = 10,
  String? search,
}) async {
  try {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString('auth_token');
    if (token == null) return {'success': false, 'message': 'No token found'};

    Map<String, String> queryParams = {
      'page': page.toString(),
      'limit': limit.toString(),
    };
    if (category != null) queryParams['category'] = category;
    if (search != null && search.isNotEmpty) queryParams['search'] = search;

    final uri = Uri.parse('https://kkd-backend-api.onrender.com/api/user/products')
        .replace(queryParameters: queryParams);

    final response = await http.get(uri, headers: {'Authorization': 'Bearer $token'});
    return jsonDecode(response.body);
  } catch (e) {
    return {'success': false, 'message': 'Network error occurred'};
  }
}
\`\`\`
</details>

---

## 🎯 QR Code Scanning API

### 1️⃣5️⃣ Scan QR Code for Coins - `POST` Request

- **🌐 Endpoint:** `https://kkd-backend-api.onrender.com/api/user/scan-qr`
- **📝 Method:** `POST`
- **🔒 Authentication:** Required (Bearer Token)

**📤 Request Body:**
\`\`\`json
{
  "qrData": "{\"productId\":\"PROD_ABC123XYZ456\",\"type\":\"PRODUCT_QR\",\"timestamp\":1690123456789,\"hash\":\"abc123def456\"}"
}
\`\`\`
> **💡 Note:** `qrData` is the raw JSON string from the QR code.

**✅ Success Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Congratulations! You've earned 50 coins for scanning iPhone 15 Pro.",
  "data": {
    "productName": "iPhone 15 Pro",
    "coinsEarned": 50,
    "totalCoins": 200
  }
}
\`\`\`

**❌ Error Responses:**
- `Invalid QR code. This is not a valid product QR.`
- `This QR code has already been used.`
- `You have already scanned this product.`

<details>
<summary>📱 Flutter QR Scanner Implementation</summary>

#### Required Packages
Add to `pubspec.yaml`:
\`\`\`yaml
dependencies:
  qr_code_scanner: ^1.0.1
  permission_handler: ^11.0.1
\`\`\`

#### QR Scanner Screen
The provided `QRScannerScreen` class is a great starting point. It handles camera permissions, scanning, and API communication. Key steps:
1.  Request camera permission.
2.  Initialize `QRView` to start scanning.
3.  On scan, pause the camera and set a processing state.
4.  Validate the QR data locally first (is it JSON? does it have the right `type`?).
5.  Send the `qrData` to the API.
6.  Show a success or error dialog based on the API response.
7.  Allow the user to resume scanning or exit.

</details>

---

## 📱 Complete Flutter Setup

### Required Packages
\`\`\`yaml
dependencies:
  flutter:
    sdk: flutter

  # Core
  http: ^1.1.0
  shared_preferences: ^2.2.2

  # UI & UX
  image_picker: ^1.0.4
  cached_network_image: ^3.3.0
  fluttertoast: ^8.2.4

  # QR Scanning
  qr_code_scanner: ^1.0.1
  permission_handler: ^11.0.1
\`\`\`

<details>
<summary>🚀 Complete API Service Class (`lib/services/api_service.dart`)</summary>

The provided `ApiService` class is excellent. It centralizes all API logic, including:
-   **Base URL:** A constant for the API base URL.
-   **Token Management:** `getToken`, `saveToken`, `clearToken` methods using `SharedPreferences`.
-   **API Methods:** A separate method for each API endpoint, handling request creation, headers, and body.
-   **Error Handling:** `try-catch` blocks for network errors.
-   **Unified Logic:** A single `uploadDocument` method and a smart `updateProfile` method that handles both JSON and multipart data.
-   **Helper Functions:** `getVerificationStatusText`, `getKYCStatusText`, and `getStatusColor` for UI logic.

This class is ready to be dropped into a Flutter project to manage all communication with the backend.

</details>

<details>
<summary>✨ Enhanced Profile Screen Example</summary>

The `ProfileScreen` example demonstrates how to effectively use the `ApiService` to build a dynamic UI. Key features:
-   **State Management:** Uses `StatefulWidget` to manage `isLoading` and `userData`.
-   **Data Fetching:** Calls `_apiService.getUserProfile()` in `initState`.
-   **Conditional UI:** Shows a loading indicator, the profile data, or an error message.
-   **Component-Based UI:** Uses helper methods like `buildVerificationStatus`, `buildKYCStatus`, and `buildScanHistory` to create modular UI parts.
-   **Status Visualization:** Uses the `ApiService` helper functions to display status text and colors, providing clear visual feedback to the user.
-   **Actionable UI:** Includes buttons to edit the profile or navigate to the QR scanner.

</detais>

---

## ⚠️ Error Handling Guide

### Common HTTP Status Codes

| Status Code | Meaning         | Common Causes                               |
| :---------- | :-------------- | :------------------------------------------ |
| `200`       | ✅ OK           | Request completed successfully              |
| `201`       | ✅ Created      | Resource created (e.g., user signup)        |
| `400`       | ❌ Bad Request  | Invalid data, validation errors             |
| `401`       | ❌ Unauthorized | Missing, invalid, or expired token          |
| `403`       | ❌ Forbidden    | Insufficient permissions                    |
| `404`       | ❌ Not Found    | Endpoint or resource not found              |
| `409`       | ❌ Conflict     | Duplicate data (e.g., email already exists) |
| `500`       | ❌ Server Error | An error occurred on the server             |

### Flutter Error Handling
\`\`\`dart
Future<void> handleApiCall(BuildContext context) async {
  try {
    final result = await apiService.getUserProfile();

    if (result['success'] == true) {
      // ✅ Success
    } else {
      // ❌ API returned an error
      String errorMessage = result['message'] ?? 'An unknown error occurred';
      if (errorMessage.contains('token')) {
        // Redirect to login for token errors
        Navigator.pushReplacementNamed(context, '/login');
      } else {
        // Show a snackbar for other errors
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(errorMessage), backgroundColor: Colors.red),
        );
      }
    }
  } catch (e) {
    // 🌐 Network or parsing error
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Network error. Please check your connection.')),
    );
  }
}
\`\`\`

---

## 📌 Important Notes & Best Practices

- **Security:** Use `flutter_secure_storage` for production apps to store auth tokens more securely. Always handle token expiration by redirecting the user to the login screen.
- **File Uploads:** Check file sizes and types on the client side before uploading to prevent unnecessary API calls. Show a progress indicator for a better user experience.
- **QR Scanning:** Always request camera permissions before opening the scanner and handle denial gracefully.
- **State Management:** For larger apps, consider a more robust state management solution like Provider, BLoC, or Riverpod to manage API states (loading, success, error) across your app.
- **User Experience:** Always provide feedback for actions. Use loading indicators, disable buttons during processing, and show clear success or error messages.

---

## 🔗 Testing & Resources

- **Base URL:** `https://kkd-backend-api.onrender.com`
- **Postman Collection:** 👉 [Test APIs on Postman](https://express-flutter-devs.postman.co/workspace/express-%252B-flutter-devs-Workspac~c8483be6-d1e5-4e20-8cde-5ea1e8a946fe/collection/26812494-b0ca2371-2cab-43e1-9f60-83e84f4fc23f)

---

## ✅ Quick Start Checklist

- [ ] Install required Flutter packages from `pubspec.yaml`.
- [ ] Add the `ApiService` class to your project.
- [ ] Implement login/signup screens and token storage.
- [ ] Build the profile screen with KYC and document status display.
- [ ] Implement the QR code scanner with permission handling.
- [ ] Build product browsing, search, and detail screens.
- [ ] Implement robust error handling and user feedback for all API calls.

---

## ✨ What's New in This Version

This version of the guide documents a complete API with **Product Management**, an **Enhanced QR Code System**, and a **Full KYC & Verification Flow**. The Flutter examples have been updated to reflect a full-featured application, including product browsing, searching, and a detailed scan history.

---

<p align="center">
  <em>Made with ❤️ by Ravish</em><br>
  <strong>Happy Coding! 🚀</strong>
</p>
