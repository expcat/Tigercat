import { execFileSync } from 'node:child_process'
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
  onSuccess: async () => {
    execFileSync(
      process.execPath,
      [
        fileURLToPath(new URL('../../scripts/rewrite-framework-root-index.mjs', import.meta.url)),
        'react'
      ],
      { stdio: 'inherit' }
    )
  },
  splitting: true,
  external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime']
})
