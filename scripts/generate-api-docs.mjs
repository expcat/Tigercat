#!/usr/bin/env node

/**
 * generate-api-docs.mjs
 *
 * Scans packages/core/src/types/*.ts and generates:
 * - docs/api-summary.md for the public documentation site
 * - skills/tigercat/references/shared/api-summary.md for compact LLM lookup
 * - skills/tigercat/references/shared/generated-props.md from TypeScript Props interfaces
 *
 * Usage: node scripts/generate-api-docs.mjs
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import ts from 'typescript'

const ROOT_DIR = join(import.meta.dirname, '..')
const TYPES_DIR = join(ROOT_DIR, 'packages', 'core', 'src', 'types')
const DOCS_API_SUMMARY = join(ROOT_DIR, 'docs', 'api-summary.md')
const LLM_API_SUMMARY = join(
  ROOT_DIR,
  'skills',
  'tigercat',
  'references',
  'shared',
  'api-summary.md'
)
const GENERATED_PROPS = join(
  ROOT_DIR,
  'skills',
  'tigercat',
  'references',
  'shared',
  'generated-props.md'
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

function markdown(value) {
  return String(value ?? '')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\|/g, '\\|')
    .trim()
}

function codeList(values) {
  return values.length > 0 ? values.map((value) => `\`${value}\``).join(', ') : '-'
}

function hasExportModifier(node) {
  return Boolean(node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword))
}

function getDeclarationName(node) {
  return node.name && ts.isIdentifier(node.name) ? node.name.text : null
}

function getPropertyName(node) {
  if (
    ts.isIdentifier(node.name) ||
    ts.isStringLiteral(node.name) ||
    ts.isNumericLiteral(node.name)
  ) {
    return node.name.text
  }
  return node.name.getText()
}

function cleanJsDoc(comment) {
  return comment
    .replace(/^\/\*\*/, '')
    .replace(/\*\/$/, '')
    .split('\n')
    .map((line) => line.replace(/^\s*\* ?/, '').trim())
    .filter(Boolean)
}

function readJsDoc(content, node) {
  const ranges = ts.getLeadingCommentRanges(content, node.getFullStart()) ?? []
  const block = [...ranges]
    .reverse()
    .map((range) => content.slice(range.pos, range.end))
    .find((comment) => comment.startsWith('/**'))

  if (!block) return { description: '', defaultValue: '-' }

  const lines = cleanJsDoc(block)
  const descriptionLines = []
  let defaultValue = '-'

  for (const line of lines) {
    if (line.startsWith('@default')) {
      defaultValue = line.replace(/^@default\s*/, '').trim() || '-'
    } else if (!line.startsWith('@')) {
      descriptionLines.push(line)
    }
  }

  return {
    description: descriptionLines.join(' '),
    defaultValue
  }
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
      const props = []
      for (const member of node.members) {
        if (!ts.isPropertySignature(member)) continue
        const jsDoc = readJsDoc(content, member)
        props.push({
          name: getPropertyName(member),
          optional: Boolean(member.questionToken),
          type: member.type ? member.type.getText(sourceFile) : 'unknown',
          defaultValue: jsDoc.defaultValue,
          description: jsDoc.description
        })
      }
      propsInterfaces.push({ name: node.name.text, props })
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
    .map((propsInterface) => propsInterface.name.replace(/Props$/, ''))
    .filter((name) => !/^(Base|Generic|Use|React|Vue)/.test(name))
}

