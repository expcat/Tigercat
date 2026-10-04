import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  onSuccess: async () => {
    execFileSync(
      process.execPath,
      [fileURLToPath(new URL('../../scripts/sync-mcp-snapshot.mjs', import.meta.url))],
      { stdio: 'inherit' }
    )
  },
  treeshake: true,
  banner: {
    js: '#!/usr/bin/env node'
  }
})
