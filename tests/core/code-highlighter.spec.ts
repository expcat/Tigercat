import { describe, it, expect } from 'vitest'
import { builtinCodeHighlighter, tokenizeLine, type CodeHighlighter } from '../../packages/core/src'

describe('code-highlighter', () => {
  describe('builtinCodeHighlighter', () => {
    it('returns tokens instead of HTML', () => {
      const line = 'const x = "hello"'
      const tokens = builtinCodeHighlighter.highlightLine!(line, 'javascript', 'light')
      expect(tokens.map((token) => token.text).join('')).toBe(line)
      expect(tokens.some((token) => token.text === 'const' && token.className)).toBe(true)
      expect(tokens.some((token) => token.text.includes('<'))).toBe(false)
      expect(JSON.stringify(tokens)).not.toContain('<span')
    })

    it('keeps raw characters in the token text', () => {
      const tokens = builtinCodeHighlighter.highlightLine!('a < b', 'plain', 'light')
      expect(tokens.map((token) => token.text).join('')).toBe('a < b')
    })

    it('uses the same token classes for light and dark', () => {
      const light = builtinCodeHighlighter.highlightLine!('const x', 'javascript', 'light')
      const dark = builtinCodeHighlighter.highlightLine!('const x', 'javascript', 'dark')
      expect(light.some((token) => token.className?.includes('--tiger-primary'))).toBe(true)
      expect(dark.some((token) => token.className?.includes('--tiger-info'))).toBe(true)
      expect(JSON.stringify(light)).not.toMatch(/#[0-9a-fA-F]{3,8}/)
      expect(JSON.stringify(dark)).not.toMatch(/#[0-9a-fA-F]{3,8}/)
    })

    it('matches the built-in tokenizer text', () => {
      const line = 'const x = 1'
      const tokens = builtinCodeHighlighter.highlightLine!(line, 'javascript', 'light')
      expect(tokens.map((token) => token.text)).toEqual(tokenizeLine(line, 'javascript').map((token) => token.value))
    })
  })

  describe('CodeHighlighter contract', () => {
    it('allows engines to return token lines from highlightCode', () => {
      const engine: CodeHighlighter = {
        name: 'block-only',
        highlightCode: (code) => code.split('\n').map((line) => [{ text: line }])
      }
      expect(engine.highlightLine).toBeUndefined()
      expect(engine.highlightCode!('a<b', 'plain', 'light')).toEqual([[{ text: 'a<b' }]])
    })
  })
})
