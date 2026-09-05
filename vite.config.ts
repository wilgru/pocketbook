import { resolve } from "path";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

// prismjs components (prism-clike.js, prism-go.js, ...) are plain scripts that
// reference `Prism` as a bare global, which in workerd never gets populated via
// prism-core's UMD `_self` branch alone. Also, the dev runner returns an empty
// namespace when importing the CJS `prismjs` module, so `import _Prism from
// "prismjs"` can yield `undefined` for its default export there. We therefore
// resolve `Prism` from the module's default export when available, falling back
// to the `globalThis.Prism` global that loading `prismjs` as a side effect sets.
//
// This is injected before every module that consumes the global:
//  - `prismjs/components/prism-*.js` use bare `Prism`, and
//  - `@lexical/code-prism` (both the `Prism.languages.*` IIFEs in its prod
//    bundle and its source `FacadePrism.ts`) reads it back from globalThis.
//
// We must NOT inject into `prismjs/prism.js` itself — importing the bare
// `prismjs` specifier there resolves back to itself (circular import).
const PRISM_INIT = `import _Prism from "prismjs"; var Prism = (_Prism && _Prism.default) || globalThis.Prism || _Prism; globalThis.Prism = Prism;`;

function prismGlobalPlugin(): Plugin {
  return {
    name: "prism-global",
    transform(code, id) {
      const isPrismComponent = id.includes("prismjs/components/prism-");
      if (
        code.includes(")(Prism)") ||
        (id.includes("code-prism") && code.includes("Prism")) ||
        isPrismComponent
      ) {
        return {
          code: `${PRISM_INIT}\n${code}`,
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
    // prismGlobalPlugin(),
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
