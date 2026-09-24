import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

function resolveAdjacent(relativePath: string): string {
  const meta = import.meta.url
  if (meta.startsWith('file:')) return join(dirname(fileURLToPath(meta)), relativePath)
  if (meta.startsWith('/')) return join(dirname(meta), relativePath)
  return join(dirname(fileURLToPath(pathToFileURL(meta))), relativePath)
}

function readCliPackageVersion(): string {
  const raw = readFileSync(resolveAdjacent('../package.json'), 'utf8')
  const version = (JSON.parse(raw) as { version?: unknown }).version
  if (typeof version !== 'string' || version.length === 0) {
    throw new Error('@expcat/tigercat-cli package.json is missing version')
  }
  return version
}

export const CLI_NAME = 'tigercat'
export const CLI_VERSION = readCliPackageVersion()
export const TEMPLATE_PACKAGE_MANAGER = 'pnpm@11.9.0'
export const TEMPLATE_GITIGNORE = `node_modules
dist
dist-ssr
.tigercat-playground
*.local
.DS_Store
`

export const TEMPLATES = ['vue3', 'react'] as const
export type TemplateName = (typeof TEMPLATES)[number]

/**
 * Centralized dependency versions for CLI-generated project templates.
 *
 * Keep these aligned with the workspace catalog in pnpm-workspace.yaml.
 * When bumping versions in the catalog, update them here as well.
 */
export const TEMPLATE_VERSIONS = {
  // Tigercat packages (use caret on latest major)
  tigercat: `^${CLI_VERSION}`,

  // Frameworks
  vue: '^3.5.39',
  react: '^19.2.7',
  reactDom: '^19.2.7',

  // Build toolchain
  typescript: '^6.0.3',
  vite: '^8.1.3',
  tailwindcss: '^4.3.2',
  tailwindcssVite: '^4.3.2',

  // Vite plugins
  vitejsPluginVue: '^6.0.7',
  vitejsPluginReact: '^6.0.3',

  // Type definitions
  typesReact: '^19.2.17',
  typesReactDom: '^19.2.3',

  // Vue-specific
  vueTsconfig: '^0.9.1',
  vueTsc: '^3.3.7'
} as const

import componentRecords from './public-component-records.json' with { type: 'json' }

const ADD_ALIAS_NAMES = new Set(['Grid', 'Notification', 'DonutChart'])

export const PUBLIC_COMPONENT_RECORDS = componentRecords as Array<{
  component: string
  testGroup: string
  packageSubpath: string
}>

export const COMPONENT_CATEGORIES: Record<string, string[]> = {}

for (const record of PUBLIC_COMPONENT_RECORDS) {
  if (ADD_ALIAS_NAMES.has(record.component)) continue
  const group = COMPONENT_CATEGORIES[record.testGroup] ?? []
  group.push(record.component)
  COMPONENT_CATEGORIES[record.testGroup] = group
}

for (const names of Object.values(COMPONENT_CATEGORIES)) names.sort()

export const ALL_COMPONENTS = Object.values(COMPONENT_CATEGORIES).flat()

export function resolveAddableComponents(name: string): string[] | null {
  const canonical = ALL_COMPONENTS.find(
    (component) => component.toLowerCase() === name.toLowerCase()
  )
  if (canonical) return [canonical]
  if (name.toLowerCase() === 'grid') return ['Row', 'Col']
  if (name.toLowerCase() === 'donutchart') return ['PieChart']
  if (name.toLowerCase() === 'notification') return []
  return null
}

export function componentImportSpecifier(packageName: string, component: string): string {
  const record = PUBLIC_COMPONENT_RECORDS.find((item) => item.component === component)
  const subpath = record?.packageSubpath ?? `./${component}`
  return `${packageName}${subpath.startsWith('.') ? subpath.slice(1) : `/${subpath}`}`
}
