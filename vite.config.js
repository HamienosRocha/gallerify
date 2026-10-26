import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = dirname(fileURLToPath(import.meta.url));

function emitExtensionFiles() {
  return {
    name: "gallerify-extension-files",
    async generateBundle() {
      const manifest = await readFile(resolve(root, "manifest.json"), "utf8");
      this.emitFile({ type: "asset", fileName: "manifest.json", source: manifest });

      for (const size of [16, 32, 48, 128]) {
        const fileName = `icons/gallerify${size}.png`;
        this.emitFile({
          type: "asset",
          fileName,
          source: await readFile(resolve(root, fileName)),
        });
      }
    },
  };
}

export default defineConfig({
  publicDir: false,
  plugins: [emitExtensionFiles()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(root, "popup.html"),
        content: resolve(root, "content.js"),
      },
      output: {
        entryFileNames: (chunk) => chunk.name === "content" ? "content.js" : "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
