import { Command } from 'commander'
import { resolve, join, basename } from 'node:path'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { ALL_COMPONENTS } from '../constants'
import { logSuccess, logError, logInfo, logStep } from '../utils/logger'
import { ensureDir, writeFileSafe } from '../utils/fs'

type FrameworkTarget = 'vue3' | 'react' | 'both'

export function createGenerateCommand() {
  const cmd = new Command('generate').description('Code generation utilities')

  cmd
    .command('docs')
    .option('-i, --input <dir>', 'Types directory', 'packages/core/src/types')
    .option('-o, --output <dir>', 'Output directory', 'docs/api')
    .option('--dry-run', 'Preview generated docs without writing files')
    .description('Generate API documentation from component type definitions')
    .action(async (opts: { input: string; output: string; dryRun?: boolean }) => {
      await runGenerateDocs(opts.input, opts.output, Boolean(opts.dryRun))
    })

  cmd
    .command('test <component>')
    .option('-f, --framework <framework>', 'Target framework (vue3 | react | both)', 'both')
    .option('-o, --output <dir>', 'Tests root directory', 'tests')
    .option('--dry-run', 'Preview generated test files without writing files')
    .description('Generate starter test templates for a component')
    .action(
      async (component: string, opts: { framework: string; output: string; dryRun?: boolean }) => {
        await runGenerateTest(component, opts.framework, opts.output, Boolean(opts.dryRun))
      }
    )

  cmd
    .command('doc-template <component>')
    .option('-o, --output <dir>', 'Documentation output directory', 'docs/components')
    .option('--dry-run', 'Preview generated documentation without writing files')
    .description('Generate a component documentation page template')
    .action(async (component: string, opts: { output: string; dryRun?: boolean }) => {
      await runGenerateDocTemplate(component, opts.output, Boolean(opts.dryRun))
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

export async function runGenerateDocs(inputDir: string, outputDir: string, dryRun = false) {
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

  if (dryRun) {
    logInfo('Dry run: no documentation files will be written.')
  } else {
    ensureDir(resolvedOutput)
  }

  const docs: ComponentDoc[] = []
  let step = 0

  for (const file of files) {
    step++
    logStep(step, files.length, file)
    const doc = parseTypeFile(join(resolvedInput, file))
    if (doc) {
      docs.push(doc)
      const md = generateMarkdown(doc)
      const outputPath = join(resolvedOutput, `${doc.fileName}.md`)
      if (dryRun) {
        logInfo(`Would generate ${outputPath}`)
      } else {
        writeFileSafe(outputPath, md)
      }
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

  const indexPath = join(resolvedOutput, 'index.md')
  if (dryRun) {
    logInfo(`Would generate ${indexPath}`)
    logSuccess(`Dry run completed for ${docs.length} component docs in ${outputDir}`)
    return
  }

  writeFileSafe(indexPath, indexLines.join('\n'))

  logSuccess(`Generated docs for ${docs.length} components in ${outputDir}`)
}

export async function runGenerateTest(
  component: string,
  frameworkArg: string,
  outputDir: string,
  dryRun = false
) {
  const componentName = normalizeComponentName(component)
  if (!componentName) {
    logError(`Unknown component: ${component}`)
    process.exit(1)
  }

  const framework = normalizeFrameworkTarget(frameworkArg)
  if (!framework) {
    logError(`Unknown framework target: ${frameworkArg}. Use vue3, react, or both.`)
    process.exit(1)
  }

  const targets = framework === 'both' ? ['vue3', 'react'] : [framework]

  for (const target of targets) {
    const ext = target === 'vue3' ? 'ts' : 'tsx'
    const folder = target === 'vue3' ? 'vue' : 'react'
    const filePath = resolve(process.cwd(), outputDir, folder, `${componentName}.spec.${ext}`)
    const content =
      target === 'vue3' ? generateVueTest(componentName) : generateReactTest(componentName)

    if (existsSync(filePath)) {
      logWarn(`${filePath} already exists, skipping`)
      continue
    }

    if (dryRun) {
      logInfo(`Would generate ${filePath}`)
      continue
    }

    writeFileSafe(filePath, content)
    logSuccess(`Generated ${filePath}`)
  }
}

export async function runGenerateDocTemplate(component: string, outputDir: string, dryRun = false) {
  const componentName = normalizeComponentName(component)
  if (!componentName) {
    logError(`Unknown component: ${component}`)
    process.exit(1)
  }

  const fileName = `${componentName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}.md`
  const filePath = resolve(process.cwd(), outputDir, fileName)
  const content = generateComponentDocTemplate(componentName)

  if (existsSync(filePath)) {
    logWarn(`${filePath} already exists, skipping`)
    return
  }

  if (dryRun) {
    logInfo(`Would generate ${filePath}`)
    return
  }

  writeFileSafe(filePath, content)
  logSuccess(`Generated ${filePath}`)
}

function normalizeComponentName(component: string): string | null {
  return ALL_COMPONENTS.find((name) => name.toLowerCase() === component.toLowerCase()) ?? null
}

function normalizeFrameworkTarget(value: string): FrameworkTarget | null {
  if (value === 'vue3' || value === 'react' || value === 'both') return value
  return null
}

function generateVueTest(component: string): string {
  return `/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { ${component} } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('${component}', () => {
  it('renders without crashing', () => {
    const { container } = render(${component}, {
      attrs: { 'data-testid': '${component.toLowerCase()}' }
    })

    expect(screen.getByTestId('${component.toLowerCase()}')).toBeInTheDocument()
    expect(container.firstElementChild).toBeTruthy()
  })

  describe('a11y', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(${component})
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('Edge Cases', () => {
    it('keeps rendering with empty props', () => {
      const { container } = render(${component})
      expect(container.firstElementChild).toBeTruthy()
    })
  })
})
`
}

function generateReactTest(component: string): string {
  return `/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { ${component} } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('${component}', () => {
  it('renders without crashing', () => {
    const { container } = render(<${component} data-testid="${component.toLowerCase()}" />)

    expect(screen.getByTestId('${component.toLowerCase()}')).toBeInTheDocument()
    expect(container.firstElementChild).toBeTruthy()
  })

  describe('a11y', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<${component} />)
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('Edge Cases', () => {
    it('keeps rendering with empty props', () => {
      const { container } = render(<${component} />)
      expect(container.firstElementChild).toBeTruthy()
    })
  })
})
`
}

function generateComponentDocTemplate(component: string): string {
  return `# ${component}

## Overview

Describe the user-facing purpose and primary workflow for ${component}.

## Import

\`\`\`ts
import { ${component} } from '@expcat/tigercat-vue'
import { ${component} } from '@expcat/tigercat-react'
\`\`\`

## Basic Usage

Add one minimal Vue example and one minimal React example from \`skills/tigercat/references\`.

## Props

Keep this section aligned with \`packages/core/src/types\` and regenerate API docs after changes.

## Accessibility

Document keyboard behavior, roles, labels, and focus management.

## Edge Cases

List boundary states, empty states, loading states, and controlled/uncontrolled behavior.
`
}
