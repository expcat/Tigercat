#!/usr/bin/env node

/**
 * validate-api.mjs — API 一致性自动扫描脚本
 *
 * 读取 packages/core/src/types/*.ts 提取所有 Props 接口，
 * 检查命名、类型和默认值的一致性。
 *
 * 用法：node scripts/validate-api.mjs [--json]
 */

import { readFileSync, readdirSync, writeFileSync, existsSync, statSync, mkdtempSync } from 'fs'
import { tmpdir } from 'os'
import { join, basename, relative } from 'path'
import { fileURLToPath } from 'url'
import { loadPublicComponentExports } from './lib/public-components.mjs'
import { collectFiles as collectFilesIn } from './utils/files.mjs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..')
const TYPES_DIR = join(ROOT, 'packages', 'core', 'src', 'types')
const SKILL_REFERENCES_DIR = join(ROOT, 'skills', 'tigercat', 'references')
const jsonMode = process.argv.includes('--json')
const publicExports = loadPublicComponentExports(ROOT)
const vuePublicComponents = new Set(publicExports.vue)
const reactPublicComponents = new Set(publicExports.react)

// ----- Rules -----

// Standard prop names (should NOT use alternatives)
const PROP_ALTERNATIVES = [
  { bad: 'isDisabled', good: 'disabled', regex: /\bisDisabled\b/ },
  { bad: 'isLoading', good: 'loading', regex: /\bisLoading\b/ },
  { bad: 'isOpen', good: 'open', regex: /\bisOpen\b/ },
  { bad: 'isVisible', good: 'open', regex: /\bisVisible\b/ },
  { bad: 'visible', good: 'open', regex: /\bvisible\s*[\?]?\s*:/ }
]

// Collect issues
const issues = []

function formatIssueFile(file) {
  if (file === 'cross-framework') return file
  if (file.startsWith(ROOT)) return relative(ROOT, file)
  return file
}

function addIssue(file, line, rule, message) {
  issues.push({ file: formatIssueFile(file), line, rule, message })
}

// ----- Scanning -----

