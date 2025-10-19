import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API to backend for same-origin cookies in dev
      '/api': {
        target: process.env.VITE_BACKEND_ORIGIN || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
