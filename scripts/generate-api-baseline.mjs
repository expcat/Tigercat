#!/usr/bin/env node

/**
 * generate-api-baseline.mjs — 公共 API 基线快照生成器
 *
 * 产出 api-reports/public-api-baseline.json：一份确定性的公共 API 快照，配合
 * 「生成 + git diff」式护栏（与 docs:api 漂移闸同范式）捕捉版本间破坏性变更——
 * 删除导出 / 删 prop / 改名 / 改 extends 都会让快照产生 diff，必须有意（regenerate
 * 并记入 docs/MIGRATION.md）。与 validate-api.mjs（当下双端一致性）层次互补：本快照
 * 防的是「与上一提交版相比」的回归。
 *
 * 快照内容（均排序、确定性输出）：
 *  - propsInterfaces：core/src/types/*.ts 中每个 `*Props` 接口的 own props 与 extends 基类
 *  - core.exports：core index.ts 以 `export *` 暴露的子模块中所有导出声明 / 重导出名
 *  - vue / react：各 index 文件的命名导出（exports）与公开组件列表（components）
 *
 * 不含版本号（版本对齐由 check-release-readiness.mjs 守护），使快照仅在 API 形状
 * 真正变化时才 diff。
 *
 * 用法：
 *   node scripts/generate-api-baseline.mjs           # 写入快照
 *   pnpm api:baseline                                # 同上
 */

import { readFileSync, readdirSync, writeFileSync, existsSync, statSync, mkdirSync } from 'fs'
import { join, relative } from 'path'
import { fileURLToPath } from 'url'
import prettier from 'prettier'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..')
const CORE_SRC = join(ROOT, 'packages', 'core', 'src')
const TYPES_DIR = join(CORE_SRC, 'types')
const OUT_DIR = join(ROOT, 'api-reports')
const OUT_FILE = join(OUT_DIR, 'public-api-baseline.json')

// Submodules that packages/core/src/index.ts re-exports via `export *`.
const CORE_EXPORT_TARGETS = [
  'utils',
  'types',
  'theme-runtime',
  'themes',
  'tokens',
  'tailwind-plugin'
]

const uniqSorted = (arr) => [...new Set(arr)].sort((a, b) => a.localeCompare(b))

function collectFiles(dir, exts) {
  const out = []
  if (!existsSync(dir)) return out
  if (statSync(dir).isFile()) return exts.some((e) => dir.endsWith(e)) ? [dir] : []
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === '.nuxt') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...collectFiles(full, exts))
    else if (exts.some((e) => entry.endsWith(e))) out.push(full)
  }
  return out
}

// Resolve a core re-export target that may be a directory or a single `.ts(x)` file.
function resolveTarget(name) {
  const dir = join(CORE_SRC, name)
  if (existsSync(dir) && statSync(dir).isDirectory()) return collectFiles(dir, ['.ts', '.tsx'])
  for (const ext of ['.ts', '.tsx']) {
    const file = join(CORE_SRC, name + ext)
    if (existsSync(file)) return [file]
  }
  return []
}

// Names exported from a source file: declaration exports + `export { ... }` specifiers
// (including `export type { ... }` and re-exports). Captures the externally visible name
// (alias when `X as Y`). `export *` wildcards are skipped (their targets are walked directly).
function extractExportNames(content) {
  const names = []

  const declRe =
    /^\s*export\s+(?:declare\s+)?(?:abstract\s+)?(?:const|let|var|function|async\s+function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/gm
  let m
  while ((m = declRe.exec(content)) !== null) names.push(m[1])

  const blockRe = /export\s+(?:type\s+)?\{([^}]*)\}/g
  while ((m = blockRe.exec(content)) !== null) {
    for (let spec of m[1].split(',')) {
      spec = spec.trim().replace(/^type\s+/, '')
      if (!spec || spec === 'default') continue
      const parts = spec.split(/\s+as\s+/)
      const name = (parts[1] || parts[0]).trim()
      if (/^[A-Za-z_$][\w$]*$/.test(name)) names.push(name)
    }
  }

  return names
}

// Read a balanced `{ ... }` block; openIdx points at the opening brace.
function readBalanced(content, openIdx) {
  let depth = 0
  for (let i = openIdx; i < content.length; i++) {
    const ch = content[i]
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return { body: content.slice(openIdx + 1, i), end: i + 1 }
    }
  }
  return { body: content.slice(openIdx + 1), end: content.length }
}

