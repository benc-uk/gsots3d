// ==================================================================================
// TSUP config file that bundles *everything* including external dependencies
// into a single file. This can be used directly in a browser as an ESM module.
// ==================================================================================

import { defineConfig } from 'tsup'
import { glsl } from 'esbuild-plugin-glsl'

export default defineConfig({
  entryPoints: {
    // This renames the entry point as we'll output a single file
    gsots3d: 'src/index.ts',
  },

  bundle: true,
  splitting: false,
  sourcemap: true,
  dts: false,
  // Note: It's easier to use jsdelivr for minified version
  minify: false,
  clean: true,

  format: 'esm',
  outDir: 'dist-bundle',

  // This is a trick to get TSUP to bundle the external dependencies
  noExternal: [/./],

  esbuildPlugins: [
    // This allows us to import GLSL files and have them bundled
    glsl({
      minify: true,
    }),
  ],
})
