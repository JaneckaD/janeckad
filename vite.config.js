import { defineConfig } from 'vite';

// Na GitHub Pages běží web v podsložce (/janeckad/), lokálně v kořeni.
// Cestu nastavuje automatické nasazení přes proměnnou BASE_PATH.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
});
