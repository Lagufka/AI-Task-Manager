import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/tasks': {
        target: 'http://backend:3333'
      },
      '/auth': {
        target: 'http://backend:3333'
      }
    }
  }
})
