import { Command } from 'commander'
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import prompts from 'prompts'
import { ALL_COMPONENTS } from '../constants'
import { logSuccess, logError, logInfo, logWarn } from '../utils/logger'
import { readFileSafe, writeFileSafe } from '../utils/fs'

type Framework = 'vue3' | 'react'

interface AddOptions {
  dryRun?: boolean
  framework?: Framework
  install?: boolean
  snippet?: string
}

export function createAddCommand() {
  return new Command('add')
    .argument('[components...]', 'Component names to add (e.g. Button Input Select)')
    .option('-f, --framework <framework>', 'Framework override (vue3 | react)')
    .option('--install', 'Install missing Tigercat dependencies before generating snippets')
    .option('--snippet <file>', 'Generate a reusable import snippet file')
    .option('--dry-run', 'Preview generated demo files without writing them')
    .description('Add component import boilerplate to your project')
    .action(async (components: string[], opts: AddOptions) => {
      await runAdd(components ?? [], opts)
    })
}

function detectFramework(cwd: string): Framework | null {
  const pkg = readFileSafe(join(cwd, 'package.json'))
  if (!pkg) return null

  try {
    const parsed = JSON.parse(pkg)
    const allDeps = { ...parsed.dependencies, ...parsed.devDependencies }
    if ('@expcat/tigercat-vue' in allDeps || 'vue' in allDeps) return 'vue3'
    if ('@expcat/tigercat-react' in allDeps || 'react' in allDeps) return 'react'
  } catch {
    // invalid JSON
  }
  return null
}

function normalizeFramework(value: string | undefined): Framework | null {
  if (value === 'vue3' || value === 'react') return value
  return null
}

async function resolveComponents(components: string[]): Promise<string[]> {
  if (components.length > 0) return components

  const response = await prompts({
    type: 'multiselect',
    name: 'components',
    message: 'Select components to add',
    choices: ALL_COMPONENTS.map((component) => ({ title: component, value: component })),
    min: 1
  })

  return response.components ?? []
}

function collectDependencies(framework: Framework): string[] {
  return framework === 'vue3'
    ? ['@expcat/tigercat-vue', '@expcat/tigercat-core', 'vue']
    : ['@expcat/tigercat-react', '@expcat/tigercat-core', 'react', 'react-dom']
}

function readPackageDeps(cwd: string): Record<string, string> {
  const pkg = readFileSafe(join(cwd, 'package.json'))
  if (!pkg) return {}

  try {
    const parsed = JSON.parse(pkg)
    return { ...parsed.dependencies, ...parsed.devDependencies, ...parsed.peerDependencies }
  } catch {
    return {}
  }
}

function detectPackageManager(cwd: string): 'pnpm' | 'yarn' | 'npm' {
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) return 'pnpm'
  if (existsSync(join(cwd, 'yarn.lock'))) return 'yarn'
  return 'npm'
}

function formatAddCommand(packageManager: 'pnpm' | 'yarn' | 'npm', dependencies: string[]): string {
  const deps = dependencies.join(' ')
  if (packageManager === 'yarn') return `yarn add ${deps}`
  if (packageManager === 'npm') return `npm install ${deps}`
  return `pnpm add ${deps}`
}

function validateComponents(names: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = []
  const invalid: string[] = []
  for (const name of names) {
    const match = ALL_COMPONENTS.find((c) => c.toLowerCase() === name.toLowerCase())
    if (match) {
      valid.push(match)
    } else {
      invalid.push(name)
    }
  }
  return { valid, invalid }
}

export async function runAdd(components: string[], options: AddOptions = {}) {
  const cwd = process.cwd()
  const framework = normalizeFramework(options.framework) ?? detectFramework(cwd)
  const dryRun = Boolean(options.dryRun)

  if (!framework) {
    logError(
      'Could not detect framework. Make sure you are in a project with @expcat/tigercat-vue or @expcat/tigercat-react installed.'
    )
    process.exit(1)
  }

  const selectedComponents = await resolveComponents(components)
  const { valid, invalid } = validateComponents(selectedComponents)

  if (invalid.length > 0) {
    logWarn(`Unknown components: ${invalid.join(', ')}`)
    logInfo(`Available: ${ALL_COMPONENTS.join(', ')}`)
  }

  if (valid.length === 0) {
    logError('No valid components specified')
    process.exit(1)
  }

  const pkgName = framework === 'vue3' ? '@expcat/tigercat-vue' : '@expcat/tigercat-react'
  const requiredDeps = collectDependencies(framework)
  const installedDeps = readPackageDeps(cwd)
  const missingDeps = requiredDeps.filter((dependency) => !installedDeps[dependency])

  if (missingDeps.length > 0) {
    const packageManager = detectPackageManager(cwd)
    const installCommand = formatAddCommand(packageManager, missingDeps)

    if (options.install && !dryRun) {
      logInfo(`Installing missing dependencies: ${missingDeps.join(', ')}`)
      execSync(installCommand, { cwd, stdio: 'inherit' })
    } else {
      logInfo(`Missing dependencies detected. Run: ${installCommand}`)
    }
  }

  const importLine = `import { ${valid.join(', ')} } from '${pkgName}'`

  logSuccess(`Add this import to your project:\n`)
  console.log(`  ${importLine}\n`)

  if (options.snippet) {
    const snippetFile = resolve(cwd, options.snippet)
    const snippet = generateImportSnippet(valid, pkgName)
    if (dryRun) {
      logInfo(`Would create import snippet ${snippetFile}`)
    } else {
      writeFileSafe(snippetFile, snippet)
      logSuccess(`Created import snippet ${snippetFile}`)
    }
  }

  if (framework === 'vue3') {
    logInfo('Vue 3 usage example:\n')
    for (const comp of valid) {
      console.log(`  <${comp} />`)
    }
  } else {
    logInfo('React usage example:\n')
    for (const comp of valid) {
      console.log(`  <${comp} />`)
    }
  }
  console.log()

  // Generate a sample file if requested
  const sampleDir = resolve(cwd, 'src', 'components')
  if (!existsSync(sampleDir)) {
    return
  }

  if (dryRun) {
    logInfo('Dry run: no demo files will be written.')
  }

  for (const comp of valid) {
    const ext = framework === 'vue3' ? 'vue' : 'tsx'
    const sampleFile = join(sampleDir, `${comp}Demo.${ext}`)
    if (existsSync(sampleFile)) {
      logWarn(`${sampleFile} already exists, skipping`)
      continue
    }

    if (dryRun) {
      logInfo(`Would create ${sampleFile}`)
      continue
    }

    const content =
      framework === 'vue3' ? generateVue3Demo(comp, pkgName) : generateReactDemo(comp, pkgName)
    writeFileSafe(sampleFile, content)
    logSuccess(`Created ${sampleFile}`)
  }
}

function generateImportSnippet(components: string[], pkg: string): string {
  return `import { ${components.join(', ')} } from '${pkg}'

export const tigercatComponents = {
${components.map((component) => `  ${component}`).join(',\n')}
}
`
}

function generateVue3Demo(component: string, pkg: string): string {
  return `<script setup lang="ts">
import { ${component} } from '${pkg}'
</script>

<template>
  <div class="p-4">
    <h2 class="text-lg font-semibold mb-4">${component} Demo</h2>
    <${component} />
  </div>
</template>
`
}

function generateReactDemo(component: string, pkg: string): string {
  return `import { ${component} } from '${pkg}'

export default function ${component}Demo() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">${component} Demo</h2>
      <${component} />
    </div>
  )
}
`
}
