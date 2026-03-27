/**
 * CodeEditor component utilities
 * Shared styles and helpers for CodeEditor components
 *
 * Zero-dependency syntax highlighting using simple regex-based tokenization.
 * Not a full parser — provides basic keyword/string/comment/number highlighting.
 */

import type { CodeLanguage, CodeEditorTheme } from '../types/code-editor'

// ─── Style Constants ────────────────────────────────────────────────

export const codeEditorBaseClasses =
  'relative font-mono text-sm leading-relaxed border rounded overflow-hidden'

export const codeEditorLightClasses = 'bg-white border-gray-200 text-gray-900'

export const codeEditorDarkClasses = 'bg-gray-900 border-gray-700 text-gray-100'

export const codeEditorDisabledClasses = 'opacity-60 cursor-not-allowed'

export const codeEditorTextareaClasses =
  'absolute inset-0 w-full h-full resize-none outline-none bg-transparent text-transparent caret-current p-3 font-mono text-sm leading-relaxed whitespace-pre overflow-auto'

export const codeEditorHighlightClasses =
  'p-3 font-mono text-sm leading-relaxed whitespace-pre overflow-auto pointer-events-none'

export const codeEditorLineNumberClasses =
  'select-none text-right pr-3 pl-2 border-r min-w-[3rem] flex-shrink-0'

export const codeEditorLineNumberLightClasses = 'bg-gray-50 border-gray-200 text-gray-400'

export const codeEditorLineNumberDarkClasses = 'bg-gray-800 border-gray-700 text-gray-500'

// ─── Token Types & Highlighting ─────────────────────────────────────

export type TokenType = 'keyword' | 'string' | 'comment' | 'number' | 'punctuation' | 'plain'

export interface Token {
  type: TokenType
  value: string
}

/**
 * CSS classes for token types (light theme)
 */
export const tokenClassesLight: Record<TokenType, string> = {
  keyword: 'text-purple-600 font-semibold',
  string: 'text-green-600',
  comment: 'text-gray-400 italic',
  number: 'text-blue-600',
  punctuation: 'text-gray-500',
  plain: ''
}

/**
 * CSS classes for token types (dark theme)
 */
export const tokenClassesDark: Record<TokenType, string> = {
  keyword: 'text-purple-400 font-semibold',
  string: 'text-green-400',
  comment: 'text-gray-500 italic',
  number: 'text-blue-400',
  punctuation: 'text-gray-400',
  plain: ''
}

/**
 * Language keywords map
 */
const languageKeywords: Record<string, Set<string>> = {
  javascript: new Set([
    'const',
    'let',
    'var',
    'function',
    'return',
    'if',
    'else',
    'for',
    'while',
    'do',
    'switch',
    'case',
    'break',
    'continue',
    'new',
    'this',
    'class',
    'extends',
    'import',
    'export',
    'default',
    'from',
    'async',
    'await',
    'try',
    'catch',
    'finally',
    'throw',
    'typeof',
    'instanceof',
    'true',
    'false',
    'null',
    'undefined',
    'void',
    'delete',
    'in',
    'of',
    'yield',
    'static',
    'super',
    'with',
    'debugger'
  ]),
  typescript: new Set([
    'const',
    'let',
    'var',
    'function',
    'return',
    'if',
    'else',
    'for',
    'while',
    'do',
    'switch',
    'case',
    'break',
    'continue',
    'new',
    'this',
    'class',
    'extends',
    'import',
    'export',
    'default',
    'from',
    'async',
    'await',
    'try',
    'catch',
    'finally',
    'throw',
    'typeof',
    'instanceof',
    'true',
    'false',
    'null',
    'undefined',
    'void',
    'delete',
    'in',
    'of',
    'type',
    'interface',
    'enum',
    'namespace',
    'module',
    'declare',
    'implements',
    'abstract',
    'as',
    'is',
    'keyof',
    'readonly',
    'private',
    'protected',
    'public',
    'static',
    'super',
    'never',
    'any',
    'unknown',
    'string',
    'number',
    'boolean',
    'object',
    'symbol',
    'bigint'
  ]),
  python: new Set([
    'def',
    'class',
    'return',
    'if',
    'elif',
    'else',
    'for',
    'while',
    'break',
    'continue',
    'import',
    'from',
    'as',
    'try',
    'except',
    'finally',
    'raise',
    'with',
    'yield',
    'lambda',
    'pass',
    'del',
    'True',
    'False',
    'None',
    'and',
    'or',
    'not',
    'is',
    'in',
    'global',
    'nonlocal',
    'assert',
    'async',
    'await'
  ]),
  html: new Set([]),
  css: new Set([]),
  json: new Set(['true', 'false', 'null']),
  markdown: new Set([]),
  plain: new Set([])
}

