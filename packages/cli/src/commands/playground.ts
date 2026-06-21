import { Command } from 'commander'
import { resolve, join } from 'node:path'
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { type TemplateName } from '../constants'
import { logSuccess, logError, logInfo, logStep } from '../utils/logger'
import { ensureDir, writeFileSafe } from '../utils/fs'
import { resolveTemplateOption } from '../utils/validate'
import { getVue3Template } from '../templates/vue3'
import { getReactTemplate } from '../templates/react'

export function createPlaygroundCommand() {
  return new Command('playground')
    .option('-t, --template <template>', 'Framework template (vue3 | react)')
    .option('-p, --port <port>', 'Dev server port', '3456')
    .option('--no-open', 'Do not open the playground in the default browser')
    .option('--dry-run', 'Preview playground setup without writing files or starting Vite')
    .description('Launch an interactive playground for testing components')
    .action(async (opts: { template?: string; port: string; open?: boolean; dryRun?: boolean }) => {
      await runPlayground(opts.template, opts.port, opts.open !== false, Boolean(opts.dryRun))
    })
}

export async function runPlayground(
  templateArg?: string,
  port = '3456',
  open = true,
  dryRun = false
) {
  const template: TemplateName = await resolveTemplateOption(
    templateArg,
    'Select a framework for playground'
  )

  const tmpDir = resolve(process.cwd(), '.tigercat-playground')
  const projectDir = join(tmpDir, `playground-${template}`)

  if (dryRun) {
    const safePort = /^\d+$/.test(port) ? port : '3456'
    logInfo(`Dry run: would prepare ${template} playground in ${projectDir}.`)
    if (!existsSync(projectDir)) {
      const files =
        template === 'vue3' ? getVue3Template('playground') : getReactTemplate('playground')
      for (const filePath of Object.keys(files)) {
        console.log(`  ${filePath}`)
      }
      logInfo('Would run pnpm install')
    }
    logInfo(`Would start Vite on port ${safePort}${open ? ' and open the browser' : ''}`)
    return
  }

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
    const openFlag = open ? ' --open' : ''
    execSync(`npx vite --port ${safePort}${openFlag}`, { cwd: projectDir, stdio: 'inherit' })
  } catch {
    // user terminated with Ctrl+C
  }
}
