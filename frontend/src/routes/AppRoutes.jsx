import { Routes, Route } from "react-router-dom";
import Home from "../pages/home/Home";
import NotFound from "../pages/notFound/NotFound";
import Login from "../pages/login/Login";
import ProtectedRoute from "../components/adminProtectedRoute/ProtectedRoute";
import History from "../pages/transactionHistory/History";
import Category from "../pages/category/Category";
import Promotion from "../pages/promotion/Promotion";
import Offer from "../pages/offer/Offer";
import Users from "../pages/users/Users";
import KYC from "../pages/kycRequests/Kyc";
import Products from "../pages/products/Products";
import QRScanner from "../pages/qrTest/QRScanner";
import Withdrawals from "../pages/withdrawals/Withdrawals";
import TermsAndPrivacy from "../pages/TermsCondition/TermsAndCondition";
import DeleteAccountForm from "../pages/deleteAccount/Delete";

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transaction-history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/category"
        element={
          <ProtectedRoute>
            <Category />
          </ProtectedRoute>
        }
      />
      <Route
        path="/promotion"
        element={
          <ProtectedRoute>
            <Promotion />
          </ProtectedRoute>
        }
      />
      <Route
        path="/offers"
        element={
          <ProtectedRoute>
            <Offer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kyc-requests"
        element={
          <ProtectedRoute>
            <KYC />
          </ProtectedRoute>
        }
      />
      <Route
        path="/withdrawal-requests"
        element={
          <ProtectedRoute>
            <Withdrawals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/qr-scanner"
        element={
          <ProtectedRoute>
            <QRScanner />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/terms-and-privacy" element={<TermsAndPrivacy />} />
      <Route path="/delete-account" element={<DeleteAccountForm />} />
    </Routes>
  );
};

export default AppRoutes;
