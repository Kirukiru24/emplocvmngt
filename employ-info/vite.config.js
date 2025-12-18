import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: true,      // Listen on all local IP addresses (0.0.0.0)
    port: 5173,      // Force the port to 5173
    strictPort: true // If 5173 is busy, Vite will fail instead of picking a random port
  }


})
