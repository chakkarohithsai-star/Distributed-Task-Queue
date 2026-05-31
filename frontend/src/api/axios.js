// importing axios
import axios from "axios";

/*
----------------------------------------------------
Creating Axios Instance
----------------------------------------------------

Using deployed backend URL instead of localhost

Because:
localhost only works on local machine

Production frontend on Vercel must connect
to deployed Render backend.
----------------------------------------------------
*/
const API = axios.create({

  // backend api base url
  baseURL:
    "https://capstone-project-v867.onrender.com/api",
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
