import { existsSync } from 'node:fs'
import { access, readdir, readFile, realpath } from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'

import type {
  ComponentMetadata,
  DoctorResult,
  ReferenceSource,
  SkillIndex,
  TigercatContext7
} from './types'

const DEFAULT_MAX_BYTES = 12_000
const SKILL_ROOT = 'skills/tigercat'
const REFERENCES_ROOT = 'skills/tigercat/references'
const DEFAULT_COMPONENT_INDEX = 'skills/tigercat/references/component-index.md'
const DEFAULT_REACT_REFERENCE = 'skills/tigercat/references/react/index.md'
const DEFAULT_VUE_REFERENCE = 'skills/tigercat/references/vue/index.md'

export async function loadSkillIndex(root?: string): Promise<SkillIndex> {
  const resolvedRoot = root ? resolve(root) : await findTigercatRoot(process.cwd())
  const contextPath = join(resolvedRoot, 'context7.json')

  if (!existsSync(contextPath)) {
    throw new Error(`Missing context7.json under ${resolvedRoot}`)
  }

  const context7 = JSON.parse(await readFile(contextPath, 'utf8')) as TigercatContext7
  const components = buildComponentMap(context7)
  const componentsByNormalizedName = new Map<string, ComponentMetadata>()
  const aliasTargetsByNormalizedName = new Map<string, string[]>()

  for (const [alias, targets] of Object.entries(context7.aliases ?? {})) {
    addAliasTarget(
      aliasTargetsByNormalizedName,
      alias,
      Array.isArray(targets) ? targets : [targets]
    )
  }

  for (const entry of components.values()) {
    componentsByNormalizedName.set(normalizeName(entry.name), entry)
    for (const alias of entry.aliases) {
      addAliasTarget(aliasTargetsByNormalizedName, alias, [entry.name])
    }
  }

  const allowedReferencePaths = new Set<string>()
  for (const path of collectReferencePaths(context7)) {
    allowedReferencePaths.add(normalizeRelativePath(path))
  }

  if (existsSync(join(resolvedRoot, REFERENCES_ROOT))) {
    for (const path of await collectMarkdownReferences(join(resolvedRoot, REFERENCES_ROOT))) {
      allowedReferencePaths.add(normalizeRelativePath(relative(resolvedRoot, path)))
    }
  }

  allowedReferencePaths.add('skills/tigercat/SKILL.md')

  for (const path of allowedReferencePaths) {
    const absolutePath = join(resolvedRoot, path)
    if (!existsSync(absolutePath)) {
      throw new Error(`Missing Tigercat skill reference: ${path}`)
    }
  }

  return {
    root: resolvedRoot,
    context7,
    components,
    componentsByNormalizedName,
    aliasTargetsByNormalizedName,
    topics: new Map(Object.entries(context7.topics ?? {})),
    allowedReferencePaths
  }
}

export async function diagnoseTigercatMcp(root?: string): Promise<DoctorResult> {
  const index = await loadSkillIndex(root)
  const issues: string[] = []
  let readableReferenceCount = 0

  if (
    index.context7.component_count !== undefined &&
    index.context7.component_count !== index.components.size
  ) {
    issues.push(
      `context7 component_count ${index.context7.component_count} does not match ${index.components.size}`
    )
  }

  for (const [alias, targets] of index.aliasTargetsByNormalizedName) {
    const missing = targets.filter((target) => !index.components.has(target))
    if (missing.length > 0) {
      issues.push(`alias ${alias} targets missing component(s): ${missing.join(', ')}`)
    }
  }

  for (const path of index.allowedReferencePaths) {
    try {
      await access(join(index.root, path))
      readableReferenceCount += 1
    } catch {
      issues.push(`reference is not readable: ${path}`)
    }
  }

  return {
    ok: issues.length === 0,
    root: index.root,
    componentCount: index.components.size,
    aliasCount: index.aliasTargetsByNormalizedName.size,
    topicCount: index.topics.size,
    readableReferenceCount,
    issues
  }
}

