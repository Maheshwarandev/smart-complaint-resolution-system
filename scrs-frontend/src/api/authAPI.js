import axiosInstance from "./axiosInstance";

export const registerAPI = (data) =>
  axiosInstance.post("/auth/register", data);

export const loginAPI = (data) =>
  axiosInstance.post("/auth/login", data);
  // data can include: email, password, and optionally agentSecurityCode

export const getMeAPI = () =>
  axiosInstance.get("/auth/me");
