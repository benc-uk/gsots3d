import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  sourcemap: false,
  dts: false,
  minify: true,
  clean: true,
  format: 'esm',
  outDir: 'dist-bundle',
  bundle: true,
  loader: {
    '.glsl': 'text',
  },

  // Bundle all dependencies
  noExternal: [/./],
})
