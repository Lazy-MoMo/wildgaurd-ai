// Keep this in sync with vite.config.ts. Vite loads vite.config.js first when
// both files exist, so this file must use the TanStack config used by the app.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    server: {
      proxy: {
        "/api": {
          target: process.env.VITE_API_PROXY_TARGET ?? "http://127.0.0.1:8000",
          changeOrigin: true,
          ws: true,
        },
      },
    },
  },
});
