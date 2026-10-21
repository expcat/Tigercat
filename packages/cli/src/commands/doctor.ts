import { Command } from 'commander'
import pc from 'picocolors'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { existsSync, readFileSync } from 'node:fs'
import { CLI_VERSION } from '../constants'
import requiredCoreExports from '../required-core-exports.json' with { type: 'json' }
import { logError, logInfo, logSuccess, logWarn } from '../utils/logger'
import { readFileSafe, resolveCliPackageRoot } from '../utils/fs'

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

const MIN_NODE_VERSION = { major: 22, minor: 13, patch: 0 } as const
const MIN_PNPM_VERSION = { major: 11, minor: 9, patch: 0 } as const
const MIN_NODE_RANGE = '22.13.0'
const MIN_PNPM_RANGE = '11.9.0'
const REQUIRED_TAILWIND_MAJOR = 4
const REQUIRED_TIGERCAT_MAJOR = Number(CLI_VERSION.split('.')[0])

/** Minimum supported major versions for framework peers, enforced by the compatibility matrix check. */
const FRAMEWORK_PEER_RANGES: Record<Framework, { dep: string; major: number }[]> = {
  vue3: [{ dep: 'vue', major: 3 }],
  react: [
    { dep: 'react', major: 19 },
    { dep: 'react-dom', major: 19 }
  ]
}

/** Subpath exports generated from the core entry table. */
const REQUIRED_CORE_EXPORTS: readonly string[] = requiredCoreExports

const VERSION_COMPATIBILITY_MATRIX = [
  {
    name: 'Node.js',
    range: `>=${MIN_NODE_RANGE}`,
    reason: 'Matches workspace engines and CLI templates'
  },
  {
    name: 'pnpm',
    range: `>=${MIN_PNPM_RANGE}`,
    reason: 'Required by workspace package management'
  },
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

  checks.push(createTailwindCheck(packageResult.packageJson, cwd))
  checks.push(createPeerDepsCheck(packageResult.packageJson, cwd))
  checks.push(createTemplateCompatibilityCheck(packageResult.packageJson))
  checks.push(createCompatibilityMatrixCheck(packageResult.packageJson, cwd))

  const coreExportsCheck = createCoreExportsCheck(
    packageResult.packageJson,
    cwd,
    readCorePackageJson
  )
  if (coreExportsCheck) {
    checks.push(coreExportsCheck)
  }

  checks.push(createSkillCatalogCheck(cwd))

  return checks
}

/**
 * Locate the skill catalog of the @expcat/tigercat-mcp installed in the
 * consuming project, using Node package resolution so hoisted installs in an
 * ancestor node_modules are found. Returns the snapshot version.json path.
 */
