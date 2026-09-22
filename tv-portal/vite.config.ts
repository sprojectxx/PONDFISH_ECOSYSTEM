import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const socketUrl = process.env.VITE_SOCKET_URL || process.env.VITE_API_BASE_URL || env.VITE_SOCKET_URL || env.VITE_API_BASE_URL || '';

  return {
    plugins: [react()],
    server: {
      port: 3004,
    },
    define: {
      'process.env.VITE_SOCKET_URL': JSON.stringify(socketUrl),
      'process.env.VITE_API_BASE_URL': JSON.stringify(socketUrl),
    },
  };
});
