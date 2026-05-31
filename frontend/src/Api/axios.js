import axios from "axios";

// create axios instance pointing to local backend
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Interceptor to automatically attach JWT token on all outgoing requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;