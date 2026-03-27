import { Command } from 'commander'
import prompts from 'prompts'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { TEMPLATES, type TemplateName } from '../constants'
import { logSuccess, logError, logInfo, logStep } from '../utils/logger'
import { ensureDir, isDirEmpty, writeFileSafe } from '../utils/fs'
import { getVue3Template } from '../templates/vue3'
import { getReactTemplate } from '../templates/react'

export function createCreateCommand() {
  return new Command('create')
    .argument('<name>', 'Project name')
    .option('-t, --template <template>', 'Project template (vue3 | react)')
    .description('Create a new project with Tigercat pre-configured')
    .action(async (name: string, opts: { template?: string }) => {
      await runCreate(name, opts.template)
    })
}

async function runCreate(name: string, templateArg?: string) {
  let template: TemplateName

  if (templateArg && TEMPLATES.includes(templateArg as TemplateName)) {
    template = templateArg as TemplateName
  } else {
    const response = await prompts({
      type: 'select',
      name: 'template',
      message: 'Select a framework',
      choices: [
        { title: 'Vue 3', value: 'vue3' },
        { title: 'React', value: 'react' }
      ]
    })
    if (!response.template) {
      logError('Operation cancelled')
      process.exit(1)
    }
    template = response.template
  }

  const targetDir = resolve(process.cwd(), name)

  if (existsSync(targetDir) && !isDirEmpty(targetDir)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Directory "${name}" is not empty. Remove existing files and continue?`,
      initial: false
    })
    if (!overwrite) {
      logError('Operation cancelled')
      process.exit(1)
    }
  }

  logInfo(`Creating ${template} project in ${targetDir}...`)

  const files = template === 'vue3' ? getVue3Template(name) : getReactTemplate(name)

  const totalSteps = Object.keys(files).length
  let step = 0

  ensureDir(targetDir)

  for (const [filePath, content] of Object.entries(files)) {
    step++
    logStep(step, totalSteps, filePath)
    writeFileSafe(resolve(targetDir, filePath), content)
  }

  logSuccess(`Project "${name}" created successfully!\n`)
  logInfo('Next steps:\n')
  console.log(`  cd ${name}`)
  console.log('  pnpm install')
  console.log('  pnpm dev\n')
}
