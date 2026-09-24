import { defineConfig } from 'tsup'
import { buildCoreTsupEntries } from '../../scripts/lib/public-components.mjs'

export default defineConfig({
  entry: buildCoreTsupEntries(),
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: false,
  splitting: true
})