const typeFiles = readdirSync(TYPES_DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts')
const coreFileInfoByName = new Map()

for (const filename of typeFiles) {
  const filepath = join(TYPES_DIR, filename)
  const content = readFileSync(filepath, 'utf-8')
  const lines = content.split('\n')
  coreFileInfoByName.set(basename(filename, '.ts'), {
    fileName: filename,
    typeName: basename(filename, '.ts'),
    propsInterfaces: [...content.matchAll(/\bexport\s+interface\s+([A-Za-z_$][\w$]*Props)\b/g)].map(
      (match) => match[1]
    )
  })

  lines.forEach((line, idx) => {
    const lineNum = idx + 1

    // Skip deprecated props (check preceding JSDoc block)
    const isDeprecated = (() => {
      for (let i = idx - 1; i >= Math.max(0, idx - 10); i--) {
        if (lines[i].includes('@deprecated')) return true
        if (/^\s*(export|interface|type)\b/.test(lines[i])) break
      }
      return false
    })()

    // Check for bad prop naming alternatives
    for (const alt of PROP_ALTERNATIVES) {
      if (alt.regex.test(line) && !isDeprecated) {
        addIssue(filepath, lineNum, 'naming', `使用 "${alt.bad}" 应改为 "${alt.good}"`)
      }
    }
  })
}

// ----- Vue component scan (check events/emits naming) -----

const VUE_COMPONENTS_DIR = join(ROOT, 'packages', 'vue', 'src', 'components')
const INTERNAL_COMPONENT_MODULES = new Set(['MessageRoot', 'NotificationRoot', 'LoadingBarRoot'])
const vueFiles = readdirSync(VUE_COMPONENTS_DIR).filter(
  (f) => f.endsWith('.ts') && !INTERNAL_COMPONENT_MODULES.has(f.replace('.ts', ''))
)

for (const filename of vueFiles) {
  const filepath = join(VUE_COMPONENTS_DIR, filename)
  const content = readFileSync(filepath, 'utf-8')
  const lines = content.split('\n')

  lines.forEach((line, idx) => {
    const lineNum = idx + 1

    // Check for camelCase emit names (should be kebab-case)
    if (/emit\s*\(\s*'[a-z]+[A-Z]/.test(line)) {
      const match = line.match(/emit\s*\(\s*'([^']+)'/)
      if (match) {
        addIssue(filepath, lineNum, 'vue-event', `Vue 事件名 "${match[1]}" 应使用 kebab-case`)
      }
    }
  })
}

// ----- React component scan (check event handlers are camelCase) -----

const REACT_COMPONENTS_DIR = join(ROOT, 'packages', 'react', 'src', 'components')
const reactFiles = readdirSync(REACT_COMPONENTS_DIR).filter(
  (f) => f.endsWith('.tsx') && !INTERNAL_COMPONENT_MODULES.has(f.replace('.tsx', ''))
)

for (const filename of reactFiles) {
  const filepath = join(REACT_COMPONENTS_DIR, filename)
  const content = readFileSync(filepath, 'utf-8')
  const lines = content.split('\n')

  lines.forEach((line, idx) => {
    const lineNum = idx + 1

    // Check for kebab-case event props in React interface definitions
    // Only match inside interface/type blocks (lines with prop?: or prop:)
    if (/^\s+(on-[a-z]+)\s*[\?]?\s*:/.test(line)) {
      const match = line.match(/^\s+(on-[a-z-]+)\s*[\?]?\s*:/)
      if (match) {
        addIssue(
          filepath,
          lineNum,
          'react-event',
          `React 事件 prop "${match[1]}" 应使用 camelCase (如 onChange)`
        )
      }
    }
  })
}

// ----- Cross-framework consistency check -----

// Compare public components; framework-local helper files are not components.
for (const name of vuePublicComponents) {
  if (!reactPublicComponents.has(name)) {
    addIssue('cross-framework', 0, 'missing-react', `Vue 组件 "${name}" 在 React 中缺失`)
  }
}

for (const name of reactPublicComponents) {
  if (!vuePublicComponents.has(name)) {
    addIssue('cross-framework', 0, 'missing-vue', `React 组件 "${name}" 在 Vue 中缺失`)
  }
}

// ----- Overlay API design audit (open / update:open / onOpenChange) -----

// Components that define `open?: boolean` in their type must have:
//   Vue  → `update:open` in emits
//   React → `onOpenChange` callback prop
// This prevents introducing `visible` and ensures overlay API symmetry.

const componentsWithOpen = new Set()
const OPEN_PARITY_SKIP_COMPONENTS = new Set([
  'ChartTooltip',
  'BaseFloatingPopup',
  'ImageViewerBase',
  // Tag is not an overlay: close requests are cancellable by the parent, which owns visibility.
  'Tag'
])

for (const filename of typeFiles) {
  const filepath = join(TYPES_DIR, filename)
  const content = readFileSync(filepath, 'utf-8')

  // Find interfaces that have an `open` prop (not deprecated)
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    // Look for `open?: boolean` or `open: boolean` prop declarations
    if (/^\s+open\s*[?]?\s*:\s*boolean/.test(lines[i])) {
      // Check it's not deprecated
      const isDeprecated = (() => {
        for (let k = i - 1; k >= Math.max(0, i - 5); k--) {
          if (lines[k].includes('@deprecated')) return true
          if (/^\s*(export|interface|type)\b/.test(lines[k])) break
        }
        return false
      })()
      if (isDeprecated) continue

      // Find the enclosing interface name
      for (let k = i - 1; k >= 0; k--) {
        const ifaceMatch = lines[k].match(/(?:export\s+)?interface\s+(\w+)/)
        if (ifaceMatch) {
          // Derive component name from interface (e.g. ModalProps → Modal)
          const compName = ifaceMatch[1].replace(/Props$/, '')
          componentsWithOpen.add(compName)
          break
        }
      }
    }
  }
}

for (const compName of componentsWithOpen) {
  if (OPEN_PARITY_SKIP_COMPONENTS.has(compName)) continue

  // Check Vue: must have 'update:open' in emits
  const vueFile = join(VUE_COMPONENTS_DIR, `${compName}.ts`)
  if (existsSync(vueFile)) {
    const vueContent = readFileSync(vueFile, 'utf-8')
    if (!vueContent.includes("'update:open'") && !vueContent.includes('"update:open"')) {
      addIssue(
        `${compName}.ts`,
        0,
        'overlay-api',
        `Vue 组件 "${compName}" 有 open 属性但缺少 update:open 事件（无法 v-model:open）`
      )
    }
  }

  // Check React: onOpenChange may live on the core type, the main file, or a split types module.
  const reactSource = readComponentSource(REACT_COMPONENTS_DIR, compName, '.tsx')
  const coreTypeInfo = [...coreFileInfoByName.values()].find((info) =>
    info.propsInterfaces.some(
      (name) => name === `${compName}Props` || name.endsWith(`${compName}Props`)
    )
  )
  const coreTypeFile = coreTypeInfo
    ? join(TYPES_DIR, coreTypeInfo.fileName)
    : join(TYPES_DIR, `${compName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}.ts`)
  const coreTypeSource = existsSync(coreTypeFile) ? readFileSync(coreTypeFile, 'utf-8') : ''
  if (
    (reactSource || coreTypeSource) &&
    !/\bonOpenChange\s*[?]?\s*:/.test(`${reactSource}\n${coreTypeSource}`)
  ) {
    addIssue(
      `${compName}.tsx`,
      0,
      'overlay-api',
      `React 组件 "${compName}" 有 open 属性但缺少 onOpenChange 回调`
    )
  }
}

// ----- Controlled-prop parity audit (受控量双端对称) -----
//
// 把上面的 open overlay 规则推广为一张「受控量 parity 表」。对登记的受控量 X：
//   Vue   → emits 含 `update:X`（可 v-model:X）
//   React → 存在 `on<Prop>Change` 回调（默认按 prop 名派生，可按条目覆盖）
//
// 命名按 prop 名派生，因此 onIndexChange / onHiddenColumnsChange 这类与受控
// prop 名不一致的回调会被自动发现。注意：不做全自动派生——Vue `update:modelValue`
// ↔ React `value`+`onChange`、React 主 `onChange`、以及 `x-change` 普通事件等
// 框架惯用差异会产生大量误报；故采用「显式登记 + 白名单」，可随新增受控组件扩充。
//
// 组件实现可能拆分到 `<Comp>/` 子目录（如 Table），故读取主文件 + 同名子目录。

const CONTROLLED_PARITY = [
  { prop: 'currentIndex', components: ['ImagePreview'] },
  // React 端历史回调名为 onExpandedChange（非派生的 onExpandedKeysChange），显式登记。
  { prop: 'expandedKeys', components: ['CommentThread'], reactCallback: 'onExpandedChange' },
  { prop: 'query', components: ['Spotlight'] },
  { prop: 'hiddenColumnKeys', components: ['Table', 'DataTableWithToolbar'] }
]

// 有意的非对称：登记 `Component:prop`（含理由）后跳过该项校验。
const PARITY_WHITELIST = new Set([])

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

// 读取组件源码：主文件 + 同名子目录下的所有 ts/tsx（兼容拆分组件）。
function readComponentSource(baseDir, compName, ext) {
  let content = ''
  const mainFile = join(baseDir, `${compName}${ext}`)
  if (existsSync(mainFile)) content += readFileSync(mainFile, 'utf-8')
  const subDir = join(baseDir, compName)
  if (existsSync(subDir) && statSync(subDir).isDirectory()) {
    for (const file of collectFiles(subDir, ['.ts', '.tsx'])) {
      content += `\n${readFileSync(file, 'utf-8')}`
    }
  }
  return content
}

for (const entry of CONTROLLED_PARITY) {
  const { prop, components } = entry
  const vueEvent = entry.vueEvent ?? `update:${prop}`
  const reactCallback = entry.reactCallback ?? `on${capitalize(prop)}Change`

  for (const compName of components) {
    if (PARITY_WHITELIST.has(`${compName}:${prop}`)) continue

    const vueSource = readComponentSource(VUE_COMPONENTS_DIR, compName, '.ts')
    if (vueSource && !vueSource.includes(`'${vueEvent}'`) && !vueSource.includes(`"${vueEvent}"`)) {
      addIssue(
        `${compName}.ts`,
        0,
        'controlled-parity',
        `Vue 组件 "${compName}" 的受控量 "${prop}" 缺少 ${vueEvent} 事件（无法 v-model:${prop}）`
      )
    }

    const reactSource = readComponentSource(REACT_COMPONENTS_DIR, compName, '.tsx')
    if (reactSource && !new RegExp(`\\b${reactCallback}\\b`).test(reactSource)) {
      addIssue(
        `${compName}.tsx`,
        0,
        'controlled-parity',
        `React 组件 "${compName}" 的受控量 "${prop}" 缺少 ${reactCallback} 回调（应与 update:${prop} 对称）`
      )
    }
  }
}

// ----- Deprecated public API guard -----

/**
 * Scan public source directories for @deprecated JSDoc annotations and extract
 * the deprecated symbol name from the following code line.
 */
function collectDeprecatedAPIs() {
  const deprecated = []
  const srcDirs = [
    join(ROOT, 'packages', 'core', 'src', 'types'),
    join(ROOT, 'packages', 'core', 'src', 'utils'),
    join(ROOT, 'packages', 'vue', 'src', 'components'),
    join(ROOT, 'packages', 'react', 'src', 'components')
  ]

  for (const dir of srcDirs) {
    if (!existsSync(dir)) continue
    const files = collectFiles(dir, ['.ts', '.tsx'])
    for (const filepath of files) {
      const content = readFileSync(filepath, 'utf-8')
      const lines = content.split('\n')

      for (let i = 0; i < lines.length; i++) {
        if (!lines[i].includes('@deprecated')) continue

        // Walk forward to find the symbol declared after the deprecation tag
        for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
          const next = lines[j].trim()
          // Skip JSDoc continuation lines and blank lines
          if (next === '' || next.startsWith('*') || next.startsWith('//') || next === '/**')
            continue

          // Interface/type property: `  propName?: Type`
          const propMatch = next.match(/^(\w+)\s*[?]?\s*:/)
          if (propMatch) {
            deprecated.push({ name: propMatch[1], kind: 'prop', file: filepath, line: j + 1 })
            break
          }

          // Emit string in array: `'event-name'`
          const emitMatch = next.match(/^['"]([\w-]+)['"]\s*[,\]]?/)
          if (emitMatch) {
            deprecated.push({ name: emitMatch[1], kind: 'event', file: filepath, line: j + 1 })
            break
          }

          // export (const|function|let|var) name
          const exportMatch = next.match(/(?:export\s+)?(?:const|function|let|var)\s+(\w+)/)
          if (exportMatch) {
            deprecated.push({ name: exportMatch[1], kind: 'symbol', file: filepath, line: j + 1 })
            break
          }

          break
        }
      }
    }
  }
  return deprecated
}

/**
 * Recursively collect all source files under a directory.
 * Skips node_modules/dist/.nuxt to match the previous in-script behavior.
 */
function collectFiles(dir, extensions) {
  return collectFilesIn(dir, extensions, { skip: ['node_modules', 'dist', '.nuxt'] })
}

const deprecatedAPIs = collectDeprecatedAPIs()

for (const api of deprecatedAPIs) {
  addIssue(api.file, api.line, 'public-deprecated', `公开 API "${api.name}" 不得标记 @deprecated`)
}

// ----- Skill docs quality budget -----

const SKILL_DOC_BUDGETS = {
  entryBytes: 2600,
  roadmapLines: 24,
  totalMarkdownLines: 3800,
  apiSummaryBytes: 16500,
  propsCategoryLines: 400,
  handReferenceLines: 120
}

const skillMarkdownFiles = collectFiles(join(ROOT, 'skills', 'tigercat'), ['.md'])
let totalSkillMarkdownLines = 0

function isGeneratedSkillReference(relativeFile) {
  return (
    relativeFile.includes(join('references', 'examples')) ||
    relativeFile.includes(join('references', 'shared', 'props')) ||
    relativeFile.endsWith(join('references', 'component-index.md')) ||
    relativeFile.endsWith(join('references', 'shared', 'api-summary.md')) ||
    relativeFile.endsWith(join('react', 'index.md')) ||
    relativeFile.endsWith(join('vue', 'index.md'))
  )
}

for (const file of skillMarkdownFiles) {
  const content = readFileSync(file, 'utf-8')
  const lines = content.split(/\r?\n/)
  const relativeFile = relative(ROOT, file)
  if (!isGeneratedSkillReference(relativeFile)) {
    totalSkillMarkdownLines += lines.length
  }

  if (relativeFile === join('skills', 'tigercat', 'SKILL.md')) {
    const bytes = Buffer.byteLength(content, 'utf8')
    if (bytes > SKILL_DOC_BUDGETS.entryBytes) {
      addIssue(
        relativeFile,
        0,
        'docs-budget',
        `SKILL.md is ${bytes} bytes, expected <= ${SKILL_DOC_BUDGETS.entryBytes}`
      )
    }
  }

  if (relativeFile === join('skills', 'tigercat', 'ROADMAP.md')) {
    if (lines.length > SKILL_DOC_BUDGETS.roadmapLines) {
      addIssue(
        relativeFile,
        0,
        'docs-budget',
        `Skill maintainer roadmap has ${lines.length} lines, expected <= ${SKILL_DOC_BUDGETS.roadmapLines}`
      )
    }
  }

  if (relativeFile === join('skills', 'tigercat', 'references', 'shared', 'api-summary.md')) {
    const bytes = Buffer.byteLength(content, 'utf8')
    if (bytes > SKILL_DOC_BUDGETS.apiSummaryBytes) {
      addIssue(
        relativeFile,
        0,
        'docs-budget',
        `API summary is ${bytes} bytes, expected <= ${SKILL_DOC_BUDGETS.apiSummaryBytes}`
      )
    }
  }

  if (relativeFile.includes(join('skills', 'tigercat', 'references', 'shared', 'props'))) {
    if (lines.length > SKILL_DOC_BUDGETS.propsCategoryLines) {
      addIssue(
        relativeFile,
        0,
        'docs-budget',
        `Props reference has ${lines.length} lines, expected <= ${SKILL_DOC_BUDGETS.propsCategoryLines}`
      )
    }
  } else if (
    relativeFile.startsWith(join('skills', 'tigercat', 'references')) &&
    !isGeneratedSkillReference(relativeFile)
  ) {
    if (lines.length > SKILL_DOC_BUDGETS.handReferenceLines) {
      addIssue(
        relativeFile,
        0,
        'docs-budget',
        `Hand-written reference has ${lines.length} lines, expected <= ${SKILL_DOC_BUDGETS.handReferenceLines}`
      )
    }
  }

  lines.forEach((line, index) => {
    const ordinarySkillRoute =
      relativeFile === join('skills', 'tigercat', 'SKILL.md') ||
      relativeFile.startsWith(join('skills', 'tigercat', 'references'))
    if (ordinarySkillRoute && /\bROADMAP\.md\b/.test(line)) {
      addIssue(
        relativeFile,
        index + 1,
        'docs-route',
        'Ordinary skill routes must not link to maintainer Roadmap content'
      )
    }

    const tableCellCount = (line.match(/(?<!\\)\|/g) || []).length
    if (line.trim().startsWith('|') && tableCellCount > 10) {
      addIssue(
        relativeFile,
        index + 1,
        'docs-table',
        'Markdown table row appears too wide or malformed'
      )
    }
  })
}

if (totalSkillMarkdownLines > SKILL_DOC_BUDGETS.totalMarkdownLines) {
  addIssue(
    'skills/tigercat',
    0,
    'docs-budget',
    `Skill markdown has ${totalSkillMarkdownLines} lines, expected <= ${SKILL_DOC_BUDGETS.totalMarkdownLines}`
  )
}

// ----- Report -----

if (jsonMode) {
  const report = {
    timestamp: new Date().toISOString(),
    totalIssues: issues.length,
    byRule: {},
    issues
  }
  for (const issue of issues) {
    report.byRule[issue.rule] = (report.byRule[issue.rule] || 0) + 1
  }
  const outDir = mkdtempSync(join(tmpdir(), 'tigercat-validate-api-'))
  const outPath = join(outDir, 'api-consistency-report.json')
  writeFileSync(outPath, JSON.stringify(report, null, 2))
  console.log(`Report written to ${outPath}`)
} else {
  // Terminal-friendly output
  if (issues.length === 0) {
    console.log('\n✅ API 一致性检查通过！没有发现问题。\n')
  } else {
    console.log(`\n⚠️  发现 ${issues.length} 个 API 一致性问题:\n`)

    // Group by rule
    const grouped = {}
    for (const issue of issues) {
      if (!grouped[issue.rule]) grouped[issue.rule] = []
      grouped[issue.rule].push(issue)
    }

    const ruleLabels = {
      naming: '命名规范',
      'vue-event': 'Vue 事件命名',
      'react-event': 'React 事件命名',
      'missing-react': '缺失 React 实现',
      'missing-vue': '缺失 Vue 实现',
      'overlay-api': '弹出层 API 一致性',
      'controlled-parity': '受控量双端对称',
      'public-deprecated': '公开 API 禁止 @deprecated'
    }

    for (const [rule, items] of Object.entries(grouped)) {
      console.log(`── ${ruleLabels[rule] || rule} (${items.length}) ──`)
      for (const item of items) {
        const loc = item.line > 0 ? `${item.file}:${item.line}` : item.file
        console.log(`  ${loc} — ${item.message}`)
      }
      console.log()
    }
  }
}

process.exit(issues.length > 0 ? 1 : 0)
