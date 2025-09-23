import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API || "http://localhost:5000",
});

// Add token to every request automatically
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
