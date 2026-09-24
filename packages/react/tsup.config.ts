import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'tsup'
import {
  buildFrameworkTsupEntries,
  loadPublicComponentExports
} from '../../scripts/lib/public-components.mjs'

const root = fileURLToPath(new URL('../..', import.meta.url))
const indexContent = readFileSync(new URL('./src/index.tsx', import.meta.url), 'utf8')
const components = loadPublicComponentExports(root).react

export default defineConfig({
  entry: buildFrameworkTsupEntries(components, 'react', indexContent),
  format: ['esm'],
  dts: {
    compilerOptions: {
      rootDir: '..'
    }
  },
  clean: true,
  splitting: true,
  external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime']
})
