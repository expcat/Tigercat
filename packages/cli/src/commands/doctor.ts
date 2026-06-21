import { Command } from 'commander'
import pc from 'picocolors'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { logError, logInfo, logSuccess, logWarn } from '../utils/logger'
import { readFileSafe } from '../utils/fs'

export type DoctorStatus = 'pass' | 'warn' | 'fail'

export interface DoctorCheck {
  name: string
  status: DoctorStatus
  message: string
  details?: string[]
  suggestions?: string[]
}

interface CorePackageJson {
  exports?: Record<string, unknown>
}

export interface DoctorOptions {
  cwd?: string
  nodeVersion?: string
  env?: NodeJS.ProcessEnv
  /** Injectable reader for the installed @expcat/tigercat-core package.json (for tests). */
  readCorePackageJson?: (cwd: string) => CorePackageJson | null
}

interface ProjectPackage {
  packageManager?: unknown
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

type Framework = 'vue3' | 'react'

const MIN_NODE_MAJOR = 20
const MIN_PNPM_MAJOR = 8
const REQUIRED_TAILWIND_MAJOR = 4
const REQUIRED_TIGERCAT_MAJOR = 1

/** Minimum supported major versions for framework peers, enforced by the compatibility matrix check. */
const FRAMEWORK_PEER_RANGES: Record<Framework, { dep: string; major: number }[]> = {
  vue3: [{ dep: 'vue', major: 3 }],
  react: [
    { dep: 'react', major: 19 },
    { dep: 'react-dom', major: 19 }
  ]
}

/** Subpath exports @expcat/tigercat-core must continue to expose (see Roadmap Tailwind guard). */
const REQUIRED_CORE_EXPORTS = [
  '.',
  './tailwind',
  './tailwind/modern',
  './tokens.css',
  './figma-variables.json'
]

const VERSION_COMPATIBILITY_MATRIX = [
  { name: 'Node.js', range: '>=20.11.0', reason: 'Matches workspace engines and CLI templates' },
  { name: 'pnpm', range: '>=8.0.0', reason: 'Required by workspace package management' },
  { name: 'Tailwind CSS', range: '>=4.0.0', reason: 'Required by Tigercat theme utilities' },
  { name: 'Vue', range: '^3.0.0', reason: 'Peer range for @expcat/tigercat-vue' },
  { name: 'React', range: '^19.0.0', reason: 'Peer range for @expcat/tigercat-react' }
] as const

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
    .option('--json', 'Print structured JSON output')
    .description('Check whether the current project is compatible with Tigercat')
    .action((opts: { json?: boolean }) => {
      runDoctor(Boolean(opts.json))
    })
}

export function collectDoctorChecks(options: DoctorOptions = {}): DoctorCheck[] {
  const cwd = options.cwd ?? process.cwd()
  const env = options.env ?? process.env
  const readCorePackageJson = options.readCorePackageJson ?? defaultReadCorePackageJson
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
  checks.push(createCompatibilityMatrixCheck(packageResult.packageJson))

  const coreExportsCheck = createCoreExportsCheck(
    packageResult.packageJson,
    cwd,
    readCorePackageJson
  )
  if (coreExportsCheck) {
    checks.push(coreExportsCheck)
  }

  return checks
}

