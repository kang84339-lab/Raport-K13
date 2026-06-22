import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  plugins: [
    base44({
      // Diaktifkan secara manual (true) agar kode warisan transisi SDK tetap berjalan aman
      legacySDKImports: true,
      hmrNotifier: false,         // Dimatikan di produksi agar tidak menginterupsi rute aplikasi
      navigationNotifier: false,  // Dimatikan agar tidak merusak navigasi SPA Vercel
      analyticsTracker: true,     // Tetap aktif untuk melacak data analitik aplikasi
      visualEditAgent: false      // Dimatikan saat live agar tidak memicu error visual agent di browser
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});