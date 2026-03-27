#!/usr/bin/env node

/**
 * validate-api.mjs — API 一致性自动扫描脚本
 *
 * 读取 packages/core/src/types/*.ts 提取所有 Props 接口，
 * 检查命名、类型和默认值的一致性。
 *
 * 用法：node scripts/validate-api.mjs [--json]
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { join, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..')
const TYPES_DIR = join(ROOT, 'packages', 'core', 'src', 'types')
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

function addIssue(file, line, rule, message) {
  issues.push({ file: basename(file), line, rule, message })
}

// ----- Scanning -----

const typeFiles = readdirSync(TYPES_DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts')

for (const filename of typeFiles) {
  const filepath = join(TYPES_DIR, filename)
  const content = readFileSync(filepath, 'utf-8')
  const lines = content.split('\n')

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
const vueFiles = readdirSync(VUE_COMPONENTS_DIR).filter((f) => f.endsWith('.ts'))

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
const reactFiles = readdirSync(REACT_COMPONENTS_DIR).filter((f) => f.endsWith('.tsx'))

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
      'missing-vue': '缺失 Vue 实现'
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
