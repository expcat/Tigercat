export type TigercatFramework = 'react' | 'vue'

export interface TigercatMcpOptions {
  /** 本地 Tigercat 仓库根目录;提供时优先于 baseUrl,走文件系统读取。 */
  root?: string
  /** 远程 skills 基地址(GitHub Pages /mcp/ 路由或其镜像);缺省用官方地址。 */
  baseUrl?: string
  /** 远程 fetch 超时毫秒数。 */
  timeoutMs?: number
}

export type LoadSkillIndexOptions = TigercatMcpOptions

export interface SkillSource {
  readonly kind: 'fs' | 'http'
  /** fs: 绝对仓库根目录;http: 规范化(以 / 结尾)的 base URL。 */
  readonly origin: string
  /** 读取 origin 下 repo-relative 路径的 UTF-8 文本;path 需已经 normalizeRelativePath。 */
  readText(path: string): Promise<string>
  /** doctor 可读性探测,不可读时抛错。 */
  probe(path: string): Promise<void>
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
  /** 全部 skill markdown 的仓库相对路径清单(远程模式的 allow-list 契约)。 */
  skill_files?: string[]
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
  /** fs: 绝对仓库根目录;http: base URL。与 source.origin 一致,兼容既有读者。 */
  root: string
  source: SkillSource
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
  mode: 'fs' | 'http'
  componentCount: number
  aliasCount: number
  topicCount: number
  readableReferenceCount: number
  /** http 模式下 best-effort 读取的远程 version.json 版本。 */
  remoteVersion?: string
  issues: string[]
}