function runDoctor(json = false) {
  const checks = collectDoctorChecks()

  if (json) {
    const failures = checks.filter((check) => check.status === 'fail')
    const warnings = checks.filter((check) => check.status === 'warn')
    console.log(
      JSON.stringify(
        {
          status: failures.length > 0 ? 'fail' : warnings.length > 0 ? 'warn' : 'pass',
          checks,
          compatibilityMatrix: VERSION_COMPATIBILITY_MATRIX
        },
        null,
        2
      )
    )

    if (failures.length > 0) process.exit(1)
    return
  }

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
      message: result.error ?? 'package.json could not be read',
      suggestions: ['Run this command from a project root that contains package.json']
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
      message: `Node ${MIN_NODE_MAJOR}+ is required, current version is ${version}`,
      suggestions: [`Install Node ${MIN_NODE_MAJOR}+ and rerun tigercat doctor`]
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
      message: `Could not detect pnpm version; Tigercat templates expect pnpm ${MIN_PNPM_MAJOR}+`,
      suggestions: ['Add packageManager: pnpm@10.26.2 to package.json or run through pnpm']
    }
  }

  const parsed = parseVersion(version)

  if (!parsed || parsed.major < MIN_PNPM_MAJOR) {
    return {
      name: 'pnpm',
      status: 'fail',
      message: `pnpm ${MIN_PNPM_MAJOR}+ is required, detected ${version}`,
      suggestions: [`Upgrade pnpm to ${MIN_PNPM_MAJOR}+`]
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
      message: 'tailwindcss is missing; Tigercat requires Tailwind CSS 4+',
      suggestions: ['Install tailwindcss and @tailwindcss/vite']
    }
  }

  const tailwindMajor = getRangeMajor(tailwindRange)

  if (tailwindMajor !== null && tailwindMajor < REQUIRED_TAILWIND_MAJOR) {
    return {
      name: 'Tailwind CSS',
      status: 'fail',
      message: `tailwindcss ${tailwindRange} is not compatible; use Tailwind CSS ${REQUIRED_TAILWIND_MAJOR}+`,
      suggestions: [`Upgrade tailwindcss to ${REQUIRED_TAILWIND_MAJOR}+`]
    }
  }

  if (tailwindMajor === null) {
    return {
      name: 'Tailwind CSS',
      status: 'fail',
      message: `Could not verify tailwindcss range ${tailwindRange}; Tigercat builds with Tailwind CSS ${REQUIRED_TAILWIND_MAJOR}+ only`,
      suggestions: [`Use an explicit Tailwind CSS ${REQUIRED_TAILWIND_MAJOR}+ semver range`]
    }
  }

  if (!vitePluginRange) {
    return {
      name: 'Tailwind CSS',
      status: 'fail',
      message: '@tailwindcss/vite is required; Tigercat builds with Tailwind CSS 4 only',
      suggestions: ['Install @tailwindcss/vite 4+']
    }
  }

  const pluginMajor = getRangeMajor(vitePluginRange)

  if (pluginMajor !== null && pluginMajor < REQUIRED_TAILWIND_MAJOR) {
    return {
      name: 'Tailwind CSS',
      status: 'fail',
      message: `@tailwindcss/vite ${vitePluginRange} is not compatible; use ${REQUIRED_TAILWIND_MAJOR}+`,
      suggestions: [`Upgrade @tailwindcss/vite to ${REQUIRED_TAILWIND_MAJOR}+`]
    }
  }

  if (pluginMajor === null) {
    return {
      name: 'Tailwind CSS',
      status: 'fail',
      message: `Could not verify @tailwindcss/vite range ${vitePluginRange}; Tigercat builds with Tailwind CSS ${REQUIRED_TAILWIND_MAJOR}+ only`,
      suggestions: [`Use an explicit @tailwindcss/vite ${REQUIRED_TAILWIND_MAJOR}+ semver range`]
    }
  }

  return {
    name: 'Tailwind CSS',
    status: 'pass',
    message: `tailwindcss ${tailwindRange} uses the Tailwind CSS ${REQUIRED_TAILWIND_MAJOR} build pipeline`,
    details: [`@tailwindcss/vite ${vitePluginRange}`]
  }
}

function createPeerDepsCheck(packageJson: ProjectPackage): DoctorCheck {
  const allDeps = collectDependencies(packageJson)
  const frameworks = detectTigercatFrameworks(allDeps)

  if (frameworks.length === 0) {
    return {
      name: 'Peer dependencies',
      status: 'warn',
      message: 'No Tigercat Vue or React package was detected',
      suggestions: ['Install @expcat/tigercat-vue or @expcat/tigercat-react']
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
      details: [...missing.map((dependency) => `Missing ${dependency}`), ...incompatible],
      suggestions: ['Run tigercat add --install or install the listed dependencies manually']
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
      message: 'Skipped because no supported Tigercat framework package was detected',
      suggestions: ['Install a Tigercat framework package to enable template compatibility checks']
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
      details: missing.map((dependency) => `Template dependency not found: ${dependency}`),
      suggestions: ['Compare your project dependencies with the latest tigercat create template']
    }
  }

  return {
    name: 'Template compatibility',
    status: 'pass',
    message: `${frameworks.map(formatFramework).join(' + ')} template dependencies are present`
  }
}

