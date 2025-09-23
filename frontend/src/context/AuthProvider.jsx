import { useState, useEffect } from "react";
import { verifyAdminToken as verifyTokenAPI } from "../helpers/verifyAdminToken";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // On mount, check for valid token
  useEffect(() => {
    const token = sessionStorage.getItem("userToken");
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      const isValid = await verifyTokenAPI();
      setIsAuthenticated(isValid);
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Centralized admin login
  const adminLogin = async (userData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/api/admin/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();
      if (response.ok) {
        sessionStorage.setItem("userToken", data.token);
        setIsAuthenticated(true);
        navigate("/"); // redirect after login
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Centralized logout
  const adminLogout = () => {
    sessionStorage.removeItem("userToken");
    setIsAuthenticated(false);
    navigate("/login");
    toast.success("Logout successful!", { id: "logout-toast" });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
