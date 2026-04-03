import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : "/api";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

console.log("🚀 BioDex API Connected to:", baseURL);

// Detailed Error Logger for Production
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("❌ BioDex API Error Details:", {
      message: err.message,
      url: err.config?.url,
      method: err.config?.method,
      code: err.code,
      stack: err.stack,
    });
    return Promise.reject(err);
  }
);

export default api;
