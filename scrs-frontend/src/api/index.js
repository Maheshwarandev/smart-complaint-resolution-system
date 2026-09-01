import axios from "axios";

// ─── AXIOS INSTANCE ──────────────────────────────────────────────────────────
// All API calls go through this single configured Axios instance
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Request Interceptor: Attach JWT token to outgoing requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized (auto-logout)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── AUTH APIS ────────────────────────────────────────────────────────────────
export const registerAPI = (data) =>
  axiosInstance.post("/auth/register", data);

export const loginAPI = (data) =>
  axiosInstance.post("/auth/login", data);

export const getMeAPI = () =>
  axiosInstance.get("/auth/me");

export const updateProfileAPI = (formData) =>
  axiosInstance.put("/auth/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ─── COMPLAINT APIS ───────────────────────────────────────────────────────────
export const createComplaintAPI = (data) =>
  axiosInstance.post("/complaints", data);

export const getAllComplaintsAPI = () =>
  axiosInstance.get("/complaints");

export const getComplaintByIdAPI = (id) =>
  axiosInstance.get(`/complaints/${id}`);

export const updateComplaintAPI = (id, data) =>
  axiosInstance.put(`/complaints/${id}`, data);

export const deleteComplaintAPI = (id) =>
  axiosInstance.delete(`/complaints/${id}`);

export const getComplaintStatsAPI = () =>
  axiosInstance.get("/complaints/stats");

export const addCommentAPI = (id, text) =>
  axiosInstance.post(`/complaints/${id}/comments`, { text });

export const rateComplaintAPI = (id, score, feedback) =>
  axiosInstance.post(`/complaints/${id}/rate`, { score, feedback });

// ─── ADMIN APIS ───────────────────────────────────────────────────────────────
export const getDashboardAPI = () =>
  axiosInstance.get("/admin/dashboard");

export const getAllUsersAPI = () =>
  axiosInstance.get("/admin/users");

export const getUserByIdAPI = (id) =>
  axiosInstance.get(`/admin/users/${id}`);

export const updateUserRoleAPI = (id, data) =>
  axiosInstance.put(`/admin/users/${id}/role`, data);

export const deleteUserAPI = (id) =>
  axiosInstance.delete(`/admin/users/${id}`);

export const getAllAgentsAPI = () =>
  axiosInstance.get("/admin/agents");

export const generateAgentSecurityCodeAPI = (id) =>
  axiosInstance.post(`/admin/agents/${id}/generate-code`);

export const assignComplaintAPI = (id, data) =>
  axiosInstance.put(`/admin/complaints/${id}/assign`, data);

export default axiosInstance;
