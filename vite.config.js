import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Ohne host lauscht Vite nur auf ::1 und ist über 127.0.0.1 nicht erreichbar
    host: true,
  },
})
