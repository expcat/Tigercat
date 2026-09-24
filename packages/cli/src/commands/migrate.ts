import { Command } from 'commander'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import removed from '../removed-names.json' with { type: 'json' }
import { logError, logInfo, logSuccess } from '../utils/logger'
import { writeFileSafe } from '../utils/fs'

const SKIP_DIRS = new Set(['node_modules', 'dist', 'dist-ssr', '.git', 'coverage'])
const FILE_RE = /\.(?:[cm]?[jt]sx?|vue)$/

export function rewriteSource(source: string): string {
  let next = source
  for (const [from, to] of Object.entries(removed.specifiers)) {
    next = next.split(from).join(to)
  }
  next = next.replace(
    /((?:import|export)\s[\s\S]*?\sfrom\s*)(['"][^'"]+['"])/g,
    (full, lead: string, specifier: string) => {
      let clause = lead
      let spec = specifier
      for (const [oldName, newName] of Object.entries(removed.names)) {
        clause = clause.replace(new RegExp(`\\b${oldName}\\b`, 'g'), newName)
        spec = spec.replace(new RegExp(`/${oldName}(?=['"])`), `/${newName}`)
      }
      return `${clause}${spec}`
    }
  )
  return next
}

export function collectMigrateFiles(root: string): string[] {
  const files: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue
      const full = join(dir, entry)
      const stat = statSync(full)
      if (stat.isDirectory()) walk(full)
      else if (FILE_RE.test(entry)) files.push(full)
    }
  }
  walk(root)
  return files
}

export function planMigrate(root: string): Array<{ file: string; next: string }> {
  const planned: Array<{ file: string; next: string }> = []
  for (const file of collectMigrateFiles(root)) {
    const source = readFileSync(file, 'utf8')
    const next = rewriteSource(source)
    if (next !== source) planned.push({ file, next })
  }
  return planned
}

export function createMigrateCommand() {
  return new Command('migrate')
    .option('--write', 'Write the listed files. Default is a preview.')
    .option('--dir <dir>', 'Directory to scan', process.cwd())
    .description('Rewrite deleted import names and specifiers. Does not change props.')
    .action((opts: { write?: boolean; dir?: string }) => {
      const root = opts.dir ?? process.cwd()
      let planned: Array<{ file: string; next: string }>
      try {
        planned = planMigrate(root)
      } catch (error) {
        logError(error instanceof Error ? error.message : String(error))
        process.exit(1)
      }
      if (planned.length === 0) {
        logSuccess('No import specifiers or deleted names to rewrite.')
        return
      }
      logInfo('Files:')
      for (const item of planned) console.log(`  ${relative(root, item.file)}`)
      if (!opts.write) {
        logInfo('Preview only. Re-run with --write to update these files.')
        return
      }
      for (const item of planned) writeFileSafe(item.file, item.next)
      logSuccess(`Updated ${planned.length} file(s).`)
    })
}
