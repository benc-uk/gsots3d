import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  sourcemap: true,
  dts: false,
  minify: false,
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
