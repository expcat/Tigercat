import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'

import { createFsSource, createHttpSource, DEFAULT_REMOTE_BASE_URL } from './source'
import type {
  ComponentMetadata,
  DoctorResult,
  LoadSkillIndexOptions,
  ReferenceSource,
  SkillIndex,
  SkillSource,
  TigercatContext7
} from './types'

const DEFAULT_MAX_BYTES = 12_000
const REFERENCES_ROOT = 'skills/tigercat/references'
const DEFAULT_COMPONENT_INDEX = 'skills/tigercat/references/component-index.md'
const DEFAULT_REACT_REFERENCE = 'skills/tigercat/references/react/index.md'
const DEFAULT_VUE_REFERENCE = 'skills/tigercat/references/vue/index.md'

export async function loadSkillIndex(
  options?: string | LoadSkillIndexOptions
): Promise<SkillIndex> {
  const resolved = typeof options === 'string' ? { root: options } : (options ?? {})

  if (resolved.root) {
    return loadFsSkillIndex(resolve(resolved.root))
  }

  return loadHttpSkillIndex(resolved.baseUrl ?? DEFAULT_REMOTE_BASE_URL, resolved.timeoutMs)
}

async function loadFsSkillIndex(resolvedRoot: string): Promise<SkillIndex> {
  const contextPath = join(resolvedRoot, 'context7.json')

  if (!existsSync(contextPath)) {
    throw new Error(`Missing context7.json under ${resolvedRoot}`)
  }

  const context7 = JSON.parse(await readFile(contextPath, 'utf8')) as TigercatContext7
  const allowedReferencePaths = collectAllowedReferencePaths(context7)

  if (existsSync(join(resolvedRoot, REFERENCES_ROOT))) {
    for (const path of await collectMarkdownReferences(join(resolvedRoot, REFERENCES_ROOT))) {
      allowedReferencePaths.add(normalizeRelativePath(relative(resolvedRoot, path)))
    }
  }

  retainMarkdownPaths(allowedReferencePaths)

  for (const path of allowedReferencePaths) {
    const absolutePath = join(resolvedRoot, path)
    if (!existsSync(absolutePath)) {
      throw new Error(`Missing Tigercat skill reference: ${path}`)
    }
  }

  return buildSkillIndex(context7, createFsSource(resolvedRoot), allowedReferencePaths)
}

