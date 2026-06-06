import { defineConfig } from "vite";

// Relative base ("./") so the built site works whether it's served from a
// project-pages subpath (username.github.io/portfolio) or a custom domain root.
// React / ReactDOM / Three / Lucide stay as CDN globals (loaded in index.html),
// so JSX uses the classic transform against the global `React` — no react import,
// no in-browser Babel.
export default defineConfig({
  base: "./",
  esbuild: {
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    target: "es2018",
  },
});
