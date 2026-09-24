import type {
  ComponentLookupResult,
  ComponentMetadata,
  ComponentRoute,
  InventorySummary,
  ReferenceSource,
  SearchResponse,
  SearchResult,
  SkillIndex,
  TaskRouteResult,
  TigercatFramework,
  TopicRoute
} from './types'
import {
  clampResultLimit,
  createReferencePointer,
  normalizeName,
  readReferenceSource
} from './skill-index'

interface RouteTaskInput {
  task: string
  framework?: TigercatFramework
  maxBytes?: number
  limit?: number
}

interface ComponentInput {
  component: string
  framework?: TigercatFramework
  maxBytes?: number
}

interface SearchInput {
  query: string
  framework?: TigercatFramework
  limit?: number
}

const MAX_ROUTE_COMPONENTS = 8
const MAX_ROUTE_TOPICS = 8

const SKILL_INDEX = 'skills/tigercat/SKILL.md'
const SHARED_PATTERNS = 'skills/tigercat/references/shared/patterns/common.md'
const SHARED_GLOSSARY = 'skills/tigercat/references/shared/glossary.md'
const DEFAULT_LIMIT = 8

export async function searchTigercat(
  index: SkillIndex,
  input: SearchInput
): Promise<SearchResponse> {
  const query = input.query?.trim()
  if (!query) throw new Error('tigercat_search requires a non-empty query')

  return {
    query,
    framework: input.framework,
    results: findSearchResults(index, query, clampResultLimit(input.limit))
  }
}

export async function getTigercatComponent(
  index: SkillIndex,
  input: ComponentInput
): Promise<ComponentLookupResult> {
  const query = input.component?.trim()
  if (!query) throw new Error('tigercat_component requires a non-empty component')

  const components = resolveComponentQuery(index, query)
  if (components.length === 0) {
    const commandApi = resolveCommandApi(index, query)
    if (commandApi) {
      const sources = await Promise.all(
        commandApi.references.map((path) =>
          readReferenceSource(
            index,
            path,
            `${commandApi.title}; not a public component.`,
            input.maxBytes
          )
        )
      )
      return {
        query,
        found: true,
        matches: [],
        candidates: [],
        commandApi,
        sources
      }
    }

    return {
      query,
      found: false,
      matches: [],
      candidates: findSearchResults(index, query, DEFAULT_LIMIT).filter(
        (result) => result.kind === 'component' || result.kind === 'alias'
      )
    }
  }

  return {
    query,
    found: true,
    matches: await Promise.all(
      components.map((entry) => createComponentRoute(index, entry, input.framework, input.maxBytes))
    ),
    candidates: []
  }
}

export async function routeTigercatTask(
  index: SkillIndex,
  input: RouteTaskInput
): Promise<TaskRouteResult> {
  const task = input.task?.trim()
  if (!task) throw new Error('tigercat_route requires a non-empty task')

  const mentionedComponents = findMentionedComponents(index, task).slice(0, MAX_ROUTE_COMPONENTS)
  const topicMatches = findTopicMatches(index, task).slice(0, MAX_ROUTE_TOPICS)
  const matches = await Promise.all(
    mentionedComponents.map((entry) =>
      createComponentRoute(index, entry, input.framework, input.maxBytes)
    )
  )
  const topics = await Promise.all(
    topicMatches.map((topic) => createTopicRoute(index, topic.slug, input.maxBytes))
  )
  const sources = mergeSources([
    ...matches.flatMap((match) => match.sources),
    ...topics.flatMap((topic) => topic.sources)
  ])

  if (matches.length > 0 || topics.length > 0) {
    return {
      task,
      framework: input.framework,
      intent:
        matches.length > 0 && topics.length > 0
          ? 'mixed'
          : matches.length > 0
            ? 'component'
            : 'topic',
      // 正文只在顶层 sources 内联一次;matches/topics 里保留 path/reason 元数据,
      // 否则同一份 reference 全文会在响应里出现两遍。
      matches: matches.map((match) => ({ ...match, sources: match.sources.map(stripText) })),
      topics: topics.map((topic) => ({ ...topic, sources: topic.sources.map(stripText) })),
      candidates: [],
      sources
    }
  }

  return {
    task,
    framework: input.framework,
    intent: 'unknown',
    matches: [],
    topics: [],
    candidates: findSearchResults(index, task, clampResultLimit(input.limit)),
    sources: [
      await readReferenceSource(
        index,
        SKILL_INDEX,
        'Top-level skill route index for choosing the next reference.',
        input.maxBytes
      )
    ]
  }
}

