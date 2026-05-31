// importing createSlice
import { createSlice } from "@reduxjs/toolkit";

// token from localstorage
const token = localStorage.getItem("token");

// creating auth slice
const authSlice = createSlice({

  // slice name
  name: "auth",

  // initial state
  initialState: {

    token: token || null,

    isAuthenticated: !!token,
  },

  reducers: {

    // login success
    loginSuccess: (state, action) => {

      state.token = action.payload;

      state.isAuthenticated = true;
    },

    // logout
    logout: (state) => {

      state.token = null;

      state.isAuthenticated = false;
    },
  },
});

// exporting actions
export const {
  loginSuccess,
  logout,
} = authSlice.actions;

// export reducer
export default authSlice.reducer;