import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // increase the limit (default is 500kb)
    chunkSizeWarningLimit: 1000
  }
})
