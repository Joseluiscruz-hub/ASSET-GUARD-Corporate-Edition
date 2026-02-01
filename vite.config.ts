import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  base: '/ASSET-GUARD-Corporate-Edition/',
  plugins: [angular()],
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
  resolve: {
    mainFields: ['module', 'main'],
  },
});
