export type DemoFramework = 'react' | 'vue'

export type DemoSandboxPermission = 'downloads' | 'modals' | 'popups' | 'fullscreen'

export interface DemoViewport {
  mode?: 'auto' | 'fixed'
  height?: number
  minHeight?: number
  maxHeight?: number
}

export interface DemoModuleMeta {
  id: string
  title: string
  description?: string
  entry: string
  order: number
  viewport?: DemoViewport
  permissions?: DemoSandboxPermission[]
}

export interface DemoSourceBundle {
  entry: string
  files: Record<string, string>
  sourceHash: string
}

export interface DemoModuleDescriptor {
  framework: DemoFramework
  route: string
  meta: DemoModuleMeta
  loadSource: () => Promise<DemoSourceBundle>
}

export interface DemoDiagnostic {
  text: string
  file?: string
  line?: number
  column?: number
}

export interface DemoCompileRequest {
  type: 'compile'
  requestId: number
  bundle: DemoSourceBundle
}

export interface DemoCompileSuccess {
  type: 'compiled'
  requestId: number
  js: string
  css: string
  imports: string[]
}

export interface DemoCompileFailure {
  type: 'compile-error'
  requestId: number
  diagnostics: DemoDiagnostic[]
}

export type DemoCompileResponse = DemoCompileSuccess | DemoCompileFailure

export interface DemoRuntimeUrls {
  framework: string
  renderer?: string
  jsxRuntime?: string
  tigercat: string
  core: string
  shared: string
  context?: string
  tailwind: string
}

export interface DemoSandboxEvent {
  channelId: string
  type: 'ready' | 'resize' | 'console' | 'runtime-error'
  height?: number
  level?: 'log' | 'info' | 'warn' | 'error'
  message?: string
}
