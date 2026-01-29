import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
//import "./charts.js";

import "./index.css";


/* 🔔 Register Firebase Messaging Service Worker */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        //console.log("Firebase Service Worker registered:", registration);
      })
      .catch((err) => {
        console.error("Service Worker registration failed:", err);
      });
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(

    <App />

);
