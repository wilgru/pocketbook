import { resolve } from "path";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }), // MUST be before tanstackStart
    devtools(),
    tanstackStart(),
    react(), // TODO should change to 'viteReact()'?
    tailwindcss(),
  ],
  resolve: {
    alias: {
      src: resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    exclude: ["@lexical/code-prism", "@lexical/code"],
  },
  build: {
    rollupOptions: {
      output: {
        // Forces prismjs base module to run before its component files (prism-clike etc.)
        // which reference the global `Prism`. Fixes "ReferenceError: Prism is not defined"
        // when deploying to Cloudflare Workers.
        strictExecutionOrder: true,
      },
    },
  },
});
