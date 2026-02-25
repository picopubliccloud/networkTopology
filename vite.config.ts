import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import https from 'https';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('/data/networkTopology/ssl/key.pem'), // Your private key file
      cert: fs.readFileSync('/data/networkTopology/ssl/cert.pem'), // Your SSL certificate file
    },
  },
  build: {
    sourcemap: false,
  },
});