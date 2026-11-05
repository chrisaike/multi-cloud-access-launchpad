import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// When building for GitHub Pages, assets must be served from the repo
// subpath (/<repo>/). The Pages workflow sets GITHUB_PAGES=true and
// PAGES_BASE. Local dev/build keep the root base so nothing else changes.
const base = process.env.GITHUB_PAGES
  ? process.env.PAGES_BASE ?? "/"
  : "/";

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
  },
});
