import { transform, type Transform } from 'sucrase'
import { init, parse } from 'es-module-lexer'
import type { DemoDiagnostic, DemoSourceBundle } from './types'

const ALLOWED_IMPORTS = [
  'react',
  'react/',
  'react-dom/',
  'vue',
  '@expcat/tigercat-core',
  '@expcat/tigercat-react',
  '@expcat/tigercat-vue',
  '@demo-shared/',
  '@demo-runtime/',
  '@demo-file/'
]

export const DEMO_FILE_PREFIX = '@demo-file'

export function isBareImport(value: string): boolean {
  return !value.startsWith('.') && !value.startsWith('/')
}

export function isAllowedImport(value: string): boolean {
  return ALLOWED_IMPORTS.some((prefix) => value === prefix || value.startsWith(prefix))
}

export function demoFileSpecifier(filename: string): string {
  return `${DEMO_FILE_PREFIX}${filename.startsWith('/') ? filename : `/${filename}`}`
}

export function transformModule(
  source: string,
  options: { filename: string; jsx: boolean }
): string {
  const transforms: Transform[] = ['typescript']
  if (options.jsx) transforms.push('jsx')
  return transform(source, {
    transforms,
    jsxRuntime: 'automatic',
    production: true,
    filePath: options.filename
  }).code
}

function normalizePath(from: string, specifier: string): string {
  const fromDir = from.slice(0, from.lastIndexOf('/')) || ''
  const joined = `${fromDir}/${specifier}`
  const parts: string[] = []
  for (const part of joined.split('/')) {
    if (!part || part === '.') continue
    if (part === '..') parts.pop()
    else parts.push(part)
  }
  return `/${parts.join('/')}`
}

export function resolveBundleFile(
  files: Record<string, string>,
  candidate: string
): string | undefined {
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.vue', '.json', '.css']
  for (const extension of extensions) {
    if (files[candidate + extension] !== undefined) return candidate + extension
  }
  for (const extension of ['.ts', '.tsx', '.js', '.jsx', '.vue']) {
    const indexPath = `${candidate}/index${extension}`
    if (files[indexPath] !== undefined) return indexPath
  }
  return undefined
}

async function rewriteRelativeImports(
  filename: string,
  code: string,
  files: Record<string, string>
): Promise<{ code: string; imports: string[] }> {
  await init
  const [records] = parse(code)
  const imports = new Set<string>()
  let next = code
  for (const record of [...records].reverse()) {
    const specifier = record.n
    if (!specifier || record.s == null || record.e == null) continue
    if (isBareImport(specifier)) {
      if (!isAllowedImport(specifier)) {
        throw new Error(`不允许导入外部模块：${specifier}`)
      }
      imports.add(specifier)
      continue
    }
    const resolved = resolveBundleFile(files, normalizePath(filename, specifier))
    if (!resolved) throw new Error(`找不到示例文件：${specifier}`)
    const mapped = demoFileSpecifier(resolved)
    next = `${next.slice(0, record.s)}${mapped}${next.slice(record.e)}`
  }
  return { code: next, imports: [...imports] }
}

export interface CompileDemoBundleResult {
  js: string
  css: string
  imports: string[]
  modules: Record<string, string>
}

export async function compileDemoBundle(options: {
  bundle: DemoSourceBundle
  compileFile: (filename: string, source: string) => { code: string; css: string }
}): Promise<CompileDemoBundleResult> {
  const { bundle, compileFile } = options
  const compiled: Record<string, string> = {}
  const cssParts: string[] = []

  for (const [filename, source] of Object.entries(bundle.files)) {
    if (filename.endsWith('.css')) {
      cssParts.push(source)
      compiled[filename] = 'export {}\n'
      continue
    }
    if (filename.endsWith('.json')) {
      compiled[filename] = `export default ${source}`
      continue
    }
    const result = compileFile(filename, source)
    compiled[filename] = result.code
    if (result.css) cssParts.push(result.css)
  }

  const modules: Record<string, string> = {}
  const bareImports = new Set<string>()
  for (const [filename, code] of Object.entries(compiled)) {
    const rewritten = await rewriteRelativeImports(filename, code, bundle.files)
    modules[demoFileSpecifier(filename)] = rewritten.code
    for (const specifier of rewritten.imports) bareImports.add(specifier)
  }

  const entry = demoFileSpecifier(bundle.entry)
  const js = modules[entry]
  if (js === undefined) throw new Error(`找不到示例入口：${bundle.entry}`)

  return {
    js,
    css: cssParts.join('\n'),
    imports: [...bareImports].sort(),
    modules
  }
}

export async function scanImports(code: string): Promise<string[]> {
  await init
  const [records] = parse(code)
  const imports = new Set<string>()
  for (const record of records) {
    const specifier = record.n
    if (!specifier) continue
    if (!isBareImport(specifier)) {
      throw new Error(`找不到示例文件：${specifier}`)
    }
    if (!isAllowedImport(specifier)) {
      throw new Error(`不允许导入外部模块：${specifier}`)
    }
    imports.add(specifier)
  }
  return [...imports].sort()
}

export function toDiagnostic(error: unknown): DemoDiagnostic {
  if (error instanceof Error) {
    const match = /\((\d+):(\d+)\)/.exec(error.message)
    if (match) {
      return { text: error.message, line: Number(match[1]), column: Number(match[2]) + 1 }
    }
    return { text: error.message }
  }
  return { text: String(error) }
}
