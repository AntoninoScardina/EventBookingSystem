import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Remove the optimization exclusion for lucide-react
  // optimizeDeps: {
  //   exclude: ['lucide-react'],
  // },
});