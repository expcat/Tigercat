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

export interface ComponentRoute {
  category: string
  component: string
  sources: ReferenceSource[]
}

export interface ComponentLookupResult {
  found: boolean
  matches: ComponentRoute[]
  candidates: string[]
}

export interface TaskRouteResult {
  task: string
  framework?: TigercatFramework
  intent: 'component' | 'topic' | 'unknown'
  matches: ComponentRoute[]
  candidates: string[]
  sources: ReferenceSource[]
}

export interface SkillIndex {
  root: string
  context7: TigercatContext7
  components: Map<string, ComponentEntry>
  componentsByNormalizedName: Map<string, ComponentEntry>
  allowedReferencePaths: Set<string>
}

export interface ComponentEntry {
  name: string
  category: string
  slug: string
  props: string
  examples: string
  react: string
  vue: string
}

export interface TigercatContext7 {
  url?: string
  public_key?: string
  reference_paths?: Record<string, unknown>
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
