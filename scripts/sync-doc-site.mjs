#!/usr/bin/env node

import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const source = join(root, 'skills', 'tigercat', 'references')
const target = join(root, 'docs', 'reference')
const changelogSource = join(root, 'CHANGELOG.md')
const changelogTarget = join(root, 'docs', 'changelog.md')

async function exists(path) {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

async function main() {
  if (!(await exists(source))) {
    throw new Error(`Reference source not found: ${source}`)
  }

  await rm(target, { recursive: true, force: true })
  await mkdir(target, { recursive: true })
  await cp(source, target, { recursive: true })
  await rewriteReferenceLinks()
  await writeReferenceIndex()
  await cp(changelogSource, changelogTarget)

  const entries = await readdir(target)
  console.log(`Synced ${entries.length} reference groups to docs/reference`)
}

async function rewriteReferenceLinks() {
  const propsDir = join(target, 'shared', 'props')
  const files = await readdir(propsDir)

  for (const file of files.filter((name) => name.endsWith('.md'))) {
    const filePath = join(propsDir, file)
    const content = await readFile(filePath, 'utf-8')
    const updated = content
      .replaceAll('(./../vue/', '(../../vue/')
      .replaceAll('(./../react/', '(../../react/')
      .replaceAll('(../vue/', '(../../vue/')
      .replaceAll('(../react/', '(../../react/')
      .replaceAll('(./../i18n)', '(../../i18n)')
      .replaceAll('(./../theme)', '(../../theme)')
      .replaceAll('(./../i18n.md)', '(../../i18n)')
      .replaceAll('(./../theme.md)', '(../../theme)')
      .replaceAll('(../i18n)', '(../../i18n)')
      .replaceAll('(../theme)', '(../../theme)')
      .replaceAll('(../i18n.md)', '(../../i18n)')
      .replaceAll('(../theme.md)', '(../../theme)')
      .replaceAll('(./../../../../CHANGELOG)', '(../../../changelog)')
      .replaceAll('(../../../../CHANGELOG)', '(../../../changelog)')
      .replaceAll('(./../../../../CHANGELOG.md)', '(../../../changelog)')
      .replaceAll('(../../../../CHANGELOG.md)', '(../../../changelog)')

    if (updated !== content) {
      await writeFile(filePath, updated, 'utf-8')
    }
  }
}

async function writeReferenceIndex() {
  const content = `# Reference

This directory is synchronized from \`skills/tigercat/references\` by \`pnpm docs:sync\` before VitePress builds.

- [Vue examples](./vue/)
- [React examples](./react/)
- [Shared props](./shared/props/basic)
- [Theme](./theme)
- [Design Tokens](./tokens)
- [i18n](./i18n)
- [SSR](./ssr)
`

  await writeFile(join(target, 'index.md'), content, 'utf-8')
}

main().catch((error) => {
  console.error('Failed to sync documentation references:', error)
  process.exit(1)
})
