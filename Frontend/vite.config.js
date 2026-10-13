import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev proxy so the browser talks to one origin (no CORS pain, WS works too).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
      '/ws': { target: 'ws://localhost:8000', ws: true },
    },
  },
})
