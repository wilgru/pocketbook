import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }), // MUST be before tanstackStart
    tanstackStart(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      src: resolve(__dirname, "src"),
    },
  },
});
