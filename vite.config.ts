import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  build: {
    /* No source maps in the production build. Emitting them publishes the
       full original source (incl. bundled library internals) as world-
       readable .js.map artifacts next to the bundle — an info-disclosure
       surface and the source of react-doctor artifact-secret-leak /
       artifact-baas-authority-surface findings. Lighthouse's
       valid-source-maps is an informational (unweighted) audit, so this
       does not affect the Best-Practices score. */
    sourcemap: false,
  },
  plugins: [
    devtools(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
