import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig, type Plugin } from "vite";

// @lexical/code-prism sets globalThis.Prism as a bare global in its prod bundle
// (e.g. `Prism.languages.clike=...` IIFEs). When deployed to Cloudflare Workers,
// the base prismjs module never assigns window/globalThis.Prism (its UMD window
// branch is stripped by the bundler), so we inject an explicit import + global
// assignment before the offending module evaluates.
function prismGlobalPlugin(): Plugin {
  return {
    name: "prism-global",
    transform(code, id) {
      if (code.includes(")(Prism)") || (id.includes("code-prism") && code.includes("Prism"))) {
        return {
          code: `import _Prism from "prismjs"; var Prism = _Prism; globalThis.Prism = _Prism;\n${code}`,
          map: null,
        };
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }), // MUST be before tanstackStart
    tanstackStart(),
    react(),
    tailwindcss(),
    prismGlobalPlugin(),
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
