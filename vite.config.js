import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'Agenda de Rotas',
        short_name: 'Agenda Rotas',
        description: 'Sistema de agenda para rotas e passageiros',
        theme_color: '#2563eb',
        background_color: '#F8F9FA',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
  {
    src: '/pwa-192x192.png',
    sizes: '192x192',
    type: 'image/png',
  },
  {
    src: '/pwa-512x512.png',
    sizes: '512x512',
    type: 'image/png',
  },
],
      },
    }),
  ],
})