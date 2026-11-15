import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./app/App";
import { bootstrapGame } from "./stores/persistence";

async function boot(): Promise<void> {
  // Konten yang belum ditinjau dimuat hanya bila build mengizinkan. Pada build produksi nilai
  // __ALLOW_UNREVIEWED__ adalah false sehingga blok ini, beserta modul draf, dibuang oleh bundler.
  if (__ALLOW_UNREVIEWED__) {
    const { registerUnreviewedContent } = await import("./data/unreviewed");
    registerUnreviewedContent();
  }

  // Muat save (atau mulai game baru) sebelum render pertama agar semua store sudah terisi.
  bootstrapGame();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void boot();
