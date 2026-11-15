import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./app/App";
import { bootstrapGame } from "./stores/persistence";

// Muat save (atau mulai game baru) sebelum render pertama agar semua store sudah terisi.
bootstrapGame();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
