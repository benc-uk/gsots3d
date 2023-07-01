import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/parsers/index.ts'],
  splitting: false,
  sourcemap: true,
  dts: true,
  minify: false,
  clean: true,
  format: 'esm',
  outDir: 'dist',
  bundle: true,
})
