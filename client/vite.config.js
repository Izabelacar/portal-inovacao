import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

<<<<<<< HEAD
// Ao publicar no GitHub Pages, o site fica em
// https://SEU-USUARIO.github.io/NOME-DO-REPO/ — troque o "base" abaixo
// pelo nome exato do seu repositório (com as barras "/" no começo e no fim).
// Em desenvolvimento local isso não afeta nada.
export default defineConfig({
  base: '/PORTAL-INOVACAO/',
=======
export default defineConfig({
>>>>>>> f62d7863e58360d65edb3f16471c986938deda61
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Encaminha chamadas /api para o backend Express em dev
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
