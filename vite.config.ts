import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react-router-dom": path.resolve(__dirname, "./src/lib/router-stub.tsx"),
      "socket.io-client": path.resolve(__dirname, "./src/lib/socket-stub.ts"),
    },
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
});
