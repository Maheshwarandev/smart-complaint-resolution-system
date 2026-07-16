import axiosInstance from "./axiosInstance";

export const getDashboardAPI      = ()         => axiosInstance.get("/admin/dashboard");
export const getAllUsersAPI        = ()         => axiosInstance.get("/admin/users");
export const getUserByIdAPI       = (id)       => axiosInstance.get(`/admin/users/${id}`);
export const updateUserRoleAPI    = (id, data) => axiosInstance.put(`/admin/users/${id}/role`, data);
export const deleteUserAPI        = (id)       => axiosInstance.delete(`/admin/users/${id}`);
export const getAllAgentsAPI       = ()         => axiosInstance.get("/admin/agents");
export const generateAgentSecurityCodeAPI = (id) => axiosInstance.post(`/admin/agents/${id}/generate-code`);
export const assignComplaintAPI   = (id, data) => axiosInstance.put(`/admin/complaints/${id}/assign`, data);
