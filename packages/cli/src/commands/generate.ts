import { Command } from 'commander'
import { resolve, join, basename } from 'node:path'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { logSuccess, logError, logInfo, logStep } from '../utils/logger'
import { ensureDir, writeFileSafe } from '../utils/fs'

export function createGenerateCommand() {
  const cmd = new Command('generate').description('Code generation utilities')

  cmd
    .command('docs')
    .option('-i, --input <dir>', 'Types directory', 'packages/core/src/types')
    .option('-o, --output <dir>', 'Output directory', 'docs/api')
    .description('Generate API documentation from component type definitions')
    .action(async (opts: { input: string; output: string }) => {
      await runGenerateDocs(opts.input, opts.output)
    })

  return cmd
}

interface PropInfo {
  name: string
  type: string
  required: boolean
  description: string
}

interface ComponentDoc {
  name: string
  props: PropInfo[]
  fileName: string
}

function parseTypeFile(filePath: string): ComponentDoc | null {
  const content = readFileSync(filePath, 'utf-8')
  const fileName = basename(filePath, '.ts')

  // Extract interface/type declarations
  const interfaceRegex =
    /export\s+(?:interface|type)\s+(\w+Props)\s*(?:=\s*\{|(?:extends\s+[\w<>,\s]+)?\s*\{)/g
  const match = interfaceRegex.exec(content)

  if (!match) return null

  const interfaceName = match[0]
  const componentName = match[1].replace(/Props$/, '')

  // Extract props from the content after the interface declaration
  const startIdx = content.indexOf(interfaceName) + interfaceName.length
  let braceCount = 1
  let endIdx = startIdx

  for (let i = startIdx; i < content.length && braceCount > 0; i++) {
    if (content[i] === '{') braceCount++
    if (content[i] === '}') braceCount--
    endIdx = i
  }

  const body = content.slice(startIdx, endIdx)
  const props: PropInfo[] = []

  // Match property lines: optional comment, name, optional ?, colon, type
  const propRegex =
    /(?:\/\*\*\s*(.*?)\s*\*\/\s*)?(?:\/\/\s*(.*?)\s*\n\s*)?(\w+)(\?)?\s*:\s*([^;\n]+)/g
  let propMatch

  while ((propMatch = propRegex.exec(body)) !== null) {
    const description = propMatch[1] || propMatch[2] || ''
    const name = propMatch[3]
    const required = !propMatch[4]
    const type = propMatch[5].trim()
    props.push({ name, type, required, description })
  }

  return { name: componentName, props, fileName }
}

function generateMarkdown(doc: ComponentDoc): string {
  const lines: string[] = []
  lines.push(`# ${doc.name}`)
  lines.push('')
  lines.push(`Source: \`${doc.fileName}.ts\``)
  lines.push('')

  if (doc.props.length > 0) {
    lines.push('## Props')
    lines.push('')
    lines.push('| Prop | Type | Required | Description |')
    lines.push('| ---- | ---- | -------- | ----------- |')
    for (const prop of doc.props) {
      const req = prop.required ? '✅' : '—'
      const desc = prop.description || '—'
      const type = prop.type.replace(/\|/g, '\\|')
      lines.push(`| \`${prop.name}\` | \`${type}\` | ${req} | ${desc} |`)
    }
    lines.push('')
  } else {
    lines.push('_No props extracted._')
    lines.push('')
  }

  return lines.join('\n')
}

async function runGenerateDocs(inputDir: string, outputDir: string) {
  const resolvedInput = resolve(process.cwd(), inputDir)
  const resolvedOutput = resolve(process.cwd(), outputDir)

  if (!existsSync(resolvedInput)) {
    logError(`Input directory not found: ${resolvedInput}`)
    process.exit(1)
  }

  const files = readdirSync(resolvedInput)
    .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
    .sort()

  logInfo(`Found ${files.length} type files in ${inputDir}`)

  ensureDir(resolvedOutput)

  const docs: ComponentDoc[] = []
  let step = 0

  for (const file of files) {
    step++
    logStep(step, files.length, file)
    const doc = parseTypeFile(join(resolvedInput, file))
    if (doc) {
      docs.push(doc)
      const md = generateMarkdown(doc)
      writeFileSafe(join(resolvedOutput, `${doc.fileName}.md`), md)
    }
  }

  // Generate index file
  const indexLines = [
    '# Tigercat API Reference',
    '',
    `Generated from ${files.length} type files.`,
    ''
  ]

  const grouped = new Map<string, ComponentDoc[]>()
  for (const doc of docs) {
    const initial = doc.name[0].toUpperCase()
    if (!grouped.has(initial)) grouped.set(initial, [])
    grouped.get(initial)!.push(doc)
  }

  for (const [letter, comps] of [...grouped.entries()].sort()) {
    indexLines.push(`## ${letter}`)
    indexLines.push('')
    for (const comp of comps) {
      indexLines.push(`- [${comp.name}](./${comp.fileName}.md) — ${comp.props.length} props`)
    }
    indexLines.push('')
  }

  writeFileSafe(join(resolvedOutput, 'index.md'), indexLines.join('\n'))

  logSuccess(`Generated docs for ${docs.length} components in ${outputDir}`)
}
