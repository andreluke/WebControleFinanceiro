import path from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts', './src/test/mocks/server.ts'],
    css: true,
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
  },
  server: {
    port: 8080,
    host: '0.0.0.0'
  }
})
