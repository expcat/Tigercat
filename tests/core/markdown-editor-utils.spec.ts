import { describe, it, expect } from 'vitest'
import {
  applyMarkdownToolbarAction,
  defaultMarkdownToolbar,
  escapeMarkdownHtml,
  findMarkdownHotkeyMatch,
  getMarkdownBodyClasses,
  getMarkdownContainerClasses,
  getMarkdownToolbarButtonClasses,
  getMarkdownToolbarButtons,
  isMarkdownToolbarSeparator,
  markdownEditorContainerBase,
  markdownEditorContainerDisabled,
  markdownHotkeyMatches,
  renderMarkdownInline,
  renderMarkdownToHtml
} from '@expcat/tigercat-core'
import type { MarkdownToolbarItem } from '@expcat/tigercat-core'

describe('MarkdownEditor utilities', () => {
  describe('defaultMarkdownToolbar', () => {
    it('contains common markdown formatting actions', () => {
      const names = getMarkdownToolbarButtons(defaultMarkdownToolbar).map((item) => item.name)
      expect(names).toContain('bold')
      expect(names).toContain('heading')
      expect(names).toContain('link')
      expect(names).toContain('table')
    })

    it('keeps buttons accessible', () => {
      for (const item of getMarkdownToolbarButtons(defaultMarkdownToolbar)) {
        expect(item.label).toBeTruthy()
        expect(item.tooltip).toBeTruthy()
      }
    })
  })

  describe('toolbar item helpers', () => {
    it('detects separators', () => {
      expect(isMarkdownToolbarSeparator({ type: 'separator' })).toBe(true)
      expect(isMarkdownToolbarSeparator({ name: 'bold', label: 'B' })).toBe(false)
    })

    it('filters toolbar buttons', () => {
      const toolbar: MarkdownToolbarItem[] = [
        { name: 'bold', label: 'B' },
        { type: 'separator' },
        { name: 'link', label: 'Link' }
      ]
      expect(getMarkdownToolbarButtons(toolbar).map((item) => item.name)).toEqual(['bold', 'link'])
    })
  })

  describe('class helpers', () => {
    it('returns container base classes', () => {
      expect(getMarkdownContainerClasses(false)).toContain(markdownEditorContainerBase)
    })

    it('adds disabled and custom classes', () => {
      const result = getMarkdownContainerClasses(true, 'custom')
      expect(result).toContain(markdownEditorContainerDisabled)
      expect(result).toContain('custom')
    })

    it('returns active toolbar classes', () => {
      expect(getMarkdownToolbarButtonClasses(true)).toContain('text-[var(--tiger-primary,#2563eb)]')
    })

    it('returns split body classes', () => {
      expect(getMarkdownBodyClasses('split')).toContain('md:grid-cols-2')
      expect(getMarkdownBodyClasses('edit')).toContain('grid-cols-1')
    })
  })

  describe('markdown rendering', () => {
    it('escapes raw html', () => {
      expect(escapeMarkdownHtml('<script>alert(1)</script>')).toBe(
        '&lt;script&gt;alert(1)&lt;/script&gt;'
      )
    })

    it('renders inline markdown', () => {
      const html = renderMarkdownInline('**bold** *em* `code` ~~old~~')
      expect(html).toContain('<strong>bold</strong>')
      expect(html).toContain('<em>em</em>')
      expect(html).toContain('<code>code</code>')
      expect(html).toContain('<del>old</del>')
    })

    it('renders safe links and ignores unsafe links', () => {
      const html = renderMarkdownInline('[site](https://example.com) [bad](javascript:alert(1))')
      expect(html).toContain('<a href="https://example.com"')
      expect(html).not.toContain('javascript:')
    })

    it('renders headings, lists, and blockquotes', () => {
      const html = renderMarkdownToHtml('# Title\n\n- one\n- two\n\n> quote')
      expect(html).toContain('<h1>Title</h1>')
      expect(html).toContain('<ul>')
      expect(html).toContain('<blockquote>')
    })

    it('renders fenced code blocks', () => {
      const html = renderMarkdownToHtml('```ts\nconst value = 1\n```')
      expect(html).toContain('<pre><code class="language-ts">')
      expect(html).toContain('const value = 1')
    })

    it('renders tables', () => {
      const html = renderMarkdownToHtml('| A | B |\n| --- | --- |\n| 1 | 2 |')
      expect(html).toContain('<table>')
      expect(html).toContain('<th>A</th>')
      expect(html).toContain('<td>2</td>')
    })

    it('sanitizes custom renderer output', () => {
      const html = renderMarkdownToHtml('x', {
        render: () => '<p onclick="alert(1)">x</p><script>alert(1)</script>'
      })
      expect(html).toContain('<p >x</p>')
      expect(html).not.toContain('<script>')
      expect(html).not.toContain('onclick')
    })
  })

  describe('toolbar insertion', () => {
    it('wraps selected text with bold markers', () => {
      const result = applyMarkdownToolbarAction('bold', {
        value: 'hello',
        selectionStart: 0,
        selectionEnd: 5
      })
      expect(result.value).toBe('**hello**')
      expect(result.selectionStart).toBe(2)
      expect(result.selectionEnd).toBe(7)
    })

    it('inserts placeholder text without a selection', () => {
      const result = applyMarkdownToolbarAction('link', {
        value: '',
        selectionStart: 0,
        selectionEnd: 0
      })
      expect(result.value).toBe('[link text](https://example.com)')
    })

    it('prefixes selected lines for lists', () => {
      const result = applyMarkdownToolbarAction('orderedList', {
        value: 'a\nb',
        selectionStart: 0,
        selectionEnd: 3
      })
      expect(result.value).toBe('1. a\n2. b')
    })

    it('inserts block snippets', () => {
      const result = applyMarkdownToolbarAction('horizontalRule', {
        value: 'before',
        selectionStart: 6,
        selectionEnd: 6
      })
      expect(result.value).toBe('before\n\n---')
    })

    it('runs custom toolbar actions', () => {
      const result = applyMarkdownToolbarAction(
        {
          name: 'custom',
          label: 'Custom',
          action: () => ({ value: 'custom', selectionStart: 0, selectionEnd: 6 })
        },
        { value: '', selectionStart: 0, selectionEnd: 0 }
      )
      expect(result.value).toBe('custom')
    })
  })

  describe('hotkeys', () => {
    it('matches modifier hotkeys', () => {
      expect(
        markdownHotkeyMatches(
          { ctrlKey: true, metaKey: false, shiftKey: false, altKey: false, key: 'b' },
          'Ctrl+B'
        )
      ).toBe(true)
    })

    it('finds matching toolbar button', () => {
      const match = findMarkdownHotkeyMatch(defaultMarkdownToolbar, {
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        key: 'k'
      })
      expect(match?.name).toBe('link')
    })
  })
})
