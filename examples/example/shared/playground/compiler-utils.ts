import type { Loader, Message } from 'esbuild-wasm'
import type { DemoDiagnostic } from './types'

const ALLOWED_IMPORTS = [
  'react',
  'react/',
  'react-dom/',
  'vue',
  '@expcat/tigercat-core',
  '@expcat/tigercat-react',
  '@expcat/tigercat-vue',
  '@demo-shared/',
  '@demo-runtime/'
]

export function normalizeDemoPath(value: string): string {
  const segments: string[] = []
  for (const segment of value.replace(/\\/g, '/').split('/')) {
    if (!segment || segment === '.') continue
    if (segment === '..') segments.pop()
    else segments.push(segment)
  }
  return `/${segments.join('/')}`
}

export function isBareImport(value: string): boolean {
  return !value.startsWith('.') && !value.startsWith('/')
}

export function isAllowedImport(value: string): boolean {
  return ALLOWED_IMPORTS.some((prefix) => value === prefix || value.startsWith(prefix))
}

export function resolveDemoFile(
  files: Record<string, string>,
  importer: string,
  requested: string
): string | null {
  const base = importer.slice(0, importer.lastIndexOf('/') + 1)
  const candidate = normalizeDemoPath(requested.startsWith('/') ? requested : `${base}${requested}`)
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.vue', '.json', '.css']
  for (const extension of extensions) {
    const path = `${candidate}${extension}`
    if (path in files) return path
  }
  for (const extension of extensions.slice(1)) {
    const path = `${candidate}/index${extension}`
    if (path in files) return path
  }
  return null
}

export function loaderForFile(path: string): Loader {
  if (path.endsWith('.tsx')) return 'tsx'
  if (path.endsWith('.ts')) return 'ts'
  if (path.endsWith('.jsx')) return 'jsx'
  if (path.endsWith('.json')) return 'json'
  if (path.endsWith('.css')) return 'css'
  return 'js'
}

export function toDiagnostics(messages: Message[]): DemoDiagnostic[] {
  return messages.map((message) => ({
    text: message.text,
    file: message.location?.file,
    line: message.location?.line,
    column: message.location ? message.location.column + 1 : undefined
  }))
}
