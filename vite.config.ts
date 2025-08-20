import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // base: "/md2walrus/",
  plugins: [react()],
  optimizeDeps: {
    include: ["@mysten/walrus", "@mysten/walrus-wasm"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          walrus: ["@mysten/walrus"],
        },
      },
    },
  },
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
  assetsInclude: ["**/*.wasm"],
});
