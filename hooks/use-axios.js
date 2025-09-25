import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // if you use cookies
});

// Request interceptor (optional, e.g., add auth token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or use context/store
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (optional, for global error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: handle 401 globally
    if (error.response?.status === 401) {
      console.log("Unauthorized! Redirect to login...");
    }
    return Promise.reject(error);
  }
);

export default api;
