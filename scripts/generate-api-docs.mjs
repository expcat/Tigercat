#!/usr/bin/env node

/**
 * generate-api-docs.mjs
 *
 * Scans packages/core/src/types/*.ts to generate a summary of all exported
 * types for each component category. Outputs to docs/api-summary.md.
 *
 * Usage: node scripts/generate-api-docs.mjs
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, basename } from 'node:path'

const TYPES_DIR = join(import.meta.dirname, '..', 'packages', 'core', 'src', 'types')
const OUTPUT_FILE = join(import.meta.dirname, '..', 'docs', 'api-summary.md')

const CATEGORIES = {
  Basic: ['button', 'link', 'icon', 'text', 'image', 'avatar', 'badge', 'tag', 'divider', 'code'],
  Form: [
    'input',
    'input-number',
    'input-group',
    'textarea',
    'select',
    'cascader',
    'auto-complete',
    'transfer',
    'tree-select',
    'checkbox',
    'radio',
    'switch',
    'slider',
    'datepicker',
    'timepicker',
    'color-picker',
    'rate',
    'upload',
    'mentions',
    'form',
    'stepper'
  ],
  'Data Display': [
    'table',
    'virtual-table',
    'card',
    'list',
    'descriptions',
    'timeline',
    'tree',
    'progress',
    'skeleton',
    'statistic',
    'calendar',
    'qrcode',
    'segmented',
    'empty',
    'collapse'
  ],
  Navigation: ['menu', 'tabs', 'breadcrumb', 'dropdown', 'pagination', 'steps', 'anchor'],
  Feedback: [
    'alert',
    'modal',
    'drawer',
    'message',
    'notification',
    'loading',
    'popconfirm',
    'popover',
    'tooltip',
    'result',
    'watermark'
  ],
  Layout: ['space', 'container', 'grid', 'layout', 'splitter', 'resizable'],
  Charts: ['chart'],
  Advanced: [
    'code-editor',
    'rich-text-editor',
    'kanban',
    'file-manager',
    'virtual-list',
    'infinite-scroll',
    'drag',
    'tour',
    'float-button',
    'affix',
    'print-layout',
    'image-viewer'
  ],
  Composite: ['chat', 'task-board', 'table-form'],
  Core: ['generics', 'events', 'slots', 'locale', 'theme']
}

/** Extract exported type names from a .ts file */
function extractExports(content) {
  const exports = []
  const re = /export\s+(?:type|interface|enum|const|function)\s+(\w+)/g
  let match
  while ((match = re.exec(content)) !== null) {
    exports.push(match[1])
  }
  return exports
}

async function main() {
  const files = await readdir(TYPES_DIR)
  const tsFiles = files.filter((f) => f.endsWith('.ts') && f !== 'index.ts')

  const fileExports = new Map()
  for (const file of tsFiles) {
    const content = await readFile(join(TYPES_DIR, file), 'utf-8')
    const exports = extractExports(content)
    fileExports.set(basename(file, '.ts'), exports)
  }

  let md = '# Tigercat API Summary\n\n'
  md += '> 自动生成 — `node scripts/generate-api-docs.mjs`\n\n'

  let totalTypes = 0

  for (const [category, typeFiles] of Object.entries(CATEGORIES)) {
    md += `## ${category}\n\n`
    md += '| File | Exported Types |\n'
    md += '|------|---------------|\n'

    for (const tf of typeFiles) {
      const exports = fileExports.get(tf) || []
      totalTypes += exports.length
      if (exports.length > 0) {
        const typeList = exports.map((e) => `\`${e}\``).join(', ')
        md += `| ${tf}.ts | ${typeList} |\n`
      }
    }
    md += '\n'
  }

  md += `---\n\nTotal exported types: **${totalTypes}**\n`

  await mkdir(join(import.meta.dirname, '..', 'docs'), { recursive: true })
  await writeFile(OUTPUT_FILE, md, 'utf-8')
  console.log(`✅ API summary generated: ${OUTPUT_FILE}`)
  console.log(`   Total types: ${totalTypes}`)
}

main().catch((err) => {
  console.error('❌ Failed to generate API docs:', err)
  process.exit(1)
})