// Collapse nested object-type bodies so only top-level interface members remain.
function stripNested(body) {
  let prev
  do {
    prev = body
    body = body.replace(/\{[^{}]*\}/g, '{}')
  } while (body !== prev)
  return body
}

function extractMembers(body) {
  const stripped = stripNested(body)
  const names = []
  // Member starts after line/statement boundary: `name?:` or `name(` (methods).
  const re = /(?:^|[;\n,])\s*(?:readonly\s+)?([A-Za-z_$][\w$]*)\s*\??\s*[:(]/g
  let m
  while ((m = re.exec(stripped)) !== null) names.push(m[1])
  return uniqSorted(names)
}

function parseHeritage(text) {
  const m = text.match(/\bextends\s+([^{]+)/)
  if (!m) return []
  return uniqSorted(
    m[1]
      .split(',')
      .map((s) => s.replace(/<[^>]*>/g, '').trim())
      .filter(Boolean)
  )
}

function extractPropsInterfaces(content) {
  const result = {}
  const re = /export\s+interface\s+([A-Za-z_$][\w$]*Props)([^{]*)\{/g
  let m
  while ((m = re.exec(content)) !== null) {
    const name = m[1]
    const heritage = m[2]
    const openIdx = re.lastIndex - 1
    const { body, end } = readBalanced(content, openIdx)
    result[name] = { extends: parseHeritage(heritage), props: extractMembers(body) }
    re.lastIndex = end
  }
  return result
}

// Public component value exports (`export { X } from './components/...'`), PascalCase, skip *Context.
function componentExports(indexContent) {
  const set = new Set()
  const re = /export\s+\{([^}]+)\}\s+from\s+['"]\.\/components\//g
  let m
  while ((m = re.exec(indexContent)) !== null) {
    for (const spec of m[1].split(',')) {
      const name = spec
        .trim()
        .split(/\s+as\s+/)[0]
        .trim()
      if (/^[A-Z]/.test(name) && !/Context$/.test(name)) set.add(name)
    }
  }
  return uniqSorted([...set])
}

function sortKeys(value) {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object') {
    const out = {}
    for (const key of Object.keys(value).sort((a, b) => a.localeCompare(b))) {
      out[key] = sortKeys(value[key])
    }
    return out
  }
  return value
}

// --- Build snapshot ---

const propsInterfaces = {}
for (const file of collectFiles(TYPES_DIR, ['.ts'])) {
  Object.assign(propsInterfaces, extractPropsInterfaces(readFileSync(file, 'utf-8')))
}

const coreExportNames = []
for (const target of CORE_EXPORT_TARGETS) {
  for (const file of resolveTarget(target)) {
    coreExportNames.push(...extractExportNames(readFileSync(file, 'utf-8')))
  }
}

const vueIndex = readFileSync(join(ROOT, 'packages', 'vue', 'src', 'index.ts'), 'utf-8')
const reactIndex = readFileSync(join(ROOT, 'packages', 'react', 'src', 'index.tsx'), 'utf-8')

const snapshot = sortKeys({
  _comment:
    'Generated by scripts/generate-api-baseline.mjs — do not edit by hand. Run `pnpm api:baseline` to regenerate. A diff means the public API changed and must be intentional (record breaking changes in docs/MIGRATION.md).',
  propsInterfaces,
  core: { exports: uniqSorted(coreExportNames) },
  vue: {
    components: componentExports(vueIndex),
    exports: uniqSorted(extractExportNames(vueIndex))
  },
  react: {
    components: componentExports(reactIndex),
    exports: uniqSorted(extractExportNames(reactIndex))
  }
})

const prettierConfig = (await prettier.resolveConfig(OUT_FILE)) ?? {}
const formattedSnapshot = await prettier.format(JSON.stringify(snapshot, null, 2), {
  ...prettierConfig,
  parser: 'json'
})

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(OUT_FILE, formattedSnapshot)

console.log(
  `Public API baseline written to ${relative(ROOT, OUT_FILE)} — ` +
    `${Object.keys(propsInterfaces).length} props interfaces, ` +
    `${snapshot.core.exports.length} core exports, ` +
    `${snapshot.vue.components.length} vue / ${snapshot.react.components.length} react components.`
)
