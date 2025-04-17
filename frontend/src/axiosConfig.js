// src/axiosConfig.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach token if user is logged in
axiosInstance.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.access) {
    config.headers.Authorization = `Bearer ${user.access}`;
  }
  return config;
});

export default axiosInstance;
