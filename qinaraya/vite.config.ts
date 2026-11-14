import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Library 3D memang besar; ambang dinaikkan agar peringatan tidak menyesatkan.
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        // Pisahkan library 3D agar kode game kecil dan cache browser efisien.
        manualChunks(id) {
          if (id.includes("node_modules/three/")) return "three";
          if (id.includes("@react-three")) return "r3f";
        },
      },
    },
  },
});
