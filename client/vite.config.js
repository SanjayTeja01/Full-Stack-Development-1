import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// /api requests go to the Express server, so the browser only ever talks to one address.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:4000" } },
});
