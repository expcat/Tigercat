import { describe, it, expect } from 'vitest'
import {
  builtinCodeHighlighter,
  escapeHighlightHtml,
  renderTokenHtml,
  renderTokensHtml,
  tokenizeLine,
  type CodeHighlighter
} from '../../packages/core/src'

describe('code-highlighter', () => {
  describe('escapeHighlightHtml', () => {
    it('escapes HTML special characters', () => {
      expect(escapeHighlightHtml('<div class="x">&"\'</div>')).toBe(
        '&lt;div class=&quot;x&quot;&gt;&amp;&quot;&#39;&lt;/div&gt;'
      )
    })

    it('returns plain text unchanged when no special chars', () => {
      expect(escapeHighlightHtml('hello world')).toBe('hello world')
    })
  })

  describe('renderTokenHtml', () => {
    it('wraps tokens with non-empty classes in a span', () => {
      const html = renderTokenHtml({ type: 'keyword', value: 'const' }, 'light')
      expect(html.startsWith('<span class="')).toBe(true)
      expect(html.endsWith('>const</span>')).toBe(true)
    })

    it('escapes the token value', () => {
      const html = renderTokenHtml({ type: 'string', value: '"<x>"' }, 'light')
      expect(html).toContain('&quot;&lt;x&gt;&quot;')
    })

    it('returns plain escaped text when token type has no class', () => {
      const html = renderTokenHtml({ type: 'plain', value: 'a < b' }, 'light')
      expect(html).toBe('a &lt; b')
    })
  })

  describe('renderTokensHtml', () => {
    it('concatenates token HTML in order', () => {
      const tokens = tokenizeLine('const x = 1', 'javascript')
      const html = renderTokensHtml(tokens, 'light')
      expect(html).toContain('const')
      expect(html).toContain('x')
      expect(html).toContain('1')
    })
  })

  describe('builtinCodeHighlighter', () => {
    it('exposes a highlightLine function', () => {
      expect(typeof builtinCodeHighlighter.highlightLine).toBe('function')
    })

    it('produces equivalent HTML to manual tokenizer + render pipeline', () => {
      const line = 'const x = "hello"'
      const expected = renderTokensHtml(tokenizeLine(line, 'javascript'), 'light')
      const actual = builtinCodeHighlighter.highlightLine!(line, 'javascript', 'light')
      expect(actual).toBe(expected)
    })

    it('respects the dark theme', () => {
      const lightHtml = builtinCodeHighlighter.highlightLine!('const x', 'javascript', 'light')
      const darkHtml = builtinCodeHighlighter.highlightLine!('const x', 'javascript', 'dark')
      expect(lightHtml).not.toBe(darkHtml)
    })
  })

  describe('CodeHighlighter contract', () => {
    it('allows engines to omit highlightLine in favour of highlightCode', () => {
      const engine: CodeHighlighter = {
        name: 'block-only',
        highlightCode: (code) => `<pre>${escapeHighlightHtml(code)}</pre>`
      }
      expect(engine.highlightLine).toBeUndefined()
      expect(engine.highlightCode!('a<b', 'plain', 'light')).toBe('<pre>a&lt;b</pre>')
    })
  })
})
