// ==================================================================================
// TSUP config file that creates the regular build that can be used in Node.js
// ==================================================================================

import { defineConfig } from 'tsup'
import { glsl } from 'esbuild-plugin-glsl'

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

  esbuildPlugins: [
    // This allows us to import GLSL files and have them bundled
    glsl({
      minify: true,
    }),
  ],
})