export async function createComponentRoute(
  index: SkillIndex,
  entry: ComponentMetadata,
  framework?: TigercatFramework,
  maxBytes?: number
): Promise<ComponentRoute> {
  const inlineSpecs = dedupeByPath([
    {
      path: entry.references.props,
      reason: `${entry.name} props, events, methods, and type source.`,
      section: entry.name
    },
    {
      path: entry.references.examples,
      reason: `${entry.name} compact Vue/React example routes.`,
      section: entry.name
    },
    ...(framework
      ? [
          {
            path: entry.references[framework],
            reason: `${framework} binding and import notes.`
          }
        ]
      : [
          { path: entry.references.react, reason: 'React binding and import notes.' },
          { path: entry.references.vue, reason: 'Vue binding and import notes.' }
        ])
  ])

  const sources = await Promise.all(
    inlineSpecs.map((spec) =>
      readReferenceSource(
        index,
        spec.path,
        spec.reason,
        maxBytes,
        'section' in spec ? spec.section : undefined
      )
    )
  )

  // 会话级背景文档只给指针不内联:同一会话多次组件查询不必重复携带
  // 全量清单/术语表/通用模式(此前每次固定 ~22KB)。
  const pointers = [
    {
      path: entry.references.componentIndex,
      reason: 'Full component inventory; read at most once per session via tigercat_reference.'
    },
    {
      path: SHARED_PATTERNS,
      reason:
        'Cross-framework binding differences; read at most once per session via tigercat_reference.'
    },
    {
      path: SHARED_GLOSSARY,
      reason: 'Shared Tigercat terminology; read at most once per session via tigercat_reference.'
    }
  ].map((spec) => createReferencePointer(index, spec.path, spec.reason))

  return {
    component: entry,
    sources: dedupeByPath([...sources, ...pointers])
  }
}

export async function createTopicRoute(
  index: SkillIndex,
  slug: string,
  maxBytes?: number
): Promise<TopicRoute> {
  const topic = index.topics.get(slug)
  if (!topic) throw new Error(`Unknown Tigercat topic: ${slug}`)

  const sources = await Promise.all(
    dedupeByPath(
      topic.references.map((path) => ({
        path,
        reason: `${topic.title} reference.`
      }))
    ).map((spec) => readReferenceSource(index, spec.path, spec.reason, maxBytes))
  )

  return {
    slug,
    title: topic.title,
    sources: dedupeByPath([
      ...sources,
      createReferencePointer(
        index,
        SKILL_INDEX,
        'Top-level skill route index; read via tigercat_reference only if the topic references are insufficient.'
      )
    ])
  }
}

export function getInventory(index: SkillIndex): InventorySummary {
  const categories = new Map<string, { slug: string; name: string; count: number }>()
  for (const component of index.components.values()) {
    const current = categories.get(component.slug) ?? {
      slug: component.slug,
      name: component.category,
      count: 0
    }
    current.count += 1
    categories.set(component.slug, current)
  }

  return {
    componentCount: index.components.size,
    categories: [...categories.values()].sort((a, b) => a.slug.localeCompare(b.slug)),
    aliases: Object.fromEntries(
      [...index.aliasTargetsByNormalizedName.entries()].map(([alias, targets]) => [alias, targets])
    ),
    topics: Object.fromEntries(
      [...index.topics.entries()].map(([slug, topic]) => [
        slug,
        { title: topic.title, keywords: topic.keywords }
      ])
    ),
    components: [...index.components.values()]
  }
}

export function getCategoryComponents(
  index: SkillIndex,
  slugOrCategory: string
): ComponentMetadata[] {
  const normalized = normalizeName(slugOrCategory)
  return [...index.components.values()]
    .filter(
      (component) =>
        normalizeName(component.slug) === normalized ||
        normalizeName(component.category) === normalized
    )
    .sort((a, b) => a.name.localeCompare(b.name))
}

