// src/axiosConfig.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api/",
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
