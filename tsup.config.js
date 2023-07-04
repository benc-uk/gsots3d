import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/parsers/index.ts'],
  sourcemap: true,
  dts: true,
  minify: false,
  clean: true,
  format: 'esm',
  outDir: 'dist',
  bundle: true,
  loader: {
    '.glsl': 'text',
  },
})
