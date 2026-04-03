import axios from "axios";

let base = import.meta.env.VITE_API_URL || "";
if (base.endsWith("/")) base = base.slice(0, -1);
if (base.endsWith("/api")) base = base.slice(0, -4);

const baseURL = base ? `${base}/api` : "/api";

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
