import axiosInstance from "./axiosInstance";

export const createComplaintAPI  = (data)  => axiosInstance.post("/complaints", data);
export const getAllComplaintsAPI  = ()      => axiosInstance.get("/complaints");
export const getComplaintByIdAPI = (id)    => axiosInstance.get(`/complaints/${id}`);
export const updateComplaintAPI  = (id, data) => axiosInstance.put(`/complaints/${id}`, data);
export const deleteComplaintAPI  = (id)    => axiosInstance.delete(`/complaints/${id}`);
export const getComplaintStatsAPI = ()     => axiosInstance.get("/complaints/stats");
export const addCommentAPI       = (id, text) => axiosInstance.post(`/complaints/${id}/comments`, { text });
export const rateComplaintAPI      = (id, score, feedback) => axiosInstance.post(`/complaints/${id}/rate`, { score, feedback });
