import type {
  ComponentEntry,
  ComponentLookupResult,
  ComponentRoute,
  ReferenceSource,
  SkillIndex,
  TaskRouteResult,
  TigercatFramework
} from './types'
import { normalizeName, readReferenceSource } from './skill-index'

interface RouteTaskInput {
  task: string
  framework?: TigercatFramework
  maxBytes?: number
}

interface LookupComponentInput {
  component: string
  framework?: TigercatFramework
  task?: string
  maxBytes?: number
}

const SHARED_PATTERNS = 'skills/tigercat/references/shared/patterns/common.md'
const SHARED_GLOSSARY = 'skills/tigercat/references/shared/glossary.md'
const COMPONENT_INDEX = 'skills/tigercat/references/component-index.md'
const SKILL_INDEX = 'skills/tigercat/SKILL.md'

const TOPIC_ROUTES: Array<{ path: string; reason: string; keywords: string[] }> = [
  {
    path: 'skills/tigercat/references/getting-started.md',
    reason: 'Setup and installation guidance.',
    keywords: ['setup', 'install', 'gettingstarted', 'start', 'quickstart', '安装', '开始']
  },
  {
    path: 'skills/tigercat/references/cli.md',
    reason: 'Tigercat CLI commands and scaffolding.',
    keywords: ['cli', 'command', 'scaffold', 'generate', '命令', '脚手架']
  },
  {
    path: 'skills/tigercat/references/theme.md',
    reason: 'Theme, dark mode, and CSS variable guidance.',
    keywords: ['theme', 'dark', 'mode', 'color', '主题', '暗色', '颜色']
  },
  {
    path: 'skills/tigercat/references/i18n.md',
    reason: 'Locale, labels, and cross-framework i18n guidance.',
    keywords: ['i18n', 'locale', 'language', 'translation', '国际化', '语言', '文案']
  },
  {
    path: 'skills/tigercat/references/ssr.md',
    reason: 'SSR and framework integration guidance.',
    keywords: ['ssr', 'serverrender', 'nuxt', 'next', 'hydration', '服务端']
  },
  {
    path: 'skills/tigercat/references/accessibility.md',
    reason: 'Accessibility and ARIA guidance.',
    keywords: ['a11y', 'accessibility', 'aria', 'keyboard', '无障碍', '键盘']
  },
  {
    path: 'skills/tigercat/references/performance.md',
    reason: 'Performance and bundle-size guidance.',
    keywords: ['performance', 'perf', 'bundle', 'size', 'lazy', '性能', '体积']
  },
  {
    path: 'skills/tigercat/references/release.md',
    reason: 'Maintainer release and verification guidance.',
    keywords: ['release', 'publish', 'rc', 'version', '发布', '版本']
  },
  {
    path: 'skills/tigercat/references/tokens.md',
    reason: 'Design token guidance.',
    keywords: ['token', 'tokens', 'design', 'figma', '变量']
  },
  {
    path: 'skills/tigercat/references/recipes/building-apps.md',
    reason: 'Application shell, routing, theme, and i18n recipe.',
    keywords: ['app', 'shell', 'routing', 'route', 'layout', '应用', '路由', '布局']
  }
]

export async function routeTigercatTask(
  index: SkillIndex,
  input: RouteTaskInput
): Promise<TaskRouteResult> {
  const task = input.task?.trim()
  if (!task) {
    throw new Error('tigercat_route_task requires a non-empty task')
  }

  const exactMatches = findExactComponents(index, task)
  if (exactMatches.length > 0) {
    const matches = await Promise.all(
      exactMatches.map((entry) =>
        createComponentRoute(index, entry, input.framework, input.maxBytes)
      )
    )
    return {
      task,
      framework: input.framework,
      intent: 'component',
      matches,
      candidates: [],
      sources: mergeSources(matches.flatMap((match) => match.sources))
    }
  }

  const topicSources = await routeTopicSources(index, task, input.maxBytes)
  if (topicSources.length > 0) {
    return {
      task,
      framework: input.framework,
      intent: 'topic',
      matches: [],
      candidates: findComponentCandidates(index, task),
      sources: topicSources
    }
  }

  return {
    task,
    framework: input.framework,
    intent: 'unknown',
    matches: [],
    candidates: findComponentCandidates(index, task),
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

export async function lookupTigercatComponent(
  index: SkillIndex,
  input: LookupComponentInput
): Promise<ComponentLookupResult> {
  const component = input.component?.trim()
  if (!component) {
    throw new Error('tigercat_lookup_component requires a non-empty component')
  }

  const matches = findExactComponents(index, component)
  if (matches.length === 0) {
    return {
      found: false,
      matches: [],
      candidates: findComponentCandidates(index, component)
    }
  }

  return {
    found: true,
    matches: await Promise.all(
      matches.map((entry) => createComponentRoute(index, entry, input.framework, input.maxBytes))
    ),
    candidates: []
  }
}

export async function createComponentRoute(
  index: SkillIndex,
  entry: ComponentEntry,
  framework?: TigercatFramework,
  maxBytes?: number
): Promise<ComponentRoute> {
  const sourceSpecs = [
    { path: COMPONENT_INDEX, reason: 'Canonical component category and package subpath map.' },
    { path: entry.props, reason: `${entry.name} props, events, methods, and type source.` },
    { path: entry.examples, reason: `${entry.name} compact Vue/React example routes.` },
    ...(framework
      ? [
          {
            path: framework === 'react' ? entry.react : entry.vue,
            reason: `${framework} binding and import notes.`
          }
        ]
      : [
          { path: entry.react, reason: 'React binding and import notes.' },
          { path: entry.vue, reason: 'Vue binding and import notes.' }
        ]),
    { path: SHARED_PATTERNS, reason: 'Cross-framework binding differences and common patterns.' },
    { path: SHARED_GLOSSARY, reason: 'Shared Tigercat terminology.' }
  ]

  const sources = await Promise.all(
    dedupeByPath(sourceSpecs).map((spec) =>
      readReferenceSource(index, spec.path, spec.reason, maxBytes)
    )
  )

  return {
    category: entry.category,
    component: entry.name,
    sources
  }
}

function findExactComponents(index: SkillIndex, query: string): ComponentEntry[] {
  const normalizedQuery = normalizeName(query)
  const matches = new Map<string, ComponentEntry>()

  for (const [normalizedName, entry] of index.componentsByNormalizedName) {
    if (normalizedQuery.includes(normalizedName)) {
      matches.set(entry.name, entry)
    }
  }

  if (matches.size === 0) {
    const exact = index.componentsByNormalizedName.get(normalizedQuery)
    if (exact) matches.set(exact.name, exact)
  }

  return [...matches.values()].sort((a, b) => b.name.length - a.name.length)
}

function findComponentCandidates(index: SkillIndex, query: string): string[] {
  const normalizedQuery = normalizeName(query)
  if (!normalizedQuery) return []

  const scored = [...index.components.values()]
    .map((entry) => {
      const normalizedName = normalizeName(entry.name)
      let score = 0
      if (normalizedName.startsWith(normalizedQuery)) score += 4
      if (normalizedName.includes(normalizedQuery)) score += 3
      if (normalizedQuery.includes(normalizedName.slice(0, Math.min(5, normalizedName.length)))) {
        score += 1
      }
      return { entry, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))

  return scored.slice(0, 5).map((item) => item.entry.name)
}

async function routeTopicSources(
  index: SkillIndex,
  task: string,
  maxBytes?: number
): Promise<ReferenceSource[]> {
  const normalizedTask = normalizeName(task)
  const matches = TOPIC_ROUTES.filter((route) =>
    route.keywords.some((keyword) => keywordMatches(task, normalizedTask, keyword))
  )

  if (matches.length === 0) return []

  return Promise.all(
    dedupeByPath([{ path: SKILL_INDEX, reason: 'Top-level skill route index.' }, ...matches]).map(
      (route) => readReferenceSource(index, route.path, route.reason, maxBytes)
    )
  )
}

function dedupeByPath<T extends { path: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  const result: T[] = []

  for (const item of items) {
    if (seen.has(item.path)) continue
    seen.add(item.path)
    result.push(item)
  }

  return result
}

function mergeSources(sources: ReferenceSource[]): ReferenceSource[] {
  return dedupeByPath(sources)
}

function keywordMatches(task: string, normalizedTask: string, keyword: string): boolean {
  const normalizedKeyword = normalizeName(keyword)
  if (normalizedKeyword) return normalizedTask.includes(normalizedKeyword)
  return task.toLowerCase().includes(keyword.toLowerCase())
}
