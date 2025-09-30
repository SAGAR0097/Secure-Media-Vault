import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Uncomment and set this only if deployed in a subfolder like /app/
  // base: '/app/',
});
