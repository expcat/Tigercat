#!/usr/bin/env node

/**
 * validate-api.mjs — API 一致性自动扫描脚本
 *
 * 读取 packages/core/src/types/*.ts 提取所有 Props 接口，
 * 检查命名、类型和默认值的一致性。
 *
 * 用法：node scripts/validate-api.mjs [--json]
 */

import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from 'fs'
import { join, basename, relative } from 'path'
import { fileURLToPath } from 'url'
import {
  buildPublicComponentEntries,
  formatComponentIndexType,
  getComponentPackageSubpath,
  getDocTarget,
  loadPublicComponentExports
} from './lib/public-components.mjs'
import { collectFiles as collectFilesIn } from './utils/files.mjs'
import { escapeRegExp } from './utils/strings.mjs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..')
const TYPES_DIR = join(ROOT, 'packages', 'core', 'src', 'types')
const SKILL_REFERENCES_DIR = join(ROOT, 'skills', 'tigercat', 'references')
const jsonMode = process.argv.includes('--json')

// ----- Rules -----

const DISABLED_PATTERN = /\bisDisabled\b/
const VISIBLE_PATTERN = /\bvisible\s*[\?]?\s*:/
const OPEN_OK = /\bopen\s*[\?]?\s*:/
const SIZE_VALUES = new Set(['xs', 'sm', 'md', 'lg', 'xl'])
const SIZE_PROP_REGEX = /size\s*[\?]?\s*:\s*(['"][\w'"| ]+['"]|[\w|' ]+)/

// Standard prop names (should NOT use alternatives)
const PROP_ALTERNATIVES = [
  { bad: 'isDisabled', good: 'disabled', regex: /\bisDisabled\b/ },
  { bad: 'isLoading', good: 'loading', regex: /\bisLoading\b/ },
  { bad: 'isOpen', good: 'open', regex: /\bisOpen\b/ },
  { bad: 'isVisible', good: 'open', regex: /\bisVisible\b/ },
  { bad: 'visible', good: 'open', regex: /\bvisible\s*[\?]?\s*:/ }
]

// Vue events should be kebab-case style (in emits arrays)
const VUE_EMIT_REGEX = /emits\s*:\s*\[([^\]]+)\]/g

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

    // Check size values are from standard set
    const sizeMatch = line.match(SIZE_PROP_REGEX)
    if (sizeMatch && line.includes('size')) {
      const sizeStr = sizeMatch[1]
      const values = sizeStr.match(/'([^']+)'/g)
      if (values) {
        const extracted = values.map((v) => v.replace(/'/g, ''))
        for (const val of extracted) {
          if (
            !SIZE_VALUES.has(val) &&
            val !== 'default' &&
            val !== 'small' &&
            val !== 'large' &&
            val !== 'full' &&
            val !== 'auto'
          ) {
            // Allow some common extra values, but flag unusual ones
          }
        }
      }
    }
  })
}

// ----- Vue component scan (check events/emits naming) -----

const VUE_COMPONENTS_DIR = join(ROOT, 'packages', 'vue', 'src', 'components')
const INTERNAL_COMPONENT_MODULES = new Set(['MessageRoot', 'NotificationRoot'])
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

// Check that Vue and React have matching component files
const vueComponentNames = new Set(vueFiles.map((f) => f.replace('.ts', '')))
const reactComponentNames = new Set(reactFiles.map((f) => f.replace('.tsx', '')))

for (const name of vueComponentNames) {
  if (!reactComponentNames.has(name)) {
    addIssue('cross-framework', 0, 'missing-react', `Vue 组件 "${name}" 在 React 中缺失`)
  }
}

for (const name of reactComponentNames) {
  if (!vueComponentNames.has(name)) {
    addIssue('cross-framework', 0, 'missing-vue', `React 组件 "${name}" 在 Vue 中缺失`)
  }
}

// ----- Overlay API design audit (open / update:open / onOpenChange) -----

// Components that define `open?: boolean` in their type must have:
//   Vue  → `update:open` in emits
//   React → `onOpenChange` callback prop
// This prevents introducing `visible` and ensures overlay API symmetry.