function resolveInstalledSkillCatalog(cwd: string): string | null {
  try {
    const requireFromProject = createRequire(pathToFileURL(join(cwd, 'package.json')))
    const entry = requireFromProject.resolve('@expcat/tigercat-mcp')
    let dir = dirname(entry)
    for (let depth = 0; depth < 6; depth++) {
      const content = readFileSafe(join(dir, 'package.json'))
      if (content) {
        const parsed = JSON.parse(content) as { name?: string }
        if (parsed.name === '@expcat/tigercat-mcp') {
          return join(dir, 'snapshot', 'version.json')
        }
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

/**
 * When the CLI runs inside this repository (source modules or the built dist),
 * the sibling packages/mcp snapshot is the same catalog the CLI was built
 * from. The package.json name is verified so an unrelated directory that
 * happens to be called mcp is never inspected.
 */
function resolveMonorepoSkillCatalog(cwd: string): string | null {
  const pkgRoot = resolveCliPackageRoot(dirname(fileURLToPath(import.meta.url)))
  if (!pkgRoot) return null
  const repoRoot = resolve(pkgRoot, '..', '..')
  // Only trust the sibling snapshot when the CLI runs for a project inside its
  // own workspace; a repo-built CLI invoked from an unrelated consumer must
  // not read the repository snapshot.
  const rel = relative(repoRoot, resolve(cwd))
  if (rel.startsWith('..') || isAbsolute(rel)) return null
  const mcpRoot = join(pkgRoot, '..', 'mcp')
  const raw = readFileSafe(join(mcpRoot, 'package.json'))
  if (!raw) return null
  try {
    if ((JSON.parse(raw) as { name?: string }).name !== '@expcat/tigercat-mcp') return null
  } catch {
    return null
  }
  return join(mcpRoot, 'snapshot', 'version.json')
}

function createSkillCatalogCheck(cwd: string): DoctorCheck {
  const candidates = [resolveInstalledSkillCatalog(cwd), resolveMonorepoSkillCatalog(cwd)].filter(
    (path): path is string => path !== null
  )
  const versionPath = candidates.find((path) => existsSync(path))
  if (!versionPath) {
    return {
      name: 'Skill catalog',
      status: 'pass',
      message: 'No packaged skill catalog in this project.'
    }
  }
  try {
    const version = JSON.parse(readFileSync(versionPath, 'utf8')) as {
      version?: unknown
      files?: Record<string, string>
    }
    if (version.version !== CLI_VERSION) {
      return {
        name: 'Skill catalog',
        status: 'fail',
        message: `Skill catalog version ${String(version.version)} does not match CLI ${CLI_VERSION}.`
      }
    }
    if (version.files) {
      const manifestPath = join(dirname(versionPath), 'manifest.json')
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
        files?: Record<string, string>
      }
      const left = Object.keys(version.files).sort()
      const right = Object.keys(manifest.files ?? {}).sort()
      const mismatch =
        left.length !== right.length ||
        left.some(
          (key, index) => key !== right[index] || version.files?.[key] !== manifest.files?.[key]
        )
      if (mismatch) {
        return {
          name: 'Skill catalog',
          status: 'fail',
          message: 'Skill catalog digest does not match manifest.json.'
        }
      }
    }
    return {
      name: 'Skill catalog',
      status: 'pass',
      message: `Skill catalog ${CLI_VERSION} matches this CLI.`
    }
  } catch (error) {
    return {
      name: 'Skill catalog',
      status: 'fail',
      message: error instanceof Error ? error.message : String(error)
    }
  }
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

  if (!parsed || isVersionLessThan(parsed, MIN_NODE_VERSION)) {
    return {
      name: 'Node.js',
      status: 'fail',
      message: `Node ${MIN_NODE_RANGE}+ is required, current version is ${version}`,
      suggestions: [`Install Node ${MIN_NODE_RANGE}+ and rerun tigercat doctor`]
    }
  }

  return {
    name: 'Node.js',
    status: 'pass',
    message: `Node ${version} satisfies >=${MIN_NODE_RANGE}`
  }
}

function createPnpmCheck(packageJson: ProjectPackage | null, env: NodeJS.ProcessEnv): DoctorCheck {
  const version = getPnpmVersion(packageJson, env)

  if (!version) {
    return {
      name: 'pnpm',
      status: 'warn',
      message: `Could not detect pnpm version; Tigercat templates expect pnpm ${MIN_PNPM_RANGE}+`,
      suggestions: ['Add packageManager: pnpm@11.9.0 to package.json or run through pnpm']
    }
  }

  const parsed = parseVersion(version)

  if (!parsed || isVersionLessThan(parsed, MIN_PNPM_VERSION)) {
    return {
      name: 'pnpm',
      status: 'fail',
      message: `pnpm ${MIN_PNPM_RANGE}+ is required, detected ${version}`,
      suggestions: [`Upgrade pnpm to ${MIN_PNPM_RANGE}+`]
    }
  }

  return {
    name: 'pnpm',
    status: 'pass',
    message: `pnpm ${version} satisfies >=${MIN_PNPM_RANGE}`
  }
}

function createTailwindCheck(packageJson: ProjectPackage, cwd: string): DoctorCheck {
  const allDeps = collectDependencies(packageJson)
  const tailwindRange = unwrapCatalogRange(allDeps.tailwindcss, 'tailwindcss', cwd)
  const vitePluginRange = unwrapCatalogRange(allDeps['@tailwindcss/vite'], '@tailwindcss/vite', cwd)

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

function createPeerDepsCheck(packageJson: ProjectPackage, cwd: string): DoctorCheck {
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
      .filter((dependency) =>
        isDifferentMajor(
          unwrapCatalogRange(allDeps[dependency], dependency, cwd),
          REQUIRED_TIGERCAT_MAJOR
        )
      )
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

function createCompatibilityMatrixCheck(packageJson: ProjectPackage, cwd: string): DoctorCheck {
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
    FRAMEWORK_PEER_RANGES[framework].flatMap(({ dep, major }) => {
      const declared = dependencies[dep]
      const resolved = unwrapCatalogRange(declared, dep, cwd)
      if (isOlderMajor(resolved, major)) {
        return [
          declared === resolved
            ? `${dep}@${declared} is below the supported major ${major}`
            : `${dep}@${declared} resolves to ${resolved}, which is below the supported major ${major}`
        ]
      }
      // A catalog range that cannot be resolved is not a verified pass.
      if (declared?.startsWith('catalog:') && !resolved) {
        return [
          `${dep}@${declared} could not be resolved from pnpm-workspace.yaml; cannot verify major ${major}`
        ]
      }
      return []
    })
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

function isVersionLessThan(
  current: { major: number; minor: number; patch: number },
  minimum: { major: number; minor: number; patch: number }
): boolean {
  if (current.major !== minimum.major) return current.major < minimum.major
  if (current.minor !== minimum.minor) return current.minor < minimum.minor
  return current.patch < minimum.patch
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

function isDifferentMajor(range: string | undefined, expectedMajor: number): boolean {
  const major = getRangeMajor(range)
  return major !== null && major !== expectedMajor
}

function unwrapCatalogRange(
  range: string | undefined,
  packageName: string,
  cwd: string
): string | undefined {
  if (!range || !range.startsWith('catalog:')) return range
  const named = range.slice('catalog:'.length)
  const catalogs = loadPnpmCatalog(cwd)
  return named ? catalogs.named[named]?.[packageName] : catalogs.default[packageName]
}

interface PnpmCatalogs {
  default: Record<string, string>
  named: Record<string, Record<string, string>>
}

function loadPnpmCatalog(start: string): PnpmCatalogs {
  let dir = start
  for (let hop = 0; hop < 8; hop += 1) {
    const file = join(dir, 'pnpm-workspace.yaml')
    if (existsSync(file)) return parsePnpmCatalog(readFileSync(file, 'utf8'))
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return { default: {}, named: {} }
}

const CATALOG_ENTRY_RE = /^(?:'([^']+)'|"([^"]+)"|([A-Za-z0-9@/_.-]+))\s*:\s*(\S+)/

/**
 * Parse the default `catalog:` map and the named `catalogs:` maps. Entries are
 * indented `key: range` lines; named catalogs are the two-space indented keys
 * without a value inside `catalogs:`.
 */
function parsePnpmCatalog(yaml: string): PnpmCatalogs {
  const catalogs: PnpmCatalogs = { default: {}, named: {} }
  let section: 'none' | 'default' | 'catalogs' = 'none'
  let currentNamed: string | null = null
  for (const line of yaml.split('\n')) {
    if (/^catalog:\s*$/.test(line)) {
      section = 'default'
      currentNamed = null
      continue
    }
    if (/^catalogs:\s*$/.test(line)) {
      section = 'catalogs'
      currentNamed = null
      continue
    }
    if (line && !/^[\s#]/.test(line)) {
      section = 'none'
      currentNamed = null
      continue
    }
    if (section === 'none') continue
    const content = line.trim()
    if (!content || content.startsWith('#')) continue
    const indent = line.length - line.trimStart().length
    if (section === 'catalogs' && indent === 2) {
      const name = /^([\w.-]+):\s*$/.exec(content)
      currentNamed = name ? name[1] : null
      if (currentNamed && !catalogs.named[currentNamed]) catalogs.named[currentNamed] = {}
      continue
    }
    const entry = CATALOG_ENTRY_RE.exec(content)
    if (!entry) continue
    const key = entry[1] || entry[2] || entry[3]
    if (!key) continue
    if (section === 'default') {
      catalogs.default[key] = entry[4]
    } else if (currentNamed && indent > 2) {
      catalogs.named[currentNamed][key] = entry[4]
    }
  }
  return catalogs
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
