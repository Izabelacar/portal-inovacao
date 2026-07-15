import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:3001';

// Ao publicar no GitHub Pages, o site fica em
// https://SEU-USUARIO.github.io/NOME-DO-REPO/ — troque o "base" abaixo
// pelo nome exato do seu repositório (com as barras "/" no começo e no fim).
// Em desenvolvimento local isso não afeta nada.
export default defineConfig({
  base: '/portal-inovacao/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Encaminha chamadas /api para o backend Express em dev
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
});