import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3020', // Match your backend port
        changeOrigin: true, // Ensures the host header matches the target
        secure: false,
      },
    },
  },
  plugins: [react()],
});
