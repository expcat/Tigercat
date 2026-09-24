import { Command } from 'commander'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { ALL_COMPONENTS } from '../constants'
import { logSuccess, logError, logInfo, logWarn } from '../utils/logger'
import { assertInsideProject, writeFileSafe } from '../utils/fs'

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
    .option('-o, --output <dir>', 'Tests root directory', 'tigercat-tests')
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

export async function runGenerateDocs(
  _inputDir: string,
  _outputDir: string,
  _dryRun = false
): Promise<void> {
  throw new Error('Component docs are generated only by `pnpm docs:api`.')
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
    assertInsideProject(process.cwd(), filePath)
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
  assertInsideProject(process.cwd(), filePath)
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
