// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Static build for GitHub Pages: `GITHUB_PAGES=1 BASE_PATH=/repo-name/ bun run build`
const isPages = process.env["GITHUB_PAGES"] === "1";
const basePath = process.env["BASE_PATH"] || "/";

export default isPages
  ? defineConfig({
      tanstackStart: {
        // No server runtime on GitHub Pages — ship a client-rendered single page app.
        spa: { enabled: true },
      },
      nitro: false,
      vite: { base: basePath },
    })

  : defineConfig({
      tanstackStart: {
        // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
        // nitro/vite builds from this
        server: { entry: "server" },
      },
    });
