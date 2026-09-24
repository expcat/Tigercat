import { Command } from 'commander'
import { existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import prompts from 'prompts'
import {
  ALL_COMPONENTS,
  CLI_VERSION,
  componentImportSpecifier,
  resolveAddableComponents
} from '../constants'
import { logSuccess, logError, logInfo, logWarn } from '../utils/logger'
import { assertInsideProject, readFileSafe, writeFileSafe } from '../utils/fs'
import { runArgv } from '../utils/exec'
import { isFramework, type Framework } from '../utils/validate'

interface AddOptions {
  dryRun?: boolean
  framework?: string
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
    const hasVue = '@expcat/tigercat-vue' in allDeps || 'vue' in allDeps
    const hasReact = '@expcat/tigercat-react' in allDeps || 'react' in allDeps
    if (hasVue && hasReact) return null
    if (hasVue) return 'vue3'
    if (hasReact) return 'react'
  } catch {
    // invalid JSON
  }
  return null
}

function normalizeFramework(value: string | undefined): Framework | null {
  return value !== undefined && isFramework(value) ? value : null
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

function pinDependency(dependency: string): string {
  return dependency.startsWith('@expcat/tigercat-') ? `${dependency}@${CLI_VERSION}` : dependency
}

function formatAddCommand(packageManager: 'pnpm' | 'yarn' | 'npm', dependencies: string[]): string {
  const deps = dependencies.map(pinDependency).join(' ')
  if (packageManager === 'yarn') return `yarn add ${deps}`
  if (packageManager === 'npm') return `npm install ${deps}`
  return `pnpm add ${deps}`
}

function installArgs(packageManager: 'pnpm' | 'yarn' | 'npm', dependencies: string[]): string[] {
  const verb = packageManager === 'npm' ? 'install' : 'add'
  return [verb, ...dependencies.map(pinDependency)]
}

function validateComponents(names: string[]): {
  valid: string[]
  invalid: string[]
  commands: string[]
} {
  const valid: string[] = []
  const invalid: string[] = []
  const commands: string[] = []
  for (const name of names) {
    const resolved = resolveAddableComponents(name)
    if (resolved === null) {
      invalid.push(name)
      continue
    }
    if (resolved.length === 0) {
      commands.push(name)
      continue
    }
    for (const component of resolved) {
      if (!valid.includes(component)) valid.push(component)
    }
  }
  return { valid, invalid, commands }
}

export async function runAdd(components: string[], options: AddOptions = {}) {
  const cwd = process.cwd()

  if (options.framework !== undefined && !isFramework(options.framework)) {
    logError(`Invalid framework "${options.framework}". Valid frameworks: vue3, react`)
    process.exit(1)
  }

  const framework = normalizeFramework(options.framework) ?? detectFramework(cwd)
  const dryRun = Boolean(options.dryRun)

  if (!framework) {
    logError(
      'Pass --framework vue3 or react. Detection stops when both Vue and React are installed, and when neither Tigercat package is present.'
    )
    process.exit(1)
  }

  const selectedComponents = await resolveComponents(components)
  const { valid, invalid, commands } = validateComponents(selectedComponents)

  if (invalid.length > 0) {
    logWarn(`Unknown components: ${invalid.join(', ')}`)
    logInfo(`Available: ${ALL_COMPONENTS.join(', ')}`)
  }

  if (commands.length > 0) {
    const pkgNameForCommand =
      framework === 'vue3' ? '@expcat/tigercat-vue' : '@expcat/tigercat-react'
    logInfo(
      `Notification is the imperative API: import { notification } from '${componentImportSpecifier(pkgNameForCommand, 'notification')}'`
    )
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
      runArgv(packageManager, installArgs(packageManager, missingDeps), {
        cwd,
        failureMessage: 'Failed to install dependencies.'
      })
    } else {
      logInfo(`Missing dependencies detected. Run: ${installCommand}`)
    }
  }

  const importLine = valid
    .map(
      (component) =>
        `import { ${component} } from '${componentImportSpecifier(pkgName, component)}'`
    )
    .join('\n')

  logSuccess(`Add this import to your project:\n`)
  console.log(`  ${importLine}\n`)

  if (options.snippet) {
    const snippetFile = resolve(cwd, options.snippet)
    assertInsideProject(cwd, snippetFile)
    if (existsSync(snippetFile)) {
      logWarn(`${snippetFile} already exists, skipping`)
    } else {
      const snippet = generateImportSnippet(valid, pkgName)
      if (dryRun) {
        logInfo(`Would create import snippet ${snippetFile}`)
      } else {
        writeFileSafe(snippetFile, snippet)
        logSuccess(`Created import snippet ${snippetFile}`)
      }
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
  return `${components
    .map(
      (component) => `import { ${component} } from '${componentImportSpecifier(pkg, component)}'`
    )
    .join('\n')}

export const tigercatComponents = {
${components.map((component) => `  ${component}`).join(',\n')}
}
`
}

function generateVue3Demo(component: string, pkg: string): string {
  return `<script setup lang="ts">
import { ${component} } from '${componentImportSpecifier(pkg, component)}'
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
  return `import { ${component} } from '${componentImportSpecifier(pkg, component)}'

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
