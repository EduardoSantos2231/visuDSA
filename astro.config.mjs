// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://EduardoSantos2231.github.io',
  base: '/visuDSA',
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  }
});