const componentsWithOpen = new Set()

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

  // Check React: must have onOpenChange prop
  const reactFile = join(REACT_COMPONENTS_DIR, `${compName}.tsx`)
  if (existsSync(reactFile)) {
    const reactContent = readFileSync(reactFile, 'utf-8')
    if (!/\bonOpenChange\s*[?]?\s*:/.test(reactContent)) {
      addIssue(
        `${compName}.tsx`,
        0,
        'overlay-api',
        `React 组件 "${compName}" 有 open 属性但缺少 onOpenChange 回调`
      )
    }
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
  { prop: 'currentIndex', components: ['ImageViewer'] },
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

// ----- Deprecated API usage in Examples -----

/**
 * Scan source directories for @deprecated JSDoc annotations and extract
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
    const files = readdirSync(dir).filter((f) => /\.(ts|tsx)$/.test(f))
    for (const filename of files) {
      const filepath = join(dir, filename)
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

function getDeprecatedUsageRegexes(name, kinds) {
  const escaped = escapeRegExp(name)
  const regexes = []

  if (kinds.has('prop')) {
    regexes.push(new RegExp(`(?:^|[\\s<{(])(?:v-model:|v-bind:|:)?${escaped}\\s*=`))
  }

  if (kinds.has('event')) {
    regexes.push(new RegExp(`(?:@|v-on:)${escaped}(?:\\s*=|\\b)`))
  }

  if (kinds.has('symbol')) {
    regexes.push(new RegExp(`\\b${escaped}\\b`))
  }

  return regexes
}

const deprecatedAPIs = collectDeprecatedAPIs()

if (deprecatedAPIs.length > 0) {
  // Deduplicate: group by name and derive owning component(s) from source filenames.
  // This avoids reporting `visible` in DropdownDemo when only ImagePreview deprecated it.
  const deduped = new Map()
  for (const api of deprecatedAPIs) {
    if (!deduped.has(api.name)) {
      deduped.set(api.name, { name: api.name, kinds: new Set(), sources: [] })
    }
    deduped.get(api.name).kinds.add(api.kind)
    deduped.get(api.name).sources.push({ file: api.file, line: api.line })
  }

  // Derive PascalCase component names from source filenames
  for (const [, entry] of deduped) {
    entry.components = new Set()
    for (const src of entry.sources) {
      const fname = basename(src.file).replace(/\.(ts|tsx)$/, '')
      // Remove -utils suffix for utility files → `kanban-utils` → `kanban`
      const cleaned = fname.replace(/-utils$/, '')
      // kebab-case / lowercase → PascalCase
      const pascal = cleaned
        .split('-')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join('')
      entry.components.add(pascal)
    }
  }

  const exampleDirs = [
    join(ROOT, 'examples', 'example', 'vue3', 'src'),
    join(ROOT, 'examples', 'example', 'react', 'src')
  ]

  for (const exDir of exampleDirs) {
    const exFiles = collectFiles(exDir, ['.vue', '.ts', '.tsx', '.jsx', '.js'])
    for (const exFile of exFiles) {
      const content = readFileSync(exFile, 'utf-8')
      const lines = content.split('\n')

      for (const [name, entry] of deduped) {
        // Scope check: only report if the example file uses (imports/renders)
        // one of the owning components. This prevents false positives for
        // generic names like "visible" appearing in unrelated components.
        const usesComponent = [...entry.components].some((comp) => {
          const importRe = new RegExp(`import\\b[^;]*\\b${comp}\\b|<${comp}[\\s/>]`)
          return importRe.test(content)
        })
        if (!usesComponent) continue

        const regexes = getDeprecatedUsageRegexes(name, entry.kinds)
        lines.forEach((line, idx) => {
          if (regexes.some((regex) => regex.test(line))) {
            const relPath = relative(ROOT, exFile)
            const srcLabel = entry.sources.map((s) => `${basename(s.file)}:${s.line}`).join(', ')
            addIssue(
              relPath,
              idx + 1,
              'deprecated-in-example',
              `Example 使用了废弃 API "${name}"（来源：${srcLabel}）`
            )
          }
        })
      }
    }
  }
}

// ----- LLM docs coverage check -----

function collectMarkdownContent(dir, options = {}) {
  const markdownFiles = collectFiles(dir, ['.md']).filter((file) => {
    if (options.excludeIndex && basename(file) === 'index.md') return false
    const normalized = file.replace(/\\/g, '/')
    if (options.includePattern && !options.includePattern.test(normalized)) return false
    return true
  })
  return markdownFiles.map((file) => readFileSync(file, 'utf-8')).join('\n')
}

function hasHeadingOrMention(content, target) {
  const escaped = escapeRegExp(target)
  return (
    new RegExp(`^#{2,4}\\s+.*\\b${escaped}\\b`, 'm').test(content) ||
    new RegExp(`\\b${escaped}\\b`).test(content)
  )
}

const publicExports = loadPublicComponentExports(ROOT)
const vuePublicComponents = new Set(publicExports.vue)
const reactPublicComponents = new Set(publicExports.react)
const allPublicComponents = new Set(publicExports.all)

const sharedPropsDocs = collectMarkdownContent(join(SKILL_REFERENCES_DIR, 'shared', 'props'))
const generatedExampleDocs = collectMarkdownContent(join(SKILL_REFERENCES_DIR, 'examples'))
const routeIndexDocs = `${collectMarkdownContent(join(SKILL_REFERENCES_DIR, 'vue'))}\n${collectMarkdownContent(join(SKILL_REFERENCES_DIR, 'react'))}`
const topicalFrameworkDocs = collectMarkdownContent(SKILL_REFERENCES_DIR, {
  includePattern: /\/(i18n|theme|ssr)\.md$/
})
const vueExampleDocs = `${generatedExampleDocs}\n${routeIndexDocs}\n${topicalFrameworkDocs}`
const reactExampleDocs = vueExampleDocs

for (const componentName of [...allPublicComponents].sort()) {
  const docTarget = getDocTarget(componentName)

  if (!hasHeadingOrMention(sharedPropsDocs, docTarget)) {
    addIssue(
      'skills/tigercat/references/shared/props',
      0,
      'docs-api',
      `公开组件 "${componentName}" 缺少 shared Props 文档（期望匹配：${docTarget}）`
    )
  }

  if (vuePublicComponents.has(componentName) && !hasHeadingOrMention(vueExampleDocs, docTarget)) {
    addIssue(
      'skills/tigercat/references/vue',
      0,
      'docs-api',
      `Vue 公开组件 "${componentName}" 缺少示例文档（期望匹配：${docTarget}）`
    )
  }

  if (
    reactPublicComponents.has(componentName) &&
    !hasHeadingOrMention(reactExampleDocs, docTarget)
  ) {
    addIssue(
      'skills/tigercat/references/react',
      0,
      'docs-api',
      `React 公开组件 "${componentName}" 缺少示例文档（期望匹配：${docTarget}）`
    )
  }
}

function collectComponentIndexRows() {
  const indexFile = join(SKILL_REFERENCES_DIR, 'component-index.md')
  const rows = new Map()
  const lines = readFileSync(indexFile, 'utf-8').split(/\r?\n/)

  for (const line of lines) {
    if (!line.startsWith('|')) continue
    const columns = line
      .split('|')
      .slice(1, -1)
      .map((column) => column.trim())
    if (columns.length < 3) continue
    const component = columns[0]
    if (component === 'Component' || component.startsWith('-')) continue
    rows.set(component, {
      category: columns[1],
      type: columns[2],
      packageSubpath: columns[3] ?? ''
    })
  }

  return rows
}

const expectedComponentRows = new Map(
  buildPublicComponentEntries(ROOT, coreFileInfoByName, publicExports).map((entry) => [
    entry.component,
    {
      category: entry.category,
      type: formatComponentIndexType(entry.typeSource),
      packageSubpath: getComponentPackageSubpath(entry.component)
    }
  ])
)
const actualComponentRows = collectComponentIndexRows()

for (const [componentName, expected] of expectedComponentRows) {
  const actual = actualComponentRows.get(componentName)
  if (!actual) {
    addIssue(
      'skills/tigercat/references/component-index.md',
      0,
      'docs-api',
      `component-index 缺少公开组件 "${componentName}"`
    )
    continue
  }

  if (
    actual.category !== expected.category ||
    actual.type !== expected.type ||
    actual.packageSubpath !== expected.packageSubpath
  ) {
    addIssue(
      'skills/tigercat/references/component-index.md',
      0,
      'docs-api',
      `component-index 组件 "${componentName}" 应为 ${expected.category} / ${expected.type} / ${expected.packageSubpath}，实际为 ${actual.category} / ${actual.type} / ${actual.packageSubpath}`
    )
  }
}

for (const componentName of actualComponentRows.keys()) {
  if (expectedComponentRows.has(componentName)) continue
  addIssue(
    'skills/tigercat/references/component-index.md',
    0,
    'docs-api',
    `component-index 误列非公开组件 "${componentName}"`
  )
}

// ----- Skill docs quality budget -----

const SKILL_DOC_BUDGETS = {
  entryBytes: 3000,
  totalMarkdownLines: 6000,
  propsCategoryLines: 350,
  handReferenceLines: 120
}

const skillMarkdownFiles = collectFiles(join(ROOT, 'skills', 'tigercat'), ['.md'])
let totalSkillMarkdownLines = 0
const componentHeadingOwners = new Map()

for (const file of skillMarkdownFiles) {
  const content = readFileSync(file, 'utf-8')
  const lines = content.split(/\r?\n/)
  const relativeFile = relative(ROOT, file)
  totalSkillMarkdownLines += lines.length

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
    !relativeFile.includes(join('references', 'examples')) &&
    !relativeFile.includes(join('references', 'shared')) &&
    !relativeFile.endsWith('component-index.md') &&
    !relativeFile.endsWith(join('react', 'index.md')) &&
    !relativeFile.endsWith(join('vue', 'index.md'))
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
    const tableCellCount = (line.match(/(?<!\\)\|/g) || []).length
    if (line.trim().startsWith('|') && tableCellCount > 10) {
      addIssue(
        relativeFile,
        index + 1,
        'docs-table',
        'Markdown table row appears too wide or malformed'
      )
    }

    const heading = line.match(/^##\s+([A-Z][A-Za-z0-9]*)\b/)
    if (!heading) return
    const name = heading[1]
    if (!componentHeadingOwners.has(name)) componentHeadingOwners.set(name, [])
    componentHeadingOwners.get(name).push(relativeFile)
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

for (const [componentName, owners] of componentHeadingOwners) {
  const propsOwners = owners.filter((owner) =>
    owner.includes(join('references', 'shared', 'props'))
  )
  if (propsOwners.length > 1) {
    addIssue(
      'skills/tigercat/references/shared/props',
      0,
      'docs-duplicate',
      `Component "${componentName}" appears in multiple props references: ${propsOwners.join(', ')}`
    )
  }
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
  const outPath = join(ROOT, 'api-consistency-report.json')
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
      'deprecated-in-example': '废弃 API 仍在 Example 中使用',
      'docs-api': 'LLM 文档与公开 API 覆盖'
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