async function loadHttpSkillIndex(baseUrl: string, timeoutMs?: number): Promise<SkillIndex> {
  const source = createHttpSource(baseUrl, { timeoutMs })
  const raw = await source.readText('context7.json')

  let context7: TigercatContext7
  try {
    context7 = JSON.parse(raw) as TigercatContext7
  } catch (error) {
    throw new Error(
      `Invalid context7.json from ${source.origin}context7.json: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { cause: error }
    )
  }

  // 远程无法列目录;context7.json(含 skill_files 清单)即 allow-list 契约,
  // 逐文件可达性留给惰性读取与 --doctor 兜底。
  const allowedReferencePaths = retainMarkdownPaths(collectAllowedReferencePaths(context7))

  return buildSkillIndex(context7, source, allowedReferencePaths)
}

function collectAllowedReferencePaths(context7: TigercatContext7): Set<string> {
  const allowedReferencePaths = new Set<string>()

  for (const path of collectReferencePaths(context7)) {
    allowedReferencePaths.add(normalizeRelativePath(path))
  }

  allowedReferencePaths.add('skills/tigercat/SKILL.md')
  return allowedReferencePaths
}

// reference_paths 中含目录条目(shared/props、examples),allow-list 只保留 .md 文件,
// 避免真读 EISDIR 与远程 doctor 对目录 URL 的虚假 404。
function retainMarkdownPaths(paths: Set<string>): Set<string> {
  for (const path of paths) {
    if (!path.endsWith('.md')) {
      paths.delete(path)
    }
  }
  return paths
}

function buildSkillIndex(
  context7: TigercatContext7,
  source: SkillSource,
  allowedReferencePaths: Set<string>
): SkillIndex {
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

  return {
    root: source.origin,
    source,
    context7,
    components,
    componentsByNormalizedName,
    aliasTargetsByNormalizedName,
    topics: new Map(Object.entries(context7.topics ?? {})),
    allowedReferencePaths
  }
}

export async function diagnoseTigercatMcp(
  options?: string | LoadSkillIndexOptions
): Promise<DoctorResult> {
  const index = await loadSkillIndex(options)
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

  // 顺序探测：doctor 对延迟不敏感，避免并发打爆简单静态服务器（镜像站）。
  for (const path of index.allowedReferencePaths) {
    try {
      await index.source.probe(path)
      readableReferenceCount += 1
    } catch {
      issues.push(`reference is not readable: ${path}`)
    }
  }

  let remoteVersion: string | undefined
  if (index.source.kind === 'http') {
    // version.json 由 Pages 部署时生成,属补充信息,不可达不算问题。
    try {
      const parsed = JSON.parse(await index.source.readText('version.json')) as {
        version?: unknown
      }
      if (typeof parsed.version === 'string' && parsed.version) {
        remoteVersion = parsed.version
      }
    } catch {
      // ignore
    }
  }

  return {
    ok: issues.length === 0,
    root: index.root,
    mode: index.source.kind,
    componentCount: index.components.size,
    aliasCount: index.aliasTargetsByNormalizedName.size,
    topicCount: index.topics.size,
    readableReferenceCount,
    ...(remoteVersion ? { remoteVersion } : {}),
    issues
  }
}

export async function readReferenceSource(
  index: SkillIndex,
  path: string,
  reason: string,
  maxBytes = DEFAULT_MAX_BYTES,
  section?: string
): Promise<ReferenceSource> {
  const normalizedPath = normalizeRelativePath(path)

  if (!index.allowedReferencePaths.has(normalizedPath)) {
    throw new Error(`Reference path is not allowed: ${path}`)
  }

  const text = await index.source.readText(normalizedPath)
  const limit = Number.isFinite(maxBytes) && maxBytes > 0 ? Math.floor(maxBytes) : DEFAULT_MAX_BYTES

  if (section) {
    const extracted = extractMarkdownSection(text, section)
    if (extracted !== undefined) {
      return {
        path: normalizedPath,
        reason,
        truncated: Buffer.byteLength(extracted, 'utf8') > limit,
        section,
        text: truncateUtf8(extracted, limit)
      }
    }
  }

  const truncated = Buffer.byteLength(text, 'utf8') > limit

  return {
    path: normalizedPath,
    reason,
    truncated,
    text: truncateUtf8(text, limit)
  }
}

// 分类级 props 文件按 `## <组件名>` 抽小节,替代按字节盲截——盲截会把落在
// 12KB 之后的组件(如 basic 分类的 Tag/Link)整段切丢。找不到小节时返回
// undefined,由调用方回退整文件读取。
export function extractMarkdownSection(text: string, section: string): string | undefined {
  const lines = text.split('\n')
  const heading = section.trim().toLowerCase()
  let start = -1

  for (let index = 0; index < lines.length; index++) {
    const match = /^##\s+(.+?)\s*$/.exec(lines[index])
    if (match && match[1].toLowerCase() === heading) {
      start = index
      break
    }
  }

  if (start === -1) return undefined

  let end = lines.length
  for (let index = start + 1; index < lines.length; index++) {
    if (/^##\s/.test(lines[index])) {
      end = index
      break
    }
  }

  return `${lines.slice(start, end).join('\n').trimEnd()}\n`
}

// 指针型 source:只给 path/reason 不内联正文,用于每会话读一次即可的背景文档。
export function createReferencePointer(
  index: SkillIndex,
  path: string,
  reason: string
): ReferenceSource {
  const normalizedPath = normalizeRelativePath(path)

  if (!index.allowedReferencePaths.has(normalizedPath)) {
    throw new Error(`Reference path is not allowed: ${path}`)
  }

  return { path: normalizedPath, reason, truncated: false }
}

export async function readContext7Source(index: SkillIndex): Promise<ReferenceSource> {
  const text = await index.source.readText('context7.json')
  return {
    path: 'context7.json',
    reason: 'Generated Tigercat MCP inventory and route map.',
    truncated: false,
    text
  }
}

// 保留 CJK 统一表意文字:中文别名/任务词(如 表单、日期选择器)归一化后不再被清空,
// 组件路由才能命中;英文行为不变。
export function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9一-鿿]/g, '')
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