function createCompatibilityMatrixCheck(packageJson: ProjectPackage): DoctorCheck {
  const dependencies = collectDependencies(packageJson)
  const details = VERSION_COMPATIBILITY_MATRIX.map(
    (item) => `${item.name} ${item.range} - ${item.reason}`
  )
  const frameworks = detectTigercatFrameworks(dependencies)

  if (frameworks.length === 0) {
    return {
      name: 'Version compatibility matrix',
      status: 'warn',
      message: 'Framework-specific matrix checks were skipped',
      details,
      suggestions: ['Install a Tigercat Vue or React package to validate framework peer ranges']
    }
  }

  const incompatible = frameworks.flatMap((framework) =>
    FRAMEWORK_PEER_RANGES[framework]
      .filter(({ dep, major }) => isOlderMajor(dependencies[dep], major))
      .map(({ dep, major }) => `${dep}@${dependencies[dep]} is below the supported major ${major}`)
  )

  if (incompatible.length > 0) {
    return {
      name: 'Version compatibility matrix',
      status: 'fail',
      message: 'Installed framework versions are outside the supported range',
      details: [...incompatible, ...details],
      suggestions: ['Upgrade the listed framework packages to the supported major versions']
    }
  }

  return {
    name: 'Version compatibility matrix',
    status: 'pass',
    message: `${frameworks.map(formatFramework).join(' + ')} versions satisfy the compatibility matrix`,
    details
  }
}

function createCoreExportsCheck(
  packageJson: ProjectPackage,
  cwd: string,
  readCorePackageJson: (cwd: string) => CorePackageJson | null
): DoctorCheck | null {
  const dependencies = collectDependencies(packageJson)
  if (!dependencies['@expcat/tigercat-core']) {
    return null
  }

  const corePackageJson = readCorePackageJson(cwd)
  if (!corePackageJson) {
    // Not installed/resolvable yet — nothing to verify; a real build would surface broken exports.
    return null
  }

  const exportsMap = corePackageJson.exports ?? {}
  const missing = REQUIRED_CORE_EXPORTS.filter((subpath) => !(subpath in exportsMap))

  if (missing.length > 0) {
    return {
      name: 'Core exports',
      status: 'fail',
      message: '@expcat/tigercat-core is missing required export subpaths',
      details: missing.map((subpath) => `Missing export: ${subpath}`),
      suggestions: ['Upgrade @expcat/tigercat-core or reinstall dependencies']
    }
  }

  return {
    name: 'Core exports',
    status: 'pass',
    message: '@expcat/tigercat-core exposes the required Tailwind, token and entry exports'
  }
}

function defaultReadCorePackageJson(cwd: string): CorePackageJson | null {
  try {
    const requireFromProject = createRequire(pathToFileURL(join(cwd, 'package.json')))
    const mainEntry = requireFromProject.resolve('@expcat/tigercat-core')

    let dir = dirname(mainEntry)
    for (let depth = 0; depth < 6; depth++) {
      const content = readFileSafe(join(dir, 'package.json'))
      if (content) {
        const parsed = JSON.parse(content) as CorePackageJson & { name?: string }
        if (parsed.name === '@expcat/tigercat-core') return parsed
      }
      const parent = dirname(dir)
      if (parent === dir) break
      dir = parent
    }
    return null
  } catch {
    return null
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

  for (const suggestion of check.suggestions ?? []) {
    console.log(`  ${pc.dim('fix:')} ${suggestion}`)
  }
}
