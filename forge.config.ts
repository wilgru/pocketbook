import { cpSync, mkdirSync } from "node:fs";
import path from "node:path";
import { VitePlugin } from "@electron-forge/plugin-vite";
import type { ForgeConfig } from "@electron-forge/shared-types";

const config: ForgeConfig = {
  packagerConfig: {
    name: "Pocketbook",
    icon: "resources/icon",
    extraResource: ["drizzle"],
    asar: {
      unpack: "**/node_modules/better-sqlite3/**",
    },
  },
  outDir: "dist",
  hooks: {
    packageAfterCopy: async (_forgeConfig, buildPath) => {
      // better-sqlite3 ships a prebuilt Node-API binary that Vite does not
      // bundle, so it is copied into the packaged app verbatim.
      const nativeDeps = ["better-sqlite3"];
      for (const dep of nativeDeps) {
        const src = path.join(__dirname, "node_modules", dep);
        const dest = path.join(buildPath, "node_modules", dep);
        mkdirSync(path.dirname(dest), { recursive: true });
        cpSync(src, dest, { recursive: true });
      }
    },
  },
  // better-sqlite3 v13+ is a Node-API addon, so its prebuilt binary is ABI
  // stable across Node and Electron versions and needs no rebuild step.
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
      config: {},
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["win32"],
      config: {},
    },
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: "electron/main.ts",
          config: "vite.main.config.ts",
        },
        {
          entry: "electron/preload.ts",
          config: "vite.preload.config.ts",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.config.ts",
        },
      ],
    }),
  ],
};

export default config;
