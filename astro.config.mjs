import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://learn.wh1isper.top',
  output: 'static',
  trailingSlash: 'always',
  markdown: { syntaxHighlight: false },
});
