const path = require("path");
const { defineConfig } = require("vite");
const { VitePWA } = require("vite-plugin-pwa");

const repoRoot = __dirname;

// The web app lives in apps/web but imports the shared engine from core/,
// which is authored as native ES modules (core/package.json sets "type":"module"),
// so no CommonJS interop is needed here.
module.exports = defineConfig({
  root: path.resolve(repoRoot, "apps/web"),
  base: "/",
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "StrokePad — Hanzi Practice Sheets",
        short_name: "StrokePad",
        description: "Generate printable hanzi stroke-practice worksheets from HSK lessons or your own text.",
        theme_color: "#ff7cbb",
        background_color: "#ffe3f4",
        display: "standalone",
        start_url: "/app",
        icons: [
          { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" },
        ],
      },
      workbox: {
        // Precache the app shell + fonts (not the big data shards).
        globPatterns: ["**/*.{js,css,html,svg,woff,woff2}"],
        // Data shards are cached on demand so previously used lessons work offline.
        runtimeCaching: [
          {
            urlPattern: /\/data\/.*\.json$/,
            handler: "CacheFirst",
            options: {
              cacheName: "strokepad-data",
              expiration: { maxEntries: 600, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    fs: {
      // allow importing files from core/ (outside the web root)
      allow: [repoRoot],
    },
  },
  build: {
    outDir: path.resolve(repoRoot, "apps/web/dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // Landing page at "/", the app at "/app".
        main: path.resolve(repoRoot, "apps/web/index.html"),
        app: path.resolve(repoRoot, "apps/web/app/index.html"),
      },
    },
  },
});
