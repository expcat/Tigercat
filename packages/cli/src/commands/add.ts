import { Command } from 'commander'
import { existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { ALL_COMPONENTS } from '../constants'
import { logSuccess, logError, logInfo, logWarn } from '../utils/logger'
import { readFileSafe, writeFileSafe } from '../utils/fs'

export function createAddCommand() {
  return new Command('add')
    .argument('<components...>', 'Component names to add (e.g. Button Input Select)')
    .description('Add component import boilerplate to your project')
    .action(async (components: string[]) => {
      await runAdd(components)
    })
}

function detectFramework(cwd: string): 'vue3' | 'react' | null {
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

async function runAdd(components: string[]) {
  const cwd = process.cwd()
  const framework = detectFramework(cwd)

  if (!framework) {
    logError(
      'Could not detect framework. Make sure you are in a project with @expcat/tigercat-vue or @expcat/tigercat-react installed.'
    )
    process.exit(1)
  }

  const { valid, invalid } = validateComponents(components)

  if (invalid.length > 0) {
    logWarn(`Unknown components: ${invalid.join(', ')}`)
    logInfo(`Available: ${ALL_COMPONENTS.join(', ')}`)
  }

  if (valid.length === 0) {
    logError('No valid components specified')
    process.exit(1)
  }

  const pkgName = framework === 'vue3' ? '@expcat/tigercat-vue' : '@expcat/tigercat-react'
  const importLine = `import { ${valid.join(', ')} } from '${pkgName}'`

  logSuccess(`Add this import to your project:\n`)
  console.log(`  ${importLine}\n`)

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

  for (const comp of valid) {
    const ext = framework === 'vue3' ? 'vue' : 'tsx'
    const sampleFile = join(sampleDir, `${comp}Demo.${ext}`)
    if (existsSync(sampleFile)) {
      logWarn(`${sampleFile} already exists, skipping`)
      continue
    }

    const content =
      framework === 'vue3' ? generateVue3Demo(comp, pkgName) : generateReactDemo(comp, pkgName)
    writeFileSafe(sampleFile, content)
    logSuccess(`Created ${sampleFile}`)
  }
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
