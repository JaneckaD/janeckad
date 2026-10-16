import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const page = (path) => fileURLToPath(new URL(path, import.meta.url));

// Na GitHub Pages běží web v podsložce (/janeckad/), lokálně v kořeni.
// Cestu nastavuje automatické nasazení přes proměnnou BASE_PATH.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  build: {
    // web má dvě stránky: hlavní a /portfolio/
    rollupOptions: {
      input: {
        main: page('./index.html'),
        portfolio: page('./portfolio/index.html'),
      },
    },
  },
});
