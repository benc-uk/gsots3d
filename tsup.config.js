// ==================================================================================
// TSUP config file that creates the regular build that can be used in Node.js
// ==================================================================================

import { defineConfig } from 'tsup'
import process from 'process'

const NODE_ENV = process.env.NODE_ENV || 'development'

export default defineConfig({
  entry: ['src/index.ts', 'src/parsers/index.ts'],

  bundle: true,
  splitting: false,
  sourcemap: true,
  dts: true,
  minify: NODE_ENV === 'production',
  clean: true,

  format: 'esm',
  outDir: 'dist',

  loader: {
    '.vert': 'text',
    '.frag': 'text',
  },
})
