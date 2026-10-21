import { defineConfig } from 'tsup'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { isPortableExample } from './src/utils/portable-example'

/**
 * Copy the portable per-component 01 examples next to the bundle so the
 * `add` command works from a published or relocated dist. Only samples whose
 * imports all resolve to published packages are bundled; samples depending on
 * repo-only aliases (@demo-shared/*) are skipped, and `add` skips writing a
 * demo for those components.
 */
function copyExampleResources(): number {
  let copied = 0
  for (const side of [
    { dir: 'vue3', entry: 'App.vue' },
    { dir: 'react', entry: 'App.tsx' }
  ] as const) {
    const sideRoot = join(__dirname, '..', '..', 'examples', 'example', side.dir, 'src', 'examples')
    if (!existsSync(sideRoot)) continue
    for (const kebab of readdirSync(sideRoot)) {
      const source = join(sideRoot, kebab, '01', side.entry)
      if (!existsSync(source)) continue
      const content = readFileSync(source, 'utf8')
      if (!isPortableExample(content)) continue
      const target = join(__dirname, 'dist', 'examples', side.dir, kebab, side.entry)
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, content)
      copied += 1
    }
  }
  return copied
}

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  treeshake: true,
  banner: {
    js: '#!/usr/bin/env node'
  },
  async onSuccess() {
    const copied = copyExampleResources()
    console.log(`Copied ${copied} portable example files into dist/examples`)
  }
})