/**
 * Simple regex-based tokenizer for a line of code.
 * Not a full parser — handles basic highlighting patterns.
 */
export function tokenizeLine(line: string, language: CodeLanguage): Token[] {
  if (
    language === 'plain' ||
    language === 'markdown' ||
    language === 'html' ||
    language === 'css'
  ) {
    return [{ type: 'plain', value: line }]
  }

  const tokens: Token[] = []
  const keywords = languageKeywords[language] || new Set()
  let i = 0

  while (i < line.length) {
    // Single-line comment
    if (line[i] === '/' && line[i + 1] === '/') {
      tokens.push({ type: 'comment', value: line.slice(i) })
      break
    }

    // Python comment
    if (language === 'python' && line[i] === '#') {
      tokens.push({ type: 'comment', value: line.slice(i) })
      break
    }

    // Strings
    if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
      const quote = line[i]
      let j = i + 1
      while (j < line.length && line[j] !== quote) {
        if (line[j] === '\\') j++ // skip escaped
        j++
      }
      j++ // include closing quote
      tokens.push({ type: 'string', value: line.slice(i, j) })
      i = j
      continue
    }

    // Numbers
    if (/\d/.test(line[i]) && (i === 0 || /[^a-zA-Z_$]/.test(line[i - 1]))) {
      let j = i
      while (j < line.length && /[\d.xXa-fA-FoObBn_]/.test(line[j])) j++
      tokens.push({ type: 'number', value: line.slice(i, j) })
      i = j
      continue
    }

    // Words (potential keywords)
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i
      while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) j++
      const word = line.slice(i, j)
      tokens.push({
        type: keywords.has(word) ? 'keyword' : 'plain',
        value: word
      })
      i = j
      continue
    }

    // Punctuation
    if (/[{}()[\];,.<>:=+\-*/%!&|^~?@]/.test(line[i])) {
      tokens.push({ type: 'punctuation', value: line[i] })
      i++
      continue
    }

    // Whitespace and other
    let j = i
    while (j < line.length && !/[a-zA-Z0-9_$"'`/{}()[\];,.<>:=+\-*/%!&|^~?@#]/.test(line[j])) {
      j++
    }
    if (j === i) j = i + 1
    tokens.push({ type: 'plain', value: line.slice(i, j) })
    i = j
  }

  return tokens
}

/**
 * Get token CSS classes by theme
 */
export function getTokenClasses(type: TokenType, theme: CodeEditorTheme): string {
  return theme === 'dark' ? tokenClassesDark[type] : tokenClassesLight[type]
}

/**
 * Get container classes for the code editor
 */
export function getCodeEditorContainerClasses(
  theme: CodeEditorTheme,
  disabled: boolean,
  className?: string
): string {
  const classes = [
    codeEditorBaseClasses,
    theme === 'dark' ? codeEditorDarkClasses : codeEditorLightClasses
  ]
  if (disabled) classes.push(codeEditorDisabledClasses)
  if (className) classes.push(className)
  return classes.join(' ')
}

/**
 * Get line number gutter classes
 */
export function getLineNumberClasses(theme: CodeEditorTheme): string {
  return [
    codeEditorLineNumberClasses,
    theme === 'dark' ? codeEditorLineNumberDarkClasses : codeEditorLineNumberLightClasses
  ].join(' ')
}

/**
 * Count lines in code
 */
export function countLines(code: string): number {
  if (!code) return 1
  return code.split('\n').length
}

/**
 * Generate line numbers array
 */
export function generateLineNumbers(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i + 1)
}

/**
 * Handle Tab key in textarea — insert spaces instead of tab
 */
export function handleTabKey(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  tabSize: number
): { value: string; selectionStart: number } {
  const spaces = ' '.repeat(tabSize)
  const before = value.slice(0, selectionStart)
  const after = value.slice(selectionEnd)
  return {
    value: before + spaces + after,
    selectionStart: selectionStart + tabSize
  }
}
