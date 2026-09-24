/**
 * CodeEditor component utilities
 * Shared styles and helpers for CodeEditor components
 *
 * Zero-dependency syntax highlighting using simple regex-based tokenization.
 * Not a full parser — provides basic keyword/string/comment/number highlighting.
 */

import type {
  CodeHighlighter,
  CodeLanguage,
  CodeEditorTheme,
  HighlightToken
} from '../types/code-editor'
import { isBrowser } from './env'

export const CODE_EDITOR_LINE_HEIGHT_REM = 1.625
export const CODE_EDITOR_PADDING_Y_REM = 1.5

// ─── Style Constants ────────────────────────────────────────────────

export const codeEditorBaseClasses =
  'relative flex min-h-0 flex-col font-mono text-sm leading-[1.625rem] border rounded'

/** Shared chrome. Dark follows semantic tokens; the host does not get hex colors. */
export const codeEditorChromeClasses =
  'bg-[var(--tiger-surface)] border-[var(--tiger-border)] text-[var(--tiger-text)]'

export const codeEditorDisabledClasses = 'opacity-60 cursor-not-allowed'

/** The only scrollport. `maxLines` and a parent height constrain this box. */
export const codeEditorScrollerClasses = 'relative min-h-0 flex-1 overflow-auto'

export const codeEditorTextareaClasses =
  'absolute inset-0 w-full h-full resize-none outline-none bg-transparent text-transparent caret-[var(--tiger-text)] p-3 font-mono text-sm leading-[1.625rem] overflow-hidden placeholder:text-[var(--tiger-text-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--tiger-primary)]'

export const codeEditorHighlightClasses =
  'p-3 font-mono text-sm leading-[1.625rem] pointer-events-none'

export const codeEditorLineNumberClasses =
  'sticky start-0 z-[1] box-border select-none self-stretch text-end pe-3 ps-2 border-e min-w-[3rem] text-[var(--tiger-text-secondary)] bg-[var(--tiger-surface-muted)] border-[var(--tiger-border)]'

/** Active-line marker. It does not retokenize the document. */
export const codeEditorActiveLineClasses = 'bg-[var(--tiger-surface-muted)]'

/**
 * Background class for the active (caret) line, or '' when no highlight applies.
 */
export function getCodeEditorActiveLineClasses(_theme?: CodeEditorTheme): string {
  return codeEditorActiveLineClasses
}

export function getCodeEditorWrapClass(wordWrap: boolean): string {
  return wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'
}

/**
 * `undefined` follows the document color scheme (`data-tiger-color-scheme`,
 * `.dark`, then `prefers-color-scheme`).
 */
export function resolveCodeEditorTheme(
  theme: CodeEditorTheme | 'auto' | undefined,
  root?: { classList?: { contains(name: string): boolean }; getAttribute?(name: string): string | null } | null
): CodeEditorTheme {
  if (theme === 'light' || theme === 'dark') return theme
  const host = root ?? (isBrowser() ? document.documentElement : null)
  if (!host) return 'light'
  const explicit = host.getAttribute?.('data-tiger-color-scheme')
  if (explicit === 'dark' || explicit === 'light') return explicit
  if (host.classList?.contains('dark')) return 'dark'
  if (
    isBrowser() &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }
  return 'light'
}

/** Do not write `value` onto the textarea between composition start and end. */
export function shouldCommitEditorValue(isComposing: boolean): boolean {
  return !isComposing
}

export function syncEditorTextareaValue(
  textarea: HTMLTextAreaElement | null,
  value: string,
  isComposing: boolean
): void {
  if (!textarea || isComposing) return
  if (textarea.value !== value) textarea.value = value
}

/**
 * Index (0-based) of the line containing the given caret position.
 */
export function getActiveLineIndex(value: string, caretPosition: number): number {
  const clamped = Math.max(0, Math.min(caretPosition, value.length))
  let line = 0
  for (let i = 0; i < clamped; i++) {
    if (value[i] === '\n') line++
  }
  return line
}

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
  keyword: 'text-[var(--tiger-primary)] font-semibold',
  string: 'text-[var(--tiger-success)]',
  comment: 'text-[var(--tiger-text-secondary)] italic',
  number: 'text-[var(--tiger-info)]',
  punctuation: 'text-[var(--tiger-text-secondary)]',
  plain: ''
}

/**
 * Dark syntax uses a different semantic token than the light pair.
 * No hex colors are written on the host.
 */
