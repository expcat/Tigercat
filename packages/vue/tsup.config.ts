import { defineConfig } from 'tsup'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const componentsDir = join(__dirname, 'src', 'components')
const componentEntries = readdirSync(componentsDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
  .map((entry) => `src/components/${entry.name}`)

export default defineConfig({
  entry: ['src/index.ts', ...componentEntries],
  format: ['esm'],
  dts: true,
  clean: true,
  treeshake: true,
  splitting: true,
  external: ['vue', 'tailwindcss']
})
