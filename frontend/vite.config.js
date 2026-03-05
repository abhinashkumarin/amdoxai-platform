import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  publicDir: 'public',
  server: {
    port: 5173,
    proxy: {
      // Only proxy /api/* to backend — NOT /api-docs
      '/api/': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path  // keep as-is
      }
    }
  }
})