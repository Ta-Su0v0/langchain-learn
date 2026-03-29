import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // TailwindCSS v4 (Vite plugin — no config file needed)
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      // @/ → src/ (Google-style clean imports)
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Listen on all interfaces for Docker compatibility
    port: 5173,
    // proxy: {
    //   // Forward /api/** to the Hono server during development
    //   '/api': {
    //     target: 'http://localhost:3000',
    //     changeOrigin: true,
    //   },
    // },
  },
  test: {
    // Vitest TDD config
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        // Google-style: enforce ≥80% coverage
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
