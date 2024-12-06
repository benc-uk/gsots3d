// config for vite
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'esnext',
    assetsInlineLimit: 0,
  },
  assetsInclude: ['**/*.obj'],
})
