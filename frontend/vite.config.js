import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [preact()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000', // Backend naslov
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Preusmeri `/api/` na backend koren
      },
    },
  },
})
