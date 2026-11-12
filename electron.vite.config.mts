import { defineConfig } from 'electron-vite'

export default defineConfig({
  main: { build: { rollupOptions: { output: { format: 'es', entryFileNames: 'index.mjs' } } } },
  preload: {},
  renderer: {}
})
