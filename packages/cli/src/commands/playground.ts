import { Command } from 'commander'
import { resolve, join } from 'node:path'
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import prompts from 'prompts'
import { TEMPLATES, type TemplateName } from '../constants'
import { logSuccess, logError, logInfo, logStep } from '../utils/logger'
import { ensureDir, writeFileSafe } from '../utils/fs'
import { getVue3Template } from '../templates/vue3'
import { getReactTemplate } from '../templates/react'

export function createPlaygroundCommand() {
  return new Command('playground')
    .option('-t, --template <template>', 'Framework template (vue3 | react)')
    .option('-p, --port <port>', 'Dev server port', '3456')
    .description('Launch an interactive playground for testing components')
    .action(async (opts: { template?: string; port: string }) => {
      await runPlayground(opts.template, opts.port)
    })
}

async function runPlayground(templateArg?: string, port = '3456') {
  let template: TemplateName

  if (templateArg && TEMPLATES.includes(templateArg as TemplateName)) {
    template = templateArg as TemplateName
  } else {
    const response = await prompts({
      type: 'select',
      name: 'template',
      message: 'Select a framework for playground',
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

  const tmpDir = resolve(process.cwd(), '.tigercat-playground')
  const projectDir = join(tmpDir, `playground-${template}`)

  if (!existsSync(projectDir)) {
    logInfo(`Setting up ${template} playground...`)

    const files =
      template === 'vue3' ? getVue3Template('playground') : getReactTemplate('playground')

    ensureDir(projectDir)
    const totalSteps = Object.keys(files).length
    let step = 0
    for (const [filePath, content] of Object.entries(files)) {
      step++
      logStep(step, totalSteps, filePath)
      writeFileSafe(resolve(projectDir, filePath), content)
    }

    logInfo('Installing dependencies...')
    try {
      execSync('pnpm install', { cwd: projectDir, stdio: 'inherit' })
    } catch {
      logError('Failed to install dependencies. Make sure pnpm is available.')
      process.exit(1)
    }
  }

  logSuccess(`Starting playground on port ${port}...\n`)

  try {
    const safePort = /^\d+$/.test(port) ? port : '3456'
    execSync(`npx vite --port ${safePort}`, { cwd: projectDir, stdio: 'inherit' })
  } catch {
    // user terminated with Ctrl+C
  }
}
