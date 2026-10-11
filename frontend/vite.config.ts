import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Forward API calls to the ASP.NET backend. The browser only ever talks to
    // the Vite dev server, so there's a single origin and no CORS setup needed.
    proxy: {
      '/todos': process.env.API_URL ?? 'http://localhost:5199',
    },
  },
})