export const tokenClassesDark: Record<TokenType, string> = {
  keyword: 'text-[var(--tiger-info)] font-semibold',
  string: 'text-[var(--tiger-success)]',
  comment: 'text-[var(--tiger-text-secondary)] italic',
  number: 'text-[var(--tiger-warning)]',
  punctuation: 'text-[var(--tiger-text)]',
  plain: 'text-[var(--tiger-text)]'
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
function tokenizeHtmlLine(line: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < line.length) {
    if (line.startsWith('<!--', i)) {
      const end = line.indexOf('-->', i + 4)
      const close = end === -1 ? line.length : end + 3
      tokens.push({ type: 'comment', value: line.slice(i, close) })
      i = close
      continue
    }
    if (line[i] === '<') {
      tokens.push({ type: 'punctuation', value: '<' })
      i++
      if (line[i] === '/') {
        tokens.push({ type: 'punctuation', value: '/' })
        i++
      }
      const start = i
      while (i < line.length && /[A-Za-z0-9:-]/.test(line[i])) i++
      if (i > start) tokens.push({ type: 'keyword', value: line.slice(start, i) })
      continue
    }
    if (line[i] === '"' || line[i] === "'") {
      const quote = line[i]
      let j = i + 1
      while (j < line.length && line[j] !== quote) {
        if (line[j] === '\\') j++
        j++
      }
      j++
      tokens.push({ type: 'string', value: line.slice(i, j) })
      i = j
      continue
    }
    if (/[/>=]/.test(line[i])) {
      tokens.push({ type: 'punctuation', value: line[i] })
      i++
      continue
    }
    let j = i + 1
    while (j < line.length && line[j] !== '<' && line[j] !== '"' && line[j] !== "'") j++
    tokens.push({ type: 'plain', value: line.slice(i, j) })
    i = j
  }
  return tokens
}

function tokenizeCssLine(line: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < line.length) {
    if (line[i] === '/' && line[i + 1] === '*') {
      const end = line.indexOf('*/', i + 2)
      const close = end === -1 ? line.length : end + 2
      tokens.push({ type: 'comment', value: line.slice(i, close) })
      i = close
      continue
    }
    if (line[i] === '"' || line[i] === "'") {
      const quote = line[i]
      let j = i + 1
      while (j < line.length && line[j] !== quote) {
        if (line[j] === '\\') j++
        j++
      }
      j++
      tokens.push({ type: 'string', value: line.slice(i, j) })
      i = j
      continue
    }
    if (/\d/.test(line[i]) && (i === 0 || /[^a-zA-Z_-]/.test(line[i - 1]))) {
      let j = i
      while (j < line.length && /[\d.]/.test(line[j])) j++
      tokens.push({ type: 'number', value: line.slice(i, j) })
      i = j
      continue
    }
    if (/[a-zA-Z_-]/.test(line[i])) {
      let j = i
      while (j < line.length && /[a-zA-Z0-9_-]/.test(line[j])) j++
      const word = line.slice(i, j)
      let k = j
      while (k < line.length && /[ \t]/.test(line[k])) k++
      tokens.push({
        type: line[k] === ':' ? 'keyword' : 'plain',
        value: word
      })
      i = j
      continue
    }
    if (/[{}:;,#.*>+~[\]()]/.test(line[i])) {
      tokens.push({ type: 'punctuation', value: line[i] })
      i++
      continue
    }
    tokens.push({ type: 'plain', value: line[i] })
    i++
  }
  return tokens
}

