import { defineConfig } from 'vite'

// base: './' makes built asset paths relative, so the production build (npm run build)
// can be dropped into a subfolder of the WordPress site without path breakage.
// publicDir 'public' (the default) means anything in /public is served at the site root —
// that's why the robot frames live in public/frames and load from ./frames/ in the page.
export default defineConfig({
  base: './',
  server: {
    open: true,   
    port: 5173,
  },
})
