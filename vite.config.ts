import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': process.env.VITE_BACKEND_URL || 'http://localhost:8000',
      '/pdf': process.env.VITE_BACKEND_URL || 'http://localhost:8000',
    },
  },
})
