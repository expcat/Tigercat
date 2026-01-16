import { defineConfig } from 'tsup'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const componentsDir = join(__dirname, 'src', 'components')
const componentEntries = readdirSync(componentsDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.tsx'))
  .map((entry) => `src/components/${entry.name}`)

export default defineConfig({
  entry: ['src/index.tsx', ...componentEntries],
  format: ['esm'],
  dts: true,
  clean: true,
  treeshake: true,
  splitting: true,
  external: [
    'react',
    'react-dom',
    'react-dom/client',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    'tailwindcss'
  ]
})
