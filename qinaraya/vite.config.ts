import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  /**
   * Konten agama berstatus draft atau needs-review hanya boleh tampil di:
   * 1. mode development, atau
   * 2. build uji yang sengaja menyalakan VITE_SHOW_UNREVIEWED_CONTENT=true.
   * Deploy Production di Vercel (VERCEL_ENV=production) selalu menolak saklar ini.
   */
  const stagingSwitch = env.VITE_SHOW_UNREVIEWED_CONTENT === "true" && process.env.VERCEL_ENV !== "production";
  const allowUnreviewed = mode !== "production" || stagingSwitch;

  return {
    plugins: [react(), tailwindcss()],
    define: { __ALLOW_UNREVIEWED__: JSON.stringify(allowUnreviewed) },
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
  };
});
