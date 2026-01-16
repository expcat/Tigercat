import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/styles/index.css'],
  format: ['esm'],
  dts: true,
  clean: true,
  treeshake: true,
  external: ['tailwindcss']
})
