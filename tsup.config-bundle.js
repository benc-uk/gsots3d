import { defineConfig } from 'tsup'
import process from 'process'

const NODE_ENV = process.env.NODE_ENV || 'development'

export default defineConfig({
  entry: ['src/index.ts'],

  bundle: true,
  splitting: false,
  sourcemap: true,
  dts: false,
  minify: NODE_ENV === 'production',
  clean: true,

  format: 'esm',
  outDir: 'dist-bundle',

  loader: {
    '.vert': 'text',
    '.frag': 'text',
  },

  // This is a trick to get TSUP to bundle the dependencies
  noExternal: [/./],
})
