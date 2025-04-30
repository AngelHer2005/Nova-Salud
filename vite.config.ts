import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Asegúrate de que el puerto coincida con el backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
