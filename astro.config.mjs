import { defineConfig } from 'astro/config';

const site = 'https://svenpanel.github.io/the-shrine-ng/';

export default defineConfig({
  site,
  base: '/the-shrine-ng',
  output: 'static'
});
