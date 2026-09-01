import { describe, it, expect } from 'vitest'
import {
  tokenizeLine,
  getTokenClasses,
  getCodeEditorContainerClasses,
  getLineNumberClasses,
  countLines,
  generateLineNumbers,
  handleTabKey,
  getActiveLineIndex,
  tokenClassesLight,
  tokenClassesDark
} from '@expcat/tigercat-core'

describe('code-editor-utils', () => {
  describe('tokenizeLine', () => {
    it('should tokenize plain text', () => {
      const tokens = tokenizeLine('hello world', 'plain')
      expect(tokens).toHaveLength(1)
      expect(tokens[0].type).toBe('plain')
    })

    it('should tokenize JavaScript keywords', () => {
      const tokens = tokenizeLine('const x = 1', 'javascript')
      expect(tokens[0]).toEqual({ type: 'keyword', value: 'const' })
    })

    it('should tokenize TypeScript keywords', () => {
      const tokens = tokenizeLine('interface Foo {}', 'typescript')
      expect(tokens[0]).toEqual({ type: 'keyword', value: 'interface' })
    })

    it('should tokenize strings with double quotes', () => {
      const tokens = tokenizeLine('"hello"', 'javascript')
      const stringToken = tokens.find((t) => t.type === 'string')
      expect(stringToken?.value).toBe('"hello"')
    })

    it('should tokenize strings with single quotes', () => {
      const tokens = tokenizeLine("'world'", 'javascript')
      const stringToken = tokens.find((t) => t.type === 'string')
      expect(stringToken?.value).toBe("'world'")
    })

    it('should tokenize template strings', () => {
      const tokens = tokenizeLine('`template`', 'javascript')
      const stringToken = tokens.find((t) => t.type === 'string')
      expect(stringToken?.value).toBe('`template`')
    })

    it('should tokenize single-line comments', () => {
      const tokens = tokenizeLine('// comment', 'javascript')
      expect(tokens[0]).toEqual({ type: 'comment', value: '// comment' })
    })

    it('should tokenize Python comments', () => {
      const tokens = tokenizeLine('# comment', 'python')
      expect(tokens[0]).toEqual({ type: 'comment', value: '# comment' })
    })

    it('should tokenize numbers', () => {
      const tokens = tokenizeLine('42', 'javascript')
      expect(tokens[0]).toEqual({ type: 'number', value: '42' })
    })

    it('stops number tokens at identifier characters', () => {
      const tokens = tokenizeLine('1foo', 'javascript')
      expect(tokens[0]).toEqual({ type: 'number', value: '1' })
      expect(tokens[1]).toEqual({ type: 'plain', value: 'foo' })
    })

    it('tokenizes html tags instead of a whole-line plain token', () => {
      const tokens = tokenizeLine('<div>', 'html')
      expect(tokens.some((token) => token.type === 'keyword' && token.value === 'div')).toBe(true)
      expect(tokens).not.toEqual([{ type: 'plain', value: '<div>' }])
    })

    it('tokenizes css property names', () => {
      const tokens = tokenizeLine('color: red;', 'css')
      expect(tokens[0]).toEqual({ type: 'keyword', value: 'color' })
    })

    it('tokenizes markdown headings', () => {
      const tokens = tokenizeLine('# Title', 'markdown')
      expect(tokens[0]).toEqual({ type: 'keyword', value: '#' })
    })

    it('should tokenize punctuation', () => {
      const tokens = tokenizeLine('{}', 'javascript')
      expect(tokens[0]).toEqual({ type: 'punctuation', value: '{' })
      expect(tokens[1]).toEqual({ type: 'punctuation', value: '}' })
    })

    it('should handle mixed tokens', () => {
      const tokens = tokenizeLine('const x = 42 // answer', 'javascript')
      const types = tokens.map((t) => t.type)
      expect(types).toContain('keyword')
      expect(types).toContain('number')
      expect(types).toContain('comment')
    })

    it('should handle empty string', () => {
      const tokens = tokenizeLine('', 'javascript')
      expect(tokens).toHaveLength(0)
    })

    it('should handle Python keywords', () => {
      const tokens = tokenizeLine('def foo():', 'python')
      expect(tokens[0]).toEqual({ type: 'keyword', value: 'def' })
    })

    it('should handle JSON keywords', () => {
      const tokens = tokenizeLine('true', 'json')
      expect(tokens[0]).toEqual({ type: 'keyword', value: 'true' })
    })

    it('should handle escaped strings', () => {
      const tokens = tokenizeLine('"hello \\"world\\""', 'javascript')
      const stringToken = tokens.find((t) => t.type === 'string')
      expect(stringToken).toBeTruthy()
    })
  })

  describe('getActiveLineIndex', () => {
    it('returns the line containing the caret', () => {
      expect(getActiveLineIndex('a\nb', 2)).toBe(1)
    })
  })

  describe('getTokenClasses', () => {
    it('should return light theme classes', () => {
      expect(getTokenClasses('keyword', 'light')).toBe(tokenClassesLight.keyword)
      expect(getTokenClasses('string', 'light')).toBe(tokenClassesLight.string)
    })

    it('should return dark theme classes', () => {
      expect(getTokenClasses('keyword', 'dark')).toBe(tokenClassesDark.keyword)
      expect(getTokenClasses('comment', 'dark')).toBe(tokenClassesDark.comment)
    })

    it('should return empty for plain', () => {
      expect(getTokenClasses('plain', 'light')).toBe('')
    })
  })

  describe('getCodeEditorContainerClasses', () => {
    it('should return light theme classes', () => {
      const classes = getCodeEditorContainerClasses('light', false)
      expect(classes).toContain('--tiger-surface')
      expect(classes).toContain('font-mono')
    })

    it('should return dark theme classes', () => {
      const classes = getCodeEditorContainerClasses('dark', false)
      expect(classes).toContain('--tiger-surface')
    })

    it('should include disabled classes', () => {
      const classes = getCodeEditorContainerClasses('light', true)
      expect(classes).toContain('opacity-60')
    })

    it('should append custom className', () => {
      const classes = getCodeEditorContainerClasses('light', false, 'my-editor')
      expect(classes).toContain('my-editor')
    })
  })

  describe('getLineNumberClasses', () => {
    it('should return light line number classes', () => {
      const classes = getLineNumberClasses('light')
      expect(classes).toContain('--tiger-surface-muted')
    })

    it('should return dark line number classes', () => {
      const classes = getLineNumberClasses('dark')
      expect(classes).toContain('--tiger-surface-muted')
    })
  })

  describe('countLines', () => {
    it('should count single line', () => {
      expect(countLines('hello')).toBe(1)
    })

    it('should count multiple lines', () => {
      expect(countLines('a\nb\nc')).toBe(3)
    })

    it('should handle empty string', () => {
      expect(countLines('')).toBe(1)
    })

    it('should count trailing newline', () => {
      expect(countLines('a\n')).toBe(2)
    })
  })

  describe('generateLineNumbers', () => {
    it('should generate 1 to N', () => {
      expect(generateLineNumbers(3)).toEqual([1, 2, 3])
    })

    it('should handle single line', () => {
      expect(generateLineNumbers(1)).toEqual([1])
    })

    it('should handle zero', () => {
      expect(generateLineNumbers(0)).toEqual([])
    })
  })

  describe('handleTabKey', () => {
    it('should insert spaces at cursor', () => {
      const result = handleTabKey('hello', 5, 5, 2)
      expect(result.value).toBe('hello  ')
      expect(result.selectionStart).toBe(7)
    })

    it('should replace selection', () => {
      const result = handleTabKey('hello world', 5, 11, 2)
      expect(result.value).toBe('hello  ')
      expect(result.selectionStart).toBe(7)
    })

    it('should insert at beginning', () => {
      const result = handleTabKey('hello', 0, 0, 4)
      expect(result.value).toBe('    hello')
      expect(result.selectionStart).toBe(4)
    })

    it('should use custom tab size', () => {
      const result = handleTabKey('x', 1, 1, 4)
      expect(result.value).toBe('x    ')
      expect(result.selectionStart).toBe(5)
    })

    it('indents each selected line and keeps the original text', () => {
      const result = handleTabKey('a\nb\nc', 0, 5, 2)
      expect(result.value).toBe('  a\n  b\n  c')
    })

    it('clamps invalid tabSize so repeat does not throw', () => {
      expect(handleTabKey('x', 0, 0, 0).value).toBe('  x')
      expect(handleTabKey('x', 0, 0, Number.NaN).value).toBe('  x')
    })
  })
})
