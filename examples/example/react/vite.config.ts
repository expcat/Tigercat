import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@demo-shared": path.resolve(__dirname, "../shared"),
    },
  },
  server: {
    port: 5174,
    fs: {
      allow: [path.resolve(__dirname, "..")],
    },
  },
});
