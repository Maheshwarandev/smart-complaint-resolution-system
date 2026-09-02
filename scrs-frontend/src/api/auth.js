import axiosInstance from "./client";

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
