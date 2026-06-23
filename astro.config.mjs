import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build
export default defineConfig({
  site: 'https://your-domain.com',
  output: 'static',
  adapter: cloudflare(),
});