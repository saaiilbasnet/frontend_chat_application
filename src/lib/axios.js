import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://backend-chat-application-kzkr.onrender.com";

export const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
});

const clearToken = () => {
  sessionStorage.removeItem("jwt");
  localStorage.removeItem("jwt");
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("jwt") || localStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(error);
  }
);