export async function readReferenceSource(
  index: SkillIndex,
  path: string,
  reason: string,
  maxBytes = DEFAULT_MAX_BYTES
): Promise<ReferenceSource> {
  const normalizedPath = normalizeRelativePath(path)

  if (!index.allowedReferencePaths.has(normalizedPath)) {
    throw new Error(`Reference path is not allowed: ${path}`)
  }

  const absolutePath = join(index.root, normalizedPath)
  const rootPath = await realpath(index.root)
  const filePath = await realpath(absolutePath)
  const relativePath = relative(rootPath, filePath)

  if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
    throw new Error(`Reference path escapes the Tigercat repo: ${path}`)
  }

  const text = await readFile(filePath, 'utf8')
  const limit = Number.isFinite(maxBytes) && maxBytes > 0 ? Math.floor(maxBytes) : DEFAULT_MAX_BYTES
  const truncated = Buffer.byteLength(text, 'utf8') > limit

  return {
    path: normalizedPath,
    reason,
    truncated,
    text: truncateUtf8(text, limit)
  }
}

export async function readContext7Source(index: SkillIndex): Promise<ReferenceSource> {
  const text = await readFile(join(index.root, 'context7.json'), 'utf8')
  return {
    path: 'context7.json',
    reason: 'Generated Tigercat MCP inventory and route map.',
    truncated: false,
    text
  }
}

export async function findTigercatRoot(startDirectory: string): Promise<string> {
  let current = resolve(startDirectory)

  while (true) {
    if (existsSync(join(current, 'context7.json')) && existsSync(join(current, SKILL_ROOT))) {
      return current
    }

    const next = dirname(current)
    if (next === current) {
      throw new Error(`Could not find Tigercat repo root from ${startDirectory}`)
    }
    current = next
  }
}

export function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function normalizeRelativePath(path: string): string {
  const normalized = path.replaceAll('\\', '/').replace(/^\.?\//, '')
  const parts = normalized.split('/').filter(Boolean)

  if (parts.some((part) => part === '..')) {
    throw new Error(`Reference path may not contain parent segments: ${path}`)
  }

  return parts.join('/')
}

function buildComponentMap(context7: TigercatContext7): Map<string, ComponentMetadata> {
  const components = new Map<string, ComponentMetadata>()

  for (const entry of Object.values(context7.components ?? {})) {
    components.set(entry.name, {
      ...entry,
      aliases: entry.aliases ?? [],
      sourceFiles: entry.sourceFiles ?? [],
      propsInterfaces: entry.propsInterfaces ?? [],
      frameworks: entry.frameworks ?? ['react', 'vue']
    })
  }

  if (components.size > 0) return components

  for (const [slug, entry] of Object.entries(context7.component_index ?? {})) {
    for (const component of entry.components ?? []) {
      components.set(component, {
        name: component,
        aliases: [],
        category: toCategoryName(slug),
        slug,
        testGroup: slug,
        packageSubpath: `./${component}`,
        packageTarget: component,
        typeSource: 'unknown',
        sourceFiles: [],
        propsInterfaces: [],
        frameworks: ['react', 'vue'],
        references: {
          componentIndex: DEFAULT_COMPONENT_INDEX,
          props: entry.props,
          examples: entry.examples,
          react: entry.react || DEFAULT_REACT_REFERENCE,
          vue: entry.vue || DEFAULT_VUE_REFERENCE
        }
      })
    }
  }

  return components
}

function collectReferencePaths(value: unknown): string[] {
  if (typeof value === 'string') {
    return value.startsWith('skills/tigercat/') ? [value] : []
  }
  if (!value || typeof value !== 'object') return []
  if (Array.isArray(value)) return value.flatMap((item) => collectReferencePaths(item))
  return Object.values(value).flatMap((item) => collectReferencePaths(item))
}

function addAliasTarget(targetsByAlias: Map<string, string[]>, alias: string, targets: string[]) {
  const normalizedAlias = normalizeName(alias)
  if (!normalizedAlias) return

  const existing = targetsByAlias.get(normalizedAlias) ?? []
  targetsByAlias.set(normalizedAlias, [...new Set([...existing, ...targets])])
}

async function collectMarkdownReferences(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const paths: string[] = []

  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      paths.push(...(await collectMarkdownReferences(path)))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      paths.push(path)
    }
  }

  return paths
}

function truncateUtf8(text: string, maxBytes: number): string {
  const bytes = Buffer.from(text, 'utf8')
  if (bytes.byteLength <= maxBytes) return text
  return bytes
    .subarray(0, maxBytes)
    .toString('utf8')
    .replace(/\uFFFD$/u, '')
}

function toCategoryName(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1)
}
