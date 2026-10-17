import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const page = (path) => fileURLToPath(new URL(path, import.meta.url));

// Relativní cesty: stejný build funguje na davix.cz i na janeckad.github.io/janeckad/.
export default defineConfig({
  base: './',
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