function tokenizeMarkdownLine(line: string): Token[] {
  const heading = /^(#{1,6})(\s+)(.*)$/.exec(line)
  if (heading) {
    return [
      { type: 'keyword', value: heading[1] },
      { type: 'plain', value: heading[2] + heading[3] }
    ]
  }
  if (/^\s*```/.test(line)) return [{ type: 'punctuation', value: line }]
  if (/^\s*[-*+]\s+/.test(line) || /^\s*\d+[.)]\s+/.test(line)) {
    const match = /^(\s*(?:[-*+]|\d+[.)])\s+)(.*)$/.exec(line)
    if (match) {
      return [
        { type: 'keyword', value: match[1] },
        { type: 'plain', value: match[2] }
      ]
    }
  }
  return [{ type: 'plain', value: line }]
}

function readNumberToken(line: string, i: number): number {
  if (line[i] === '0' && (line[i + 1] === 'x' || line[i + 1] === 'X')) {
    let j = i + 2
    while (j < line.length && /[0-9a-fA-F_]/.test(line[j])) j++
    return j
  }
  if (line[i] === '0' && (line[i + 1] === 'b' || line[i + 1] === 'B')) {
    let j = i + 2
    while (j < line.length && /[01_]/.test(line[j])) j++
    return j
  }
  if (line[i] === '0' && (line[i + 1] === 'o' || line[i + 1] === 'O')) {
    let j = i + 2
    while (j < line.length && /[0-7_]/.test(line[j])) j++
    return j
  }
  let j = i
  while (j < line.length && /\d/.test(line[j])) j++
  if (line[j] === '.' && /\d/.test(line[j + 1] ?? '')) {
    j++
    while (j < line.length && /\d/.test(line[j])) j++
  }
  if (line[j] === 'e' || line[j] === 'E') {
    let k = j + 1
    if (line[k] === '+' || line[k] === '-') k++
    if (/\d/.test(line[k] ?? '')) {
      j = k
      while (j < line.length && /\d/.test(line[j])) j++
    }
  }
  return j
}

export function tokenizeLine(line: string, language: CodeLanguage): Token[] {
  if (language === 'plain') {
    return line ? [{ type: 'plain', value: line }] : []
  }
  if (language === 'html') return tokenizeHtmlLine(line)
  if (language === 'css') return tokenizeCssLine(line)
  if (language === 'markdown') return tokenizeMarkdownLine(line)

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

    // Numbers stop at identifier characters (`1foo` → number + plain)
    if (/\d/.test(line[i]) && (i === 0 || /[^a-zA-Z_$]/.test(line[i - 1]))) {
      const j = readNumberToken(line, i)
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
export function getTokenClasses(type: TokenType, theme?: CodeEditorTheme): string {
  const table = theme === 'dark' ? tokenClassesDark : tokenClassesLight
  return table[type]
}

/**
 * Get container classes for the code editor
 */
export function getCodeEditorContainerClasses(
  _theme: CodeEditorTheme,
  disabled: boolean,
  className?: string
): string {
  const classes = [codeEditorBaseClasses, codeEditorChromeClasses]
  if (disabled) classes.push(codeEditorDisabledClasses)
  if (className) classes.push(className)
  return classes.join(' ')
}

/**
 * Get line number gutter classes
 */
export function getLineNumberClasses(_theme?: CodeEditorTheme): string {
  return codeEditorLineNumberClasses
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

/** Clamp tab width to an integer ≥ 1 (default 2). */
export function clampTabSize(tabSize: number): number {
  const size = Math.floor(Number(tabSize))
  return Number.isFinite(size) && size >= 1 ? size : 2
}

export type EditorTabAction = 'indent' | 'outdent' | 'passthrough' | 'arm-exit'

/**
 * Tab inserts indent. Escape then Tab leaves the editor (APG tab trap).
 * readOnly / disabled never capture Tab.
 */
export function resolveEditorTabAction(
  event: { key: string; shiftKey: boolean },
  state: { readOnly: boolean; disabled: boolean; allowTabExit: boolean }
): EditorTabAction {
  if (event.key === 'Escape') return 'arm-exit'
  if (event.key !== 'Tab') return 'passthrough'
  if (state.readOnly || state.disabled || state.allowTabExit) return 'passthrough'
  return event.shiftKey ? 'outdent' : 'indent'
}

/**
 * Handle Tab in a textarea. A caret inserts `tabSize` spaces. A selection
 * that spans lines (or Shift+Tab) indents / outdents each line in place.
 */
export function handleTabKey(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  tabSize: number,
  options?: { shift?: boolean }
): { value: string; selectionStart: number; selectionEnd: number } {
  const size = clampTabSize(tabSize)
  const indent = ' '.repeat(size)
  const start = Math.max(0, Math.min(selectionStart, selectionEnd, value.length))
  const end = Math.max(0, Math.min(Math.max(selectionStart, selectionEnd), value.length))
  const shift = Boolean(options?.shift)
  const selected = value.slice(start, end)

  if (!shift && !selected.includes('\n')) {
    const before = value.slice(0, start)
    const after = value.slice(end)
    return {
      value: before + indent + after,
      selectionStart: start + size,
      selectionEnd: start + size
    }
  }

  const firstLineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1
  const lastLineEnd =
    end > start && value[end - 1] === '\n'
      ? end - 1
      : (() => {
          const nl = value.indexOf('\n', end)
          return nl === -1 ? value.length : nl
        })()
  const block = value.slice(firstLineStart, lastLineEnd)
  const lines = block.split('\n')
  const nextLines = lines.map((line) => {
    if (shift) {
      const match = /^( +)/.exec(line)
      const remove = match ? Math.min(match[1].length, size) : 0
      return line.slice(remove)
    }
    return indent + line
  })
  const nextBlock = nextLines.join('\n')
  return {
    value: value.slice(0, firstLineStart) + nextBlock + value.slice(lastLineEnd),
    selectionStart: firstLineStart,
    selectionEnd: firstLineStart + nextBlock.length
  }
}

export interface CodeEditorLineModel {
  index: number
  text: string
  isActive: boolean
  tokens: HighlightToken[]
}

function toHighlightTokens(
  tokens: Token[],
  theme: CodeEditorTheme
): HighlightToken[] {
  return tokens.map((token) => {
    const className = getTokenClasses(token.type, theme)
    return className ? { text: token.value, className } : { text: token.value }
  })
}

let tokenCacheKey = ''
let tokenCacheRows: HighlightToken[][] = []

function rowsFromHighlighter(
  value: string,
  language: CodeLanguage,
  theme: CodeEditorTheme,
  highlighter?: CodeHighlighter
): HighlightToken[][] {
  const lines = value.split('\n')
  if (highlighter?.highlightLine) {
    return lines.map((text) => highlighter.highlightLine!(text, language, theme))
  }
  if (highlighter?.highlightCode) {
    const rows = highlighter.highlightCode(value, language, theme)
    if (Array.isArray(rows)) {
      return lines.map((text, index) =>
        Array.isArray(rows[index]) ? rows[index] : [{ text }]
      )
    }
  }
  return lines.map((text) => toHighlightTokens(tokenizeLine(text, language), theme))
}

export function buildCodeEditorLineModels(options: {
  value: string
  language: CodeLanguage
  theme: CodeEditorTheme
  activeLine: number
  highlightActiveLine: boolean
  disabled: boolean
  highlighter?: CodeHighlighter
}): { lines: CodeEditorLineModel[] } {
  const lines = options.value.split('\n')
  const showActive = options.highlightActiveLine && !options.disabled
  const key = `${options.language}\0${options.theme}\0${options.highlighter?.name ?? ''}\0${options.value}`
  if (key !== tokenCacheKey) {
    tokenCacheKey = key
    tokenCacheRows = rowsFromHighlighter(
      options.value,
      options.language,
      options.theme,
      options.highlighter
    )
  }
  return {
    lines: lines.map((text, index) => ({
      index,
      text,
      isActive: showActive && index === options.activeLine,
      tokens: tokenCacheRows[index] ?? [{ text }]
    }))
  }
}

/** Scroll the shared port so the caret line stays visible. */
export function scrollCodeEditorCaretIntoView(
  textarea: HTMLTextAreaElement | null,
  scroller: HTMLElement | null
): void {
  if (!textarea || !scroller) return
  const style = getComputedStyle(textarea)
  const lineHeight = Number.parseFloat(style.lineHeight) || 26
  const paddingTop = Number.parseFloat(style.paddingTop) || 0
  const line = getActiveLineIndex(textarea.value, textarea.selectionStart)
  const caretTop = paddingTop + line * lineHeight
  const caretBottom = caretTop + lineHeight
  if (caretTop < scroller.scrollTop) scroller.scrollTop = caretTop
  else if (caretBottom > scroller.scrollTop + scroller.clientHeight) {
    scroller.scrollTop = caretBottom - scroller.clientHeight
  }
}

export function getCodeEditorHeightStyle(
  minLines: number,
  maxLines: number
): { minHeight?: string; maxHeight?: string } {
  const style: { minHeight?: string; maxHeight?: string } = {}
  if (minLines > 0) {
    style.minHeight = `${minLines * CODE_EDITOR_LINE_HEIGHT_REM + CODE_EDITOR_PADDING_Y_REM}rem`
  }
  if (maxLines > 0) {
    style.maxHeight = `${maxLines * CODE_EDITOR_LINE_HEIGHT_REM + CODE_EDITOR_PADDING_Y_REM}rem`
  }
  return style
}
