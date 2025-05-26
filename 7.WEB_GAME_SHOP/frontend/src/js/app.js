// Import React and ReactDOM
import React from "react";
import ReactDOM from "react-dom";
// import { readFileSync } from 'fs';

// Import Framework7
import Framework7 from "./framework7-custom.js";

// Import Framework7-React Plugin
import Framework7React from "framework7-react";

// Import Framework7 Styles
import "../css/framework7-custom.less";

// Import Icons and App Custom Styles
import "../css/icons.css";
import "../css/app.less";

// Import App Component
import App from "../components/app.jsx";

import { io } from "socket.io-client";

const socket = io("https://localhost:3000");

// Init F7 React Plugin
Framework7.use(Framework7React);

import { RecoilRoot } from "recoil";

// window.addEventListener("beforeunload", () => {
//   alert("정말 창을 닫으시겠습니까?");
// });

// Mount React App
ReactDOM.render(
  <RecoilRoot>
    <App />
  </RecoilRoot>,
  document.getElementById("app")
);