function resolveComponentQuery(index: SkillIndex, query: string): ComponentMetadata[] {
  const normalizedQuery = normalizeName(query)
  const exact = index.componentsByNormalizedName.get(normalizedQuery)
  if (exact) return [exact]

  const aliasTargets = index.aliasTargetsByNormalizedName.get(normalizedQuery)
  if (aliasTargets) return resolveTargetNames(index, aliasTargets)

  const tokens = query
    .split(/[^A-Za-z0-9]+/)
    .map((token) => normalizeName(token))
    .filter(Boolean)
  const matches = tokens.flatMap((token) => {
    const tokenExact = index.componentsByNormalizedName.get(token)
    if (tokenExact) return [tokenExact]
    const tokenAlias = index.aliasTargetsByNormalizedName.get(token)
    return tokenAlias ? resolveTargetNames(index, tokenAlias) : []
  })

  return uniqueComponents(matches)
}

function findMentionedComponents(index: SkillIndex, task: string): ComponentMetadata[] {
  const normalizedTask = normalizeName(task)
  const tokens = asciiTokens(task)
  const tokenSet = adjacentNormalizedTokens(tokens)
  const matches: ComponentMetadata[] = []

  for (const [alias, targets] of index.aliasTargetsByNormalizedName) {
    if (isAsciiAlias(alias)) {
      if (!tokenSet.has(alias)) continue
    } else if (!normalizedTask.includes(alias)) {
      continue
    }
    matches.push(...resolveTargetNames(index, targets))
  }

  for (const [normalizedName, component] of index.componentsByNormalizedName) {
    if (
      tokenSet.has(normalizedName) ||
      (!isAsciiAlias(normalizedName) && normalizedTask.includes(normalizedName))
    ) {
      matches.push(component)
    }
  }

  return dropSubstringMatches(filterSpuriousLayoutHits(task, uniqueComponents(matches))).sort(
    (a, b) => b.name.length - a.name.length
  )
}

function asciiTokens(task: string): string[] {
  return [...task.matchAll(/[A-Za-z][A-Za-z0-9]*/g)].map((match) => match[0])
}

function adjacentNormalizedTokens(tokens: string[], maxParts = 4): Set<string> {
  const normalized = tokens.map((token) => normalizeName(token)).filter(Boolean)
  const out = new Set<string>()
  for (let start = 0; start < normalized.length; start++) {
    let acc = ''
    for (let end = start; end < Math.min(normalized.length, start + maxParts); end++) {
      acc += normalized[end]
      out.add(acc)
    }
  }
  return out
}

function isAsciiAlias(normalized: string): boolean {
  return /^[a-z0-9]+$/.test(normalized)
}

function dropSubstringMatches(components: ComponentMetadata[]): ComponentMetadata[] {
  const names = components.map((component) => normalizeName(component.name))
  return components.filter((component) => {
    const normalized = normalizeName(component.name)
    return !names.some((other) => other !== normalized && other.includes(normalized))
  })
}

function filterSpuriousLayoutHits(task: string, matches: ComponentMetadata[]): ComponentMetadata[] {
  const hasGridAlias = /\bgrid\b/i.test(task) || task.includes('栅格')
  const pascalRow = /(^|[^A-Za-z])Row([^A-Za-z]|$)/.test(task)
  const pascalCol = /(^|[^A-Za-z])Col([^A-Za-z]|$)/.test(task)
  return matches.filter((component) => {
    if (component.name === 'Row') return hasGridAlias || pascalRow
    if (component.name === 'Col') return hasGridAlias || pascalCol
    return true
  })
}

function resolveCommandApi(index: SkillIndex, query: string) {
  const commandApis = index.context7.command_apis
  if (!commandApis) return undefined

  const normalizedQuery = normalizeName(query)
  for (const entry of Object.values(commandApis)) {
    if (normalizeName(entry.name) === normalizedQuery) return entry
  }
  return undefined
}

