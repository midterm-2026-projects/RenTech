import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    // Playwright end-to-end specs live under src/test/e2e and must be run by
    // `npm run test:e2e` (Playwright CLI) against a real dev server/browser.
    // Keep vitest focused on unit/component/integration tests.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/e2e/**',
      '**/test/e2e/**',
    ],
  }
})