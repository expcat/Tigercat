import { transform, type Transform } from 'sucrase'
import { init, parse } from 'es-module-lexer'
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

export function isBareImport(value: string): boolean {
  return !value.startsWith('.') && !value.startsWith('/')
}

export function isAllowedImport(value: string): boolean {
  return ALLOWED_IMPORTS.some((prefix) => value === prefix || value.startsWith(prefix))
}

// Transpile a single example file to browser-ready ESM. TypeScript types are
// erased and (for React) JSX is lowered against the automatic runtime, matching
// the importmap's `react/jsx-runtime` entry. No bundling: examples are single
// files whose bare imports are served by the sandbox importmap.
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

// Collect the bare module specifiers referenced by transpiled example code and
// enforce the import allow-list. Relative specifiers are rejected because every
// example is a single file (see the playground compiler proposal, §5).
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
    // sucrase embeds the offending position as "(line:column)" in its message.
    const match = /\((\d+):(\d+)\)/.exec(error.message)
    if (match) {
      return { text: error.message, line: Number(match[1]), column: Number(match[2]) + 1 }
    }
    return { text: error.message }
  }
  return { text: String(error) }
}
