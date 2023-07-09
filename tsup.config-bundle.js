import { defineConfig } from 'tsup'
import process from 'process'

const NODE_ENV = process.env.NODE_ENV || 'development'

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  sourcemap: true,
  dts: false,
  minify: NODE_ENV === 'production',
  clean: true,
  format: 'esm',
  outDir: 'dist-bundle',
  bundle: true,
  loader: {
    '.vert': 'text',
    '.frag': 'text',
  },

  // Bundle all dependencies
  noExternal: [/./],
})
