import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  tailwindcss(),],
  server: {
    port: 3000,
    host: true,
    // Lets local dev call /api without VITE_API_URL (mirrors Vercel behaviour).
    // The Express server reads PORT from server/.env (currently 5000), so the
    // proxy must target that same port or login returns "Network Error".
    proxy: { '/api': 'http://localhost:5000' },
  }
})
