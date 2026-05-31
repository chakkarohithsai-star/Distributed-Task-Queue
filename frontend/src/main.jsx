// importing react
import React from "react";

// importing react dom
import ReactDOM from "react-dom/client";

// importing router
import { BrowserRouter } from "react-router-dom";

// importing redux provider
import { Provider } from "react-redux";

// importing app
import App from "./App";

// importing redux store
import { store } from "./redux/store";

// importing css
import "./index.css";

// rendering application
ReactDOM.createRoot(
  document.getElementById("root")
).render(

  // strict mode
  <React.StrictMode>

    {/* redux provider */}
    <Provider store={store}>

      {/* browser router */}
      <BrowserRouter>

        {/* main app */}
        <App />

      </BrowserRouter>

    </Provider>

  </React.StrictMode>
);