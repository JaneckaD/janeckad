import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import seo from './vite.seo.js';

const page = (path) => fileURLToPath(new URL(path, import.meta.url));

// Relativní cesty: stejný build funguje na davix.cz i na janeckad.github.io/janeckad/.
export default defineConfig({
  base: './',
  plugins: [seo()],
  build: {
    rollupOptions: {
      input: {
        main: page('./index.html'),
        portfolio: page('./portfolio/index.html'),
        notfound: page('./404.html'),
      },
    },
  },
});