function generateDocsApiSummary(categorizedFiles) {
  let totalTypes = 0
  let markdownText = '# Tigercat API Summary\n\n'
  markdownText += '> 自动生成 — `node scripts/generate-api-docs.mjs`\n\n'

  for (const { category, files } of categorizedFiles) {
    markdownText += `## ${category}\n\n`
    markdownText += '| File | Exported Types |\n'
    markdownText += '| ---- | -------------- |\n'

    for (const fileInfo of files) {
      totalTypes += fileInfo.exports.length
      markdownText += `| ${fileInfo.fileName}.ts | ${codeList(fileInfo.exports)} |\n`
    }
    markdownText += '\n'
  }

  markdownText += `---\n\nTotal exported types: **${totalTypes}**\n`
  return { markdownText, totalTypes }
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
  markdownText += '> 自动生成 — `pnpm docs:api`。用于快速定位类型文件、Props 接口和组件 API。\n\n'
  markdownText += '| Category | Type Files | Props Interfaces | Components |\n'
  markdownText += '| -------- | ---------- | ---------------- | ---------- |\n'

  for (const { category, files } of categorizedFiles) {
    const propsInterfaces = files.flatMap((fileInfo) => fileInfo.propsInterfaces)
    const components = propsToComponents(propsInterfaces)
    markdownText += `| ${category} | ${files.map((fileInfo) => fileInfo.fileName).join(', ') || '-'} | ${propsInterfaces.map((entry) => entry.name).join(', ') || '-'} | ${components.join(', ') || '-'} |\n`
  }

  markdownText += '\n'

  for (const { category, files } of categorizedFiles) {
    markdownText += `## ${category}\n\n`
    markdownText += '| Type File | Props Interfaces | Key Exports |\n'
    markdownText += '| --------- | ---------------- | ----------- |\n'
    for (const fileInfo of files) {
      const propsInterfaces = fileInfo.propsInterfaces.map((entry) => entry.name)
      const keyExports = fileInfo.exports.slice(0, 16)
      const suffix =
        fileInfo.exports.length > keyExports.length
          ? `, +${fileInfo.exports.length - keyExports.length}`
          : ''
      markdownText += `| ${fileInfo.fileName}.ts | ${propsInterfaces.join(', ') || '-'} | ${keyExports.join(', ') || '-'}${suffix} |\n`
    }
    markdownText += '\n'
  }

  return markdownText
}

function generatePropsSummary(categorizedFiles) {
  let markdownText = '---\n'
  markdownText += 'name: tigercat-generated-props\n'
  markdownText +=
    'description: Props tables generated from packages/core/src/types TypeScript interfaces\n'
  markdownText += '---\n\n'
  markdownText += '<!-- LLM-INDEX\n'
  markdownText += 'type: generated-props-reference\n'
  markdownText += 'source: packages/core/src/types/*.ts\n'
  markdownText += 'update-command: pnpm docs:api\n'
  markdownText += '-->\n\n'
  markdownText += '# Generated Props From TypeScript\n\n'
  markdownText +=
    '> 自动生成 — `pnpm docs:api`。手写 Props 文档用于说明交互语义；本文件用于核对 TS 源码中的字段、类型与默认值。\n\n'

  for (const { category, files } of categorizedFiles) {
    const filesWithProps = files.filter((fileInfo) => fileInfo.propsInterfaces.length > 0)
    if (filesWithProps.length === 0) continue

    markdownText += `## ${category}\n\n`
    for (const fileInfo of filesWithProps) {
      markdownText += `### ${fileInfo.fileName}.ts\n\n`
      for (const propsInterface of fileInfo.propsInterfaces) {
        markdownText += `#### ${propsInterface.name}\n\n`
        if (propsInterface.props.length === 0) {
          markdownText += '_No direct property signatures._\n\n'
          continue
        }

        markdownText += '| Prop | Type | Default | Description |\n'
        markdownText += '| ---- | ---- | ------- | ----------- |\n'
        for (const prop of propsInterface.props) {
          const optionalSuffix = prop.optional ? '?' : ''
          markdownText += `| ${markdown(prop.name)}${optionalSuffix} | \`${markdown(prop.type)}\` | ${markdown(prop.defaultValue) || '-'} | ${markdown(prop.description) || '-'} |\n`
        }
        markdownText += '\n'
      }
    }
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
  const docsSummary = generateDocsApiSummary(categorizedFiles)

  await mkdir(join(ROOT_DIR, 'docs'), { recursive: true })
  await mkdir(join(ROOT_DIR, 'skills', 'tigercat', 'references', 'shared'), { recursive: true })
  await writeFile(DOCS_API_SUMMARY, docsSummary.markdownText, 'utf8')
  await writeFile(
    LLM_API_SUMMARY,
    generateLlmApiSummary(categorizedFiles, docsSummary.totalTypes),
    'utf8'
  )
  await writeFile(GENERATED_PROPS, generatePropsSummary(categorizedFiles), 'utf8')

  console.log(`API summary generated: ${DOCS_API_SUMMARY}`)
  console.log(`LLM API summary generated: ${LLM_API_SUMMARY}`)
  console.log(`Generated props summary: ${GENERATED_PROPS}`)
  console.log(`Total exported types: ${docsSummary.totalTypes}`)
}

main().catch((error) => {
  console.error('Failed to generate API docs:', error)
  process.exit(1)
})
