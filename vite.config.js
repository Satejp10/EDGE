import { defineConfig } from 'vite';

// base: './' keeps all asset URLs relative, so the built site works whether it's
// served from a domain root or a project subpath like https://satejp10.github.io/EDGE/.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
});
