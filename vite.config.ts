// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isPages = process.env["GITHUB_PAGES"] === "1";
const basePath = process.env["BASE_PATH"] || "/city.electronics/";

export default isPages
  ? defineConfig({
      tanstackStart: {
        spa: {},
      },
      nitro: false,
      vite: { base: basePath },
    })
  : defineConfig({
      tanstackStart: {
        server: { entry: "server" },
      },
    });
