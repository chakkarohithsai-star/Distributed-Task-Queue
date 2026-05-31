// importing axios
import axios from "axios";

// create axios instance pointing to backend (uses environment variable for production)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://distributed-task-queue-kn7y.onrender.com/api",
});

/*
----------------------------------------------------
Axios Request Interceptor
----------------------------------------------------

Automatically attaches JWT token
to every API request.

This avoids manually adding headers
in every request.
----------------------------------------------------
*/
API.interceptors.request.use(

  // before request sent
  (config) => {

    // getting token from local storage
    const token =
      localStorage.getItem("token");

    // if token exists
    if (token) {

      // attaching authorization header
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    // returning updated config
    return config;
  },

  // request error handling
  (error) => {

    return Promise.reject(error);
  }
);

// exporting api instance
export default API;
