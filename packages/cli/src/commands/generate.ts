import { Command } from 'commander'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { ALL_COMPONENTS, componentImportSpecifier } from '../constants'
import { logSuccess, logError, logInfo, logWarn } from '../utils/logger'
import { assertInsideProject, writeFileSafe } from '../utils/fs'

type FrameworkTarget = 'vue3' | 'react' | 'both'

export function createGenerateCommand() {
  const cmd = new Command('generate').description('Code generation utilities')

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

/**
 * Starter specs import the component from its public subpath entry so the file
 * typechecks as-is. Rendering is left as an honest todo: components with
 * required props (such as Table and its columns prop) cannot be rendered with
 * an empty-props assertion, and a scaffold should not invent one.
 */
function generateVueTest(component: string): string {
  const specifier = componentImportSpecifier('@expcat/tigercat-vue', component)
  return `import { describe, it } from 'vitest'
import { ${component} } from '${specifier}'

// Referenced so the import compiles under noUnusedLocals before the test below
// is implemented.
void ${component}

describe('${component}', () => {
  // TODO: render ${component} with @testing-library/vue using its real required
  // props (check the component's *Props type), then assert the behavior your
  // app relies on. Do not assert empty-props rendering: components like Table
  // declare required props such as \`columns\`.
  it.todo('renders and behaves as expected')
})
`
}

function generateReactTest(component: string): string {
  const specifier = componentImportSpecifier('@expcat/tigercat-react', component)
  return `import { describe, it } from 'vitest'
import { ${component} } from '${specifier}'

// Referenced so the import compiles under noUnusedLocals before the test below
// is implemented.
void ${component}

describe('${component}', () => {
  // TODO: render ${component} with @testing-library/react using its real required
  // props (check the component's *Props type), then assert the behavior your
  // app relies on. Do not assert empty-props rendering: components like Table
  // declare required props such as \`columns\`.
  it.todo('renders and behaves as expected')
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
