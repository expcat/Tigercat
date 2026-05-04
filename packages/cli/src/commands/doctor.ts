import { Command } from 'commander'
import pc from 'picocolors'
import { join } from 'node:path'
import { logError, logInfo, logSuccess, logWarn } from '../utils/logger'
import { readFileSafe } from '../utils/fs'

export type DoctorStatus = 'pass' | 'warn' | 'fail'

export interface DoctorCheck {
  name: string
  status: DoctorStatus
  message: string
  details?: string[]
}

export interface DoctorOptions {
  cwd?: string
  nodeVersion?: string
  env?: NodeJS.ProcessEnv
}

interface ProjectPackage {
  packageManager?: unknown
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

type Framework = 'vue3' | 'react'

const MIN_NODE_MAJOR = 18
const MIN_PNPM_MAJOR = 8
const REQUIRED_TAILWIND_MAJOR = 4
const REQUIRED_TIGERCAT_MAJOR = 1

const FRAMEWORK_REQUIREMENTS: Record<Framework, { peers: string[]; templateDeps: string[] }> = {
  vue3: {
    peers: ['@expcat/tigercat-vue', '@expcat/tigercat-core', 'vue'],
    templateDeps: ['@tailwindcss/vite', '@vitejs/plugin-vue', 'typescript', 'vite', 'vue-tsc']
  },
  react: {
    peers: ['@expcat/tigercat-react', '@expcat/tigercat-core', 'react', 'react-dom'],
    templateDeps: ['@tailwindcss/vite', '@vitejs/plugin-react', 'typescript', 'vite']
  }
}

export function createDoctorCommand() {
  return new Command('doctor')
    .description('Check whether the current project is compatible with Tigercat')
    .action(() => {
      runDoctor()
    })
}

export function collectDoctorChecks(options: DoctorOptions = {}): DoctorCheck[] {
  const cwd = options.cwd ?? process.cwd()
  const env = options.env ?? process.env
  const packageResult = readProjectPackage(cwd)
  const nodeVersion = options.nodeVersion ?? process.versions.node

  const checks: DoctorCheck[] = [createPackageCheck(packageResult)]

  checks.push(createNodeCheck(nodeVersion))
  checks.push(createPnpmCheck(packageResult.packageJson, env))

  if (!packageResult.packageJson) {
    return checks
  }

  checks.push(createTailwindCheck(packageResult.packageJson))
  checks.push(createPeerDepsCheck(packageResult.packageJson))
  checks.push(createTemplateCompatibilityCheck(packageResult.packageJson))

  return checks
}

function runDoctor() {
  const checks = collectDoctorChecks()

  logInfo('Running Tigercat project checks...')
  console.log()

  for (const check of checks) {
    printCheck(check)
  }

  console.log()

  const failures = checks.filter((check) => check.status === 'fail')
  const warnings = checks.filter((check) => check.status === 'warn')

  if (failures.length > 0) {
    logError(`${failures.length} check${failures.length === 1 ? '' : 's'} failed`)
    process.exit(1)
  }

  if (warnings.length > 0) {
    logWarn(`${warnings.length} warning${warnings.length === 1 ? '' : 's'} found`)
    return
  }

  logSuccess('All checks passed')
}

function readProjectPackage(cwd: string): { packageJson: ProjectPackage | null; error?: string } {
  const packagePath = join(cwd, 'package.json')
  const content = readFileSafe(packagePath)

  if (!content) {
    return { packageJson: null, error: `package.json not found in ${cwd}` }
  }

  try {
    return { packageJson: JSON.parse(content) as ProjectPackage }
  } catch {
    return { packageJson: null, error: 'package.json is not valid JSON' }
  }
}

function createPackageCheck(result: {
  packageJson: ProjectPackage | null
  error?: string
}): DoctorCheck {
  if (!result.packageJson) {
    return {
      name: 'Project package',
      status: 'fail',
      message: result.error ?? 'package.json could not be read'
    }
  }

  return {
    name: 'Project package',
    status: 'pass',
    message: 'package.json is readable'
  }
}

function createNodeCheck(version: string): DoctorCheck {
  const parsed = parseVersion(version)

  if (!parsed || parsed.major < MIN_NODE_MAJOR) {
    return {
      name: 'Node.js',
      status: 'fail',
      message: `Node ${MIN_NODE_MAJOR}+ is required, current version is ${version}`
    }
  }

  return {
    name: 'Node.js',
    status: 'pass',
    message: `Node ${version} satisfies >=${MIN_NODE_MAJOR}`
  }
}

function createPnpmCheck(packageJson: ProjectPackage | null, env: NodeJS.ProcessEnv): DoctorCheck {
  const version = getPnpmVersion(packageJson, env)

  if (!version) {
    return {
      name: 'pnpm',
      status: 'warn',
      message: `Could not detect pnpm version; Tigercat templates expect pnpm ${MIN_PNPM_MAJOR}+`
    }
  }

  const parsed = parseVersion(version)

  if (!parsed || parsed.major < MIN_PNPM_MAJOR) {
    return {
      name: 'pnpm',
      status: 'fail',
      message: `pnpm ${MIN_PNPM_MAJOR}+ is required, detected ${version}`
    }
  }

  return {
    name: 'pnpm',
    status: 'pass',
    message: `pnpm ${version} satisfies >=${MIN_PNPM_MAJOR}`
  }
}

function createTailwindCheck(packageJson: ProjectPackage): DoctorCheck {
  const allDeps = collectDependencies(packageJson)
  const tailwindRange = allDeps.tailwindcss
  const vitePluginRange = allDeps['@tailwindcss/vite']

  if (!tailwindRange) {
    return {
      name: 'Tailwind CSS',
      status: 'fail',
      message: 'tailwindcss is missing; Tigercat requires Tailwind CSS 4+'
    }
  }

  const tailwindMajor = getRangeMajor(tailwindRange)
  const pluginMajor = vitePluginRange ? getRangeMajor(vitePluginRange) : null

  if (tailwindMajor !== null && tailwindMajor < REQUIRED_TAILWIND_MAJOR) {
    return {
      name: 'Tailwind CSS',
      status: 'fail',
      message: `tailwindcss ${tailwindRange} is not compatible; use Tailwind CSS ${REQUIRED_TAILWIND_MAJOR}+`
    }
  }

  if (tailwindMajor === null) {
    return {
      name: 'Tailwind CSS',
      status: 'warn',
      message: `Could not verify tailwindcss range ${tailwindRange}; expected ${REQUIRED_TAILWIND_MAJOR}+`
    }
  }

  if (vitePluginRange && pluginMajor !== null && pluginMajor < REQUIRED_TAILWIND_MAJOR) {
    return {
      name: 'Tailwind CSS',
      status: 'fail',
      message: `@tailwindcss/vite ${vitePluginRange} is not compatible; use ${REQUIRED_TAILWIND_MAJOR}+`
    }
  }

  const details = vitePluginRange
    ? [`@tailwindcss/vite ${vitePluginRange}`]
    : ['@tailwindcss/vite is recommended for Vite templates']

  return {
    name: 'Tailwind CSS',
    status: vitePluginRange ? 'pass' : 'warn',
    message: `tailwindcss ${tailwindRange} satisfies Tigercat requirements`,
    details
  }
}

function createPeerDepsCheck(packageJson: ProjectPackage): DoctorCheck {
  const allDeps = collectDependencies(packageJson)
  const frameworks = detectTigercatFrameworks(allDeps)

  if (frameworks.length === 0) {
    return {
      name: 'Peer dependencies',
      status: 'warn',
      message: 'No Tigercat Vue or React package was detected'
    }
  }

  const missing = [
    ...new Set(
      frameworks.flatMap((framework) =>
        FRAMEWORK_REQUIREMENTS[framework].peers.filter((dependency) => !allDeps[dependency])
      )
    )
  ]
  const incompatible = frameworks.flatMap((framework) =>
    FRAMEWORK_REQUIREMENTS[framework].peers
      .filter((dependency) => dependency.startsWith('@expcat/tigercat-'))
      .filter((dependency) => isOlderMajor(allDeps[dependency], REQUIRED_TIGERCAT_MAJOR))
      .map((dependency) => `${dependency}@${allDeps[dependency]}`)
  )

  if (missing.length > 0 || incompatible.length > 0) {
    return {
      name: 'Peer dependencies',
      status: 'fail',
      message: 'Tigercat peer dependencies are incomplete or incompatible',
      details: [...missing.map((dependency) => `Missing ${dependency}`), ...incompatible]
    }
  }

  return {
    name: 'Peer dependencies',
    status: 'pass',
    message: `${frameworks.map(formatFramework).join(' + ')} peer dependencies are present`
  }
}

function createTemplateCompatibilityCheck(packageJson: ProjectPackage): DoctorCheck {
  const allDeps = collectDependencies(packageJson)
  const frameworks = detectTigercatFrameworks(allDeps)

  if (frameworks.length === 0) {
    return {
      name: 'Template compatibility',
      status: 'warn',
      message: 'Skipped because no supported Tigercat framework package was detected'
    }
  }

  const missing = [
    ...new Set(
      frameworks.flatMap((framework) =>
        FRAMEWORK_REQUIREMENTS[framework].templateDeps.filter((dependency) => !allDeps[dependency])
      )
    )
  ]

  if (missing.length > 0) {
    return {
      name: 'Template compatibility',
      status: 'warn',
      message: 'Project differs from current CLI template dependencies',
      details: missing.map((dependency) => `Template dependency not found: ${dependency}`)
    }
  }

  return {
    name: 'Template compatibility',
    status: 'pass',
    message: `${frameworks.map(formatFramework).join(' + ')} template dependencies are present`
  }
}

function collectDependencies(packageJson: ProjectPackage): Record<string, string> {
  return {
    ...packageJson.peerDependencies,
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  }
}

function detectTigercatFrameworks(dependencies: Record<string, string>): Framework[] {
  const frameworks: Framework[] = []

  if (dependencies['@expcat/tigercat-vue']) {
    frameworks.push('vue3')
  }

  if (dependencies['@expcat/tigercat-react']) {
    frameworks.push('react')
  }

  return frameworks
}

function getPnpmVersion(packageJson: ProjectPackage | null, env: NodeJS.ProcessEnv): string | null {
  const packageManager = packageJson?.packageManager

  if (typeof packageManager === 'string') {
    const match = /^pnpm@(.+)$/.exec(packageManager)
    if (match) return match[1]
  }

  const userAgent = env.npm_config_user_agent
  const match = userAgent ? /pnpm\/(\d+\.\d+\.\d+)/.exec(userAgent) : null

  return match?.[1] ?? null
}

function parseVersion(value: string): { major: number; minor: number; patch: number } | null {
  const match = /^(?:v)?(\d+)(?:\.(\d+))?(?:\.(\d+))?/.exec(value.trim())

  if (!match) return null

  return {
    major: Number(match[1]),
    minor: Number(match[2] ?? 0),
    patch: Number(match[3] ?? 0)
  }
}

function getRangeMajor(range: string | undefined): number | null {
  if (!range) return null
  if (/^(workspace|file|link|catalog):/.test(range)) return null

  const match = /(?:\^|~|>=|<=|>|<|=)?\s*v?(\d+)/.exec(range)
  return match ? Number(match[1]) : null
}

function isOlderMajor(range: string | undefined, expectedMajor: number): boolean {
  const major = getRangeMajor(range)
  return major !== null && major < expectedMajor
}

function formatFramework(framework: Framework): string {
  return framework === 'vue3' ? 'Vue 3' : 'React'
}

function printCheck(check: DoctorCheck) {
  const symbol =
    check.status === 'pass' ? pc.green('✔') : check.status === 'warn' ? pc.yellow('⚠') : pc.red('✖')
  const name = pc.bold(check.name)
  console.log(`${symbol} ${name}: ${check.message}`)

  for (const detail of check.details ?? []) {
    console.log(`  ${pc.dim('-')} ${detail}`)
  }
}
