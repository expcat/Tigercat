#!/usr/bin/env node

/**
 * generate-api-docs.mjs
 *
 * Scans packages/core/src/types/*.ts and generates a compact skill reference:
 * - skills/tigercat/references/shared/api-summary.md for LLM lookup
 *
 * Usage: node scripts/generate-api-docs.mjs
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import prettier from 'prettier'
import ts from 'typescript'

const ROOT_DIR = join(import.meta.dirname, '..')
const TYPES_DIR = join(ROOT_DIR, 'packages', 'core', 'src', 'types')
const LLM_API_SUMMARY = join(
  ROOT_DIR,
  'skills',
  'tigercat',
  'references',
  'shared',
  'api-summary.md'
)
const CATEGORIES = {
  Basic: [
    'alert',
    'avatar',
    'badge',
    'button',
    'code',
    'divider',
    'empty',
    'icon',
    'image',
    'link',
    'qrcode',
    'rate',
    'result',
    'segmented',
    'statistic',
    'tag',
    'text',
    'watermark'
  ],
  Form: [
    'auto-complete',
    'cascader',
    'checkbox',
    'color-picker',
    'datepicker',
    'form',
    'input',
    'input-group',
    'input-number',
    'mentions',
    'radio',
    'select',
    'slider',
    'stepper',
    'switch',
    'textarea',
    'timepicker',
    'transfer',
    'tree-select',
    'upload'
  ],
  Feedback: [
    'drawer',
    'loading',
    'message',
    'modal',
    'notification',
    'popconfirm',
    'popover',
    'progress',
    'tooltip',
    'tour'
  ],
  Layout: [
    'card',
    'carousel',
    'container',
    'descriptions',
    'grid',
    'layout',
    'list',
    'resizable',
    'skeleton',
    'space',
    'splitter'
  ],
  Navigation: [
    'affix',
    'anchor',
    'back-top',
    'breadcrumb',
    'dropdown',
    'float-button',
    'menu',
    'pagination',
    'steps',
    'tabs',
    'tree'
  ],
  Data: ['calendar', 'collapse', 'table'],
  Charts: ['chart'],
  Advanced: [
    'code-editor',
    'drag',
    'file-manager',
    'image-viewer',
    'infinite-scroll',
    'kanban',
    'print-layout',
    'rich-text-editor',
    'virtual-list',
    'virtual-table'
  ],
  Composite: ['composite'],
  Core: ['base', 'events', 'floating-popup', 'generics', 'locale', 'slots', 'theme']
}

async function formatMarkdown(content) {
  return prettier.format(content, { parser: 'markdown' })
}

function hasExportModifier(node) {
  return Boolean(node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword))
}

function getDeclarationName(node) {
  return node.name && ts.isIdentifier(node.name) ? node.name.text : null
}

function extractFileInfo(fileName, content) {
  const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true)
  const exports = []
  const propsInterfaces = []

  function visit(node) {
    if (
      (ts.isInterfaceDeclaration(node) ||
        ts.isTypeAliasDeclaration(node) ||
        ts.isEnumDeclaration(node) ||
        ts.isFunctionDeclaration(node)) &&
      hasExportModifier(node)
    ) {
      const name = getDeclarationName(node)
      if (name) exports.push(name)
    }

    if (ts.isVariableStatement(node) && hasExportModifier(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) exports.push(declaration.name.text)
      }
    }

    if (
      ts.isInterfaceDeclaration(node) &&
      hasExportModifier(node) &&
      node.name.text.endsWith('Props')
    ) {
      propsInterfaces.push(node.name.text)
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return { fileName, exports, propsInterfaces }
}

function getCategorizedFiles(fileInfoByName) {
  const categorized = []
  const used = new Set()

  for (const [category, typeFiles] of Object.entries(CATEGORIES)) {
    const files = typeFiles.map((typeFile) => fileInfoByName.get(typeFile)).filter(Boolean)
    files.forEach((fileInfo) => used.add(fileInfo.fileName))
    categorized.push({ category, files })
  }

  const otherFiles = [...fileInfoByName.values()].filter((fileInfo) => !used.has(fileInfo.fileName))
  if (otherFiles.length > 0) categorized.push({ category: 'Other', files: otherFiles })

  return categorized
}

function propsToComponents(propsInterfaces) {
  return propsInterfaces
    .map((propsInterface) => propsInterface.replace(/Props$/, ''))
    .filter((name) => !/^(Base|Generic|Use|React|Vue)/.test(name))
}

function countExportedTypes(categorizedFiles) {
  return categorizedFiles.reduce(
    (totalTypes, { files }) =>
      totalTypes + files.reduce((fileTotal, fileInfo) => fileTotal + fileInfo.exports.length, 0),
    0
  )
}

function generateLlmApiSummary(categorizedFiles, totalTypes) {
  let markdownText = '---\n'
  markdownText += 'name: tigercat-llm-api-summary\n'
  markdownText += 'description: Compact generated API summary for Tigercat core types\n'
  markdownText += '---\n\n'
  markdownText += '<!-- LLM-INDEX\n'
  markdownText += 'type: generated-api-summary\n'
  markdownText += `total-exported-types: ${totalTypes}\n`
  markdownText += 'source: packages/core/src/types/*.ts\n'
  markdownText += '-->\n\n'
  markdownText += '# Tigercat LLM API Summary\n\n'
  markdownText +=
    '> 自动生成 — `pnpm docs:api`。只做类型文件与 Props 接口定位；字段细节以源码和分类 Props 文档为准。\n\n'

  for (const { category, files } of categorizedFiles) {
    markdownText += `## ${category}\n\n`
    markdownText += '| Type File | Props Interfaces | Components | Exports |\n'
    markdownText += '| --------- | ---------------- | ---------- | ------- |\n'
    for (const fileInfo of files) {
      const components = propsToComponents(fileInfo.propsInterfaces)
      markdownText += `| ${fileInfo.fileName} | ${fileInfo.propsInterfaces.join(', ') || '-'} | ${components.join(', ') || '-'} | ${fileInfo.exports.length} |\n`
    }
    markdownText += '\n'
  }

  return markdownText
}

async function main() {
  const typeFiles = (await readdir(TYPES_DIR)).filter(
    (fileName) => fileName.endsWith('.ts') && fileName !== 'index.ts'
  )

  const fileInfoByName = new Map()
  for (const fileName of typeFiles) {
    const content = await readFile(join(TYPES_DIR, fileName), 'utf8')
    const fileInfo = extractFileInfo(fileName, content)
    fileInfoByName.set(basename(fileName, '.ts'), fileInfo)
  }

  const categorizedFiles = getCategorizedFiles(fileInfoByName)
  const totalTypes = countExportedTypes(categorizedFiles)

  await mkdir(join(ROOT_DIR, 'skills', 'tigercat', 'references', 'shared'), { recursive: true })
  await writeFile(
    LLM_API_SUMMARY,
    await formatMarkdown(generateLlmApiSummary(categorizedFiles, totalTypes)),
    'utf8'
  )
  console.log(`LLM API summary generated: ${LLM_API_SUMMARY}`)
  console.log(`Total exported types: ${totalTypes}`)
}

main().catch((error) => {
  console.error('Failed to generate API docs:', error)
  process.exit(1)
})