function findTopicMatches(index: SkillIndex, task: string): Array<{ slug: string; score: number }> {
  const normalizedTask = normalizeName(task)
  const matches: Array<{ slug: string; score: number }> = []

  for (const [slug, topic] of index.topics) {
    let score = 0
    if (normalizedTask.includes(normalizeName(slug))) score += 6
    for (const keyword of topic.keywords) {
      if (keywordMatches(task, normalizedTask, keyword)) score += 4
    }
    if (score > 0) matches.push({ slug, score })
  }

  return matches.sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
}

function findSearchResults(
  index: SkillIndex,
  query: string,
  limit = DEFAULT_LIMIT
): SearchResult[] {
  const normalizedQuery = normalizeName(query)
  if (!normalizedQuery) return []

  const results: SearchResult[] = []

  for (const component of index.components.values()) {
    const normalizedName = normalizeName(component.name)
    let score = 0
    if (normalizedName === normalizedQuery) score += 100
    if (normalizedName.startsWith(normalizedQuery)) score += 70
    if (normalizedName.includes(normalizedQuery) || normalizedQuery.includes(normalizedName)) {
      score += 45
    }
    if (
      normalizeName(component.category) === normalizedQuery ||
      component.slug === normalizedQuery
    ) {
      score += 35
    }
    if (component.aliases.some((alias) => normalizeName(alias).includes(normalizedQuery))) {
      score += 35
    }
    if (score > 0) {
      results.push({
        kind: 'component',
        name: component.name,
        score,
        reason: `${component.category} component`,
        component
      })
    }
  }

  for (const [alias, targets] of index.aliasTargetsByNormalizedName) {
    if (!alias.includes(normalizedQuery) && !normalizedQuery.includes(alias)) continue
    const components = resolveTargetNames(index, targets)
    results.push({
      kind: 'alias',
      name: alias,
      score: alias === normalizedQuery ? 95 : 55,
      reason: `Alias for ${targets.join(', ')}`,
      components
    })
  }

  for (const category of getInventory(index).categories) {
    const normalizedCategory = normalizeName(category.name)
    if (!normalizedCategory.includes(normalizedQuery) && !category.slug.includes(normalizedQuery)) {
      continue
    }
    results.push({
      kind: 'category',
      name: category.slug,
      score: category.slug === normalizedQuery ? 80 : 40,
      reason: `${category.count} ${category.name} components`,
      components: getCategoryComponents(index, category.slug)
    })
  }

  for (const topic of findTopicMatches(index, query)) {
    const metadata = index.topics.get(topic.slug)
    if (!metadata) continue
    results.push({
      kind: topic.slug === 'commandApis' ? 'command' : 'topic',
      name: topic.slug,
      score: topic.score,
      reason: metadata.title,
      topic: topic.slug
    })
  }

  return results
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, Math.max(1, Math.floor(limit)))
}

function resolveTargetNames(index: SkillIndex, names: string[]): ComponentMetadata[] {
  const components = names.flatMap((name) => {
    const component = index.components.get(name)
    return component ? [component] : []
  })
  return uniqueComponents(components)
}

function uniqueComponents(components: ComponentMetadata[]): ComponentMetadata[] {
  const seen = new Set<string>()
  const result: ComponentMetadata[] = []
  for (const component of components) {
    if (seen.has(component.name)) continue
    seen.add(component.name)
    result.push(component)
  }
  return result
}

// 去重键含 section:同分类两个组件的 props 指向同一文件的不同小节,只按 path
// 去重会把后一个组件的小节丢掉。
function dedupeByPath<T extends { path: string; section?: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  const result: T[] = []

  for (const item of items) {
    const key = `${item.path}#${item.section ?? ''}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push(item)
  }

  return result
}

function mergeSources(sources: ReferenceSource[]): ReferenceSource[] {
  return dedupeByPath(sources)
}

function stripText(source: ReferenceSource): ReferenceSource {
  const { text: _text, ...rest } = source
  return rest
}

function keywordMatches(task: string, normalizedTask: string, keyword: string): boolean {
  const normalizedKeyword = normalizeName(keyword)
  if (!normalizedKeyword) return false
  if (/^[a-z0-9]+$/.test(normalizedKeyword)) {
    return new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedKeyword)}([^a-z0-9]|$)`, 'i').test(task)
  }
  if (normalizedKeyword.length < 2) return false
  return normalizedTask.includes(normalizedKeyword)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
