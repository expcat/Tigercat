/**
 * CodeEditor component utilities
 * Shared styles and helpers for CodeEditor components
 *
 * Zero-dependency syntax highlighting using simple regex-based tokenization.
 * Not a full parser — provides basic keyword/string/comment/number highlighting.
 */

import type { CodeHighlighter, CodeLanguage, CodeEditorTheme } from '../types/code-editor'

export const CODE_EDITOR_LINE_HEIGHT_REM = 1.625
export const CODE_EDITOR_PADDING_Y_REM = 1.5

// ─── Style Constants ────────────────────────────────────────────────

export const codeEditorBaseClasses =
  'relative font-mono text-sm leading-[1.625rem] border rounded overflow-hidden'

/** Shared chrome; `theme="dark"` remaps the same variables on the host. */
export const codeEditorChromeClasses =
  'bg-[var(--tiger-surface,#ffffff)] border-[var(--tiger-border,#d1d5db)] text-[var(--tiger-text,#111827)]'

export const codeEditorLightClasses = codeEditorChromeClasses

export const codeEditorDarkClasses = codeEditorChromeClasses

export const codeEditorDarkThemeVars: Record<string, string> = {
  '--tiger-surface': '#111827',
  '--tiger-text': '#f3f4f6',
  '--tiger-border': '#374151',
  '--tiger-text-muted': '#9ca3af',
  '--tiger-surface-muted': '#1f2937'
}

export const codeEditorDisabledClasses = 'opacity-60 cursor-not-allowed'

export const codeEditorScrollerClasses = 'flex h-full overflow-auto'

export const codeEditorTextareaClasses =
  'absolute inset-0 w-full h-full resize-none outline-none bg-transparent text-transparent caret-[var(--tiger-text,#111827)] p-3 font-mono text-sm leading-[1.625rem] overflow-hidden placeholder:text-[var(--tiger-text-muted,#6b7280)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--tiger-primary,#2563eb)]'

export const codeEditorHighlightClasses =
  'p-3 font-mono text-sm leading-[1.625rem] pointer-events-none'

export const codeEditorLineNumberClasses =
  'select-none text-right pr-3 pl-2 py-3 border-r min-w-[3rem] flex-shrink-0 text-[var(--tiger-text-muted,#9ca3af)] bg-[var(--tiger-surface-muted,#f9fafb)] border-[var(--tiger-border,#d1d5db)]'

export const codeEditorLineNumberLightClasses = codeEditorLineNumberClasses

export const codeEditorLineNumberDarkClasses = codeEditorLineNumberClasses

/** Active-line highlight background */
export const codeEditorActiveLineLightClasses = 'bg-[var(--tiger-surface-muted,#f3f4f6)]'

/** Active-line highlight background (dark theme uses the same token) */
export const codeEditorActiveLineDarkClasses = 'bg-[var(--tiger-surface-muted,#1f2937)]'

/**
 * Background class for the active (caret) line, or '' when no highlight applies.
 */
export function getCodeEditorActiveLineClasses(theme: CodeEditorTheme): string {
  return theme === 'dark' ? codeEditorActiveLineDarkClasses : codeEditorActiveLineLightClasses
}

/**
 * Caret (text-cursor) color for the editable textarea, matched to the
 * theme's text color. This must be set explicitly: the textarea uses
 * `text-transparent` to reveal the highlight layer beneath it, which turns
 * `currentColor` transparent — so a `caret-current` caret is invisible.
 */
export function getCodeEditorCaretClasses(_theme: CodeEditorTheme): string {
  return ''
}

export function getCodeEditorWrapClass(wordWrap: boolean): string {
  return wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'
}

export function getCodeEditorThemeVars(theme: CodeEditorTheme): Record<string, string> | undefined {
  return theme === 'dark' ? codeEditorDarkThemeVars : undefined
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
  keyword: 'text-[var(--tiger-primary,#7c3aed)] font-semibold',
  string: 'text-[var(--tiger-success,#16a34a)]',
  comment: 'text-[var(--tiger-text-muted,#9ca3af)] italic',
  number: 'text-[var(--tiger-info,#2563eb)]',
  punctuation: 'text-[var(--tiger-text-muted,#6b7280)]',
  plain: ''
}

/**
 * CSS classes for token types (dark theme uses the same tokens)
 */
export const tokenClassesDark: Record<TokenType, string> = tokenClassesLight

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
export function getTokenClasses(type: TokenType, _theme?: CodeEditorTheme): string {
  return tokenClassesLight[type]
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
  html: string | null
  tokens: Token[] | null
}

export function buildCodeEditorLineModels(options: {
  value: string
  language: CodeLanguage
  theme: CodeEditorTheme
  activeLine: number
  highlightActiveLine: boolean
  disabled: boolean
  highlighter?: CodeHighlighter
}): { lines: CodeEditorLineModel[]; blockHtml: string | null } {
  const lines = options.value.split('\n')
  const showActive = options.highlightActiveLine && !options.disabled
  const highlighter = options.highlighter
  if (highlighter && !highlighter.highlightLine && highlighter.highlightCode) {
    return {
      blockHtml: highlighter.highlightCode(options.value, options.language, options.theme),
      lines: lines.map((text, index) => ({
        index,
        text,
        isActive: showActive && index === options.activeLine,
        html: null,
        tokens: null
      }))
    }
  }

  return {
    blockHtml: null,
    lines: lines.map((text, index) => {
      const isActive = showActive && index === options.activeLine
      if (highlighter?.highlightLine) {
        return {
          index,
          text,
          isActive,
          html:
            highlighter.highlightLine(text, options.language, options.theme) ||
            (text === '' ? '\n' : ''),
          tokens: null
        }
      }
      return {
        index,
        text,
        isActive,
        html: null,
        tokens: tokenizeLine(text, options.language)
      }
    })
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
