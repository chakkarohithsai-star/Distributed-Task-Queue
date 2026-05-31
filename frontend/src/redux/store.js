// importing configureStore
import { configureStore } from "@reduxjs/toolkit";

// importing auth reducer
import authReducer from "./authSlice";

// creating store
export const store = configureStore({

  reducer: {

    // auth reducer
    auth: authReducer,
  },
});