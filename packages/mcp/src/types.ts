export type TigercatFramework = 'react' | 'vue'

export interface TigercatMcpOptions {
  root?: string
}

export interface ReferenceSource {
  path: string
  reason: string
  truncated: boolean
  text?: string
}

export interface ComponentReferences {
  componentIndex: string
  props: string
  examples: string
  react: string
  vue: string
}

export interface ComponentMetadata {
  name: string
  aliases: string[]
  category: string
  slug: string
  testGroup: string
  packageSubpath: string
  packageTarget: string
  typeSource: string
  sourceFiles: string[]
  propsInterfaces: string[]
  frameworks: TigercatFramework[]
  references: ComponentReferences
}

export interface TopicMetadata {
  title: string
  references: string[]
  keywords: string[]
}

export interface CommandApiMetadata {
  name: string
  title: string
  topic: string
  references: string[]
}

export interface TigercatContext7 {
  url?: string
  public_key?: string
  generated_by?: string
  component_count?: number
  reference_paths?: Record<string, unknown>
  aliases?: Record<string, string | string[]>
  command_apis?: Record<string, CommandApiMetadata>
  topics?: Record<string, TopicMetadata>
  components?: Record<string, ComponentMetadata>
  component_index?: Record<
    string,
    {
      props: string
      vue: string
      react: string
      components: string[]
      examples: string
    }
  >
}

export interface SkillIndex {
  root: string
  context7: TigercatContext7
  components: Map<string, ComponentMetadata>
  componentsByNormalizedName: Map<string, ComponentMetadata>
  aliasTargetsByNormalizedName: Map<string, string[]>
  topics: Map<string, TopicMetadata>
  allowedReferencePaths: Set<string>
}

export interface ComponentRoute {
  component: ComponentMetadata
  sources: ReferenceSource[]
}

export interface ComponentLookupResult {
  query: string
  found: boolean
  matches: ComponentRoute[]
  candidates: SearchResult[]
}

export interface SearchResult {
  kind: 'component' | 'alias' | 'category' | 'topic' | 'command'
  name: string
  score: number
  reason: string
  component?: ComponentMetadata
  components?: ComponentMetadata[]
  topic?: string
}

export interface SearchResponse {
  query: string
  framework?: TigercatFramework
  results: SearchResult[]
}

export interface TopicRoute {
  slug: string
  title: string
  sources: ReferenceSource[]
}

export interface TaskRouteResult {
  task: string
  framework?: TigercatFramework
  intent: 'component' | 'topic' | 'mixed' | 'unknown'
  matches: ComponentRoute[]
  topics: TopicRoute[]
  candidates: SearchResult[]
  sources: ReferenceSource[]
}

export interface InventorySummary {
  componentCount: number
  categories: Array<{ slug: string; name: string; count: number }>
  aliases: Record<string, string[]>
  topics: Record<string, { title: string; keywords: string[] }>
  components: ComponentMetadata[]
}

export interface DoctorResult {
  ok: boolean
  root: string
  componentCount: number
  aliasCount: number
  topicCount: number
  readableReferenceCount: number
  issues: string[]
}
