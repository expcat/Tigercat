import { existsSync } from 'node:fs'
import { readdir, readFile, realpath } from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'

import type { ComponentEntry, ReferenceSource, SkillIndex, TigercatContext7 } from './types'

const DEFAULT_MAX_BYTES = 12_000
const SKILL_ROOT = 'skills/tigercat'
const REFERENCES_ROOT = 'skills/tigercat/references'

export async function loadSkillIndex(root?: string): Promise<SkillIndex> {
  const resolvedRoot = root ? resolve(root) : await findTigercatRoot(process.cwd())
  const contextPath = join(resolvedRoot, 'context7.json')

  if (!existsSync(contextPath)) {
    throw new Error(`Missing context7.json under ${resolvedRoot}`)
  }

  const context7 = JSON.parse(await readFile(contextPath, 'utf8')) as TigercatContext7
  const componentIndex = context7.component_index ?? {}
  const components = new Map<string, ComponentEntry>()
  const componentsByNormalizedName = new Map<string, ComponentEntry>()

  for (const [slug, entry] of Object.entries(componentIndex)) {
    for (const component of entry.components ?? []) {
      const componentEntry: ComponentEntry = {
        name: component,
        category: toCategoryName(slug),
        slug,
        props: entry.props,
        examples: entry.examples,
        react: entry.react,
        vue: entry.vue
      }
      components.set(component, componentEntry)
      componentsByNormalizedName.set(normalizeName(component), componentEntry)
    }
  }

  const allowedReferencePaths = new Set<string>()
  for (const path of collectStringValues(context7.reference_paths ?? {})) {
    allowedReferencePaths.add(normalizeRelativePath(path))
  }
  for (const entry of Object.values(componentIndex)) {
    for (const path of [entry.props, entry.examples, entry.react, entry.vue]) {
      allowedReferencePaths.add(normalizeRelativePath(path))
    }
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
    allowedReferencePaths
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
    reason: 'Context7 component-to-reference route map.',
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

function collectStringValues(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (!value || typeof value !== 'object') return []
  if (Array.isArray(value)) return value.flatMap((item) => collectStringValues(item))
  return Object.values(value).flatMap((item) => collectStringValues(item))
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
