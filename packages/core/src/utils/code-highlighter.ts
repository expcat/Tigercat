/**
 * Built-in code highlighter.
 *
 * Returns tokens. Callers draw `text` as a text node. There is no HTML string.
 */
import { tokenizeLine, getTokenClasses, type TokenType } from './code-editor-utils'
import type { CodeHighlighter, CodeLanguage, CodeEditorTheme, HighlightToken } from '../types/code-editor'

export type { CodeHighlighter, HighlightToken }

function tokensFromLine(line: string, language: CodeLanguage, theme: CodeEditorTheme): HighlightToken[] {
  return tokenizeLine(line, language).map((token) => {
    const className = getTokenClasses(token.type as TokenType, theme)
    return className ? { text: token.value, className } : { text: token.value }
  })
}

/**
 * Default highlighter. Wraps the built-in tokenizer as tokens.
 */
export const builtinCodeHighlighter: CodeHighlighter = {
  name: 'builtin',
  highlightLine(line: string, language: CodeLanguage, theme: CodeEditorTheme) {
    return tokensFromLine(line, language, theme)
  }
}
