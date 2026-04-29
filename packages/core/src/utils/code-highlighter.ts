/**
 * Code Editor Highlighter Engine (PR-17)
 *
 * Opt-in pluggable highlighter API for {@link CodeEditor}. When a
 * `CodeHighlighter` is supplied to the component the built-in regex
 * tokenizer is bypassed and the provided engine renders highlighted HTML
 * instead.
 *
 * Two integration shapes are supported:
 *   1. Per-line: implement {@link CodeHighlighter.highlightLine}. The
 *      component renders one `<div>` per line containing the returned
 *      raw HTML. Suited for line-based engines (Prism, Highlight.js).
 *   2. Whole-block: implement {@link CodeHighlighter.highlightCode}. The
 *      component injects the returned HTML directly. Suited for engines
 *      that emit a fully wrapped block (Shiki, custom themed renderers).
 *
 * The component prefers `highlightLine` when both are present so the
 * line-number gutter stays aligned. Engine output is treated as TRUSTED
 * HTML — callers are responsible for sanitisation if the source can be
 * user-controlled.
 *
 * The built-in highlighter (regex tokenizer + Tailwind class spans) is
 * exposed as {@link builtinCodeHighlighter} so userland code can
 * compose / fall back to it explicitly.
 */
import { tokenizeLine, getTokenClasses, type Token, type TokenType } from './code-editor-utils'
import type { CodeLanguage, CodeEditorTheme } from '../types/code-editor'

export interface CodeHighlighter {
  /** Optional identifier used by tests / devtools. */
  name?: string
  /**
   * Render a single line of source to HTML. Returned string is injected
   * verbatim — engines must escape any untrusted text themselves.
   */
  highlightLine?(line: string, language: CodeLanguage, theme: CodeEditorTheme): string
  /**
   * Render the whole code block to HTML. Used when `highlightLine` is
   * not provided. Engines that emit one `<pre><code>` envelope per call
   * should prefer this hook.
   */
  highlightCode?(code: string, language: CodeLanguage, theme: CodeEditorTheme): string
}

/** Escape characters that would otherwise break HTML interpolation. */
export function escapeHighlightHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Render a single token to a `<span>` element string (or escaped text). */
export function renderTokenHtml(token: Token, theme: CodeEditorTheme): string {
  const escaped = escapeHighlightHtml(token.value)
  const cls = getTokenClasses(token.type as TokenType, theme)
  if (!cls) return escaped
  return `<span class="${cls}">${escaped}</span>`
}

/** Render an array of tokens as an HTML fragment string. */
export function renderTokensHtml(tokens: Token[], theme: CodeEditorTheme): string {
  let out = ''
  for (let i = 0; i < tokens.length; i++) out += renderTokenHtml(tokens[i], theme)
  return out
}

/**
 * Default highlighter — wraps the built-in regex tokenizer so that the
 * engine path can be exercised symmetrically in tests / examples.
 *
 * Using the engine path adds a tiny overhead (string concat instead of
 * VNode array) so the component still uses the tokenizer directly when
 * no `highlighter` prop is provided.
 */
export const builtinCodeHighlighter: CodeHighlighter = {
  name: 'builtin',
  highlightLine(line, language, theme) {
    const tokens = tokenizeLine(line, language)
    return renderTokensHtml(tokens, theme)
  }
}
