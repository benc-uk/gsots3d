// ==================================================================================
// TSUP config file that bundles *everything* including external dependencies
// into a single file. This can be used directly in a browser as an ESM module.
// ==================================================================================

import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],

  bundle: true,
  splitting: false,
  sourcemap: true,
  dts: false,
  // Note: It's easier to use jsdelivr for minified version
  minify: false,
  clean: true,

  format: 'esm',
  outDir: 'dist-bundle',

  loader: {
    '.vert': 'text',
    '.frag': 'text',
  },

  // This is a trick to get TSUP to bundle the external dependencies
  noExternal: [/./],
})
