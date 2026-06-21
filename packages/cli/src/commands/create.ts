import { Command } from 'commander'
import prompts from 'prompts'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { type TemplateName } from '../constants'
import { logSuccess, logError, logInfo, logStep } from '../utils/logger'
import { ensureDir, isDirEmpty, writeFileSafe } from '../utils/fs'
import { resolveTemplateOption, suggestProjectName, validateProjectName } from '../utils/validate'
import { getVue3Template } from '../templates/vue3'
import { getReactTemplate } from '../templates/react'

export function createCreateCommand() {
  return new Command('create')
    .argument('<name>', 'Project name')
    .option('-t, --template <template>', 'Project template (vue3 | react)')
    .option('--dry-run', 'Preview files without writing them')
    .description('Create a new project with Tigercat pre-configured')
    .action(async (name: string, opts: { template?: string; dryRun?: boolean }) => {
      await runCreate(name, opts.template, Boolean(opts.dryRun))
    })
}

export async function runCreate(name: string, templateArg?: string, dryRun = false) {
  const nameError = validateProjectName(name)
  if (nameError) {
    logError(`${nameError}. Try "${suggestProjectName(name)}" instead.`)
    process.exit(1)
  }

  const template: TemplateName = await resolveTemplateOption(templateArg, 'Select a framework')

  const targetDir = resolve(process.cwd(), name)

  if (!dryRun && existsSync(targetDir) && !isDirEmpty(targetDir)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Directory "${name}" is not empty. Overwrite conflicting template files? (other files are kept)`,
      initial: false
    })
    if (!overwrite) {
      logError('Operation cancelled')
      process.exit(1)
    }
  }

  logInfo(`Creating ${template} project in ${targetDir}...`)

  const files = template === 'vue3' ? getVue3Template(name) : getReactTemplate(name)

  if (dryRun) {
    logInfo('Dry run: no files will be written.')
    for (const filePath of Object.keys(files)) {
      console.log(`  ${filePath}`)
    }
    return
  }

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
