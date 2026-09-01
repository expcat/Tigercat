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
  markdownEditorBodyClasses,
  markdownEditorContainerBase,
  markdownEditorContainerDisabled,
  markdownEditorToolbarClasses,
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

    it('lands container fill on registered surface/text, not locked white or bg aliases', () => {
      expect(markdownEditorContainerBase).toContain('--tiger-surface')
      expect(markdownEditorContainerBase).toContain('--tiger-text')
      expect(markdownEditorContainerBase).toContain('--tiger-md-bg,var(--tiger-surface')
      expect(markdownEditorContainerBase).toContain('text-[var(--tiger-text,#111827)]')
      expect(markdownEditorContainerBase).not.toContain('bg-[var(--tiger-bg,#ffffff)]')
      expect(markdownEditorContainerBase).not.toContain('--tiger-bg')
      expect(markdownEditorContainerBase).not.toContain('--tiger-fill')
      expect(markdownEditorContainerBase).not.toContain('--tiger-surface-muted')

      const overrideIdx = markdownEditorContainerBase.indexOf('--tiger-md-bg')
      const semanticIdx = markdownEditorContainerBase.indexOf('--tiger-surface')
      expect(overrideIdx).toBeGreaterThan(-1)
      expect(semanticIdx).toBeGreaterThan(overrideIdx)
    })

    it('lands body fill on the same registered surface chain', () => {
      expect(markdownEditorBodyClasses).toContain('--tiger-surface')
      expect(markdownEditorBodyClasses).toContain('--tiger-md-bg,var(--tiger-surface')
      expect(markdownEditorBodyClasses).not.toContain('bg-[var(--tiger-bg,#ffffff)]')
      expect(markdownEditorBodyClasses).not.toContain('--tiger-bg')
      expect(markdownEditorBodyClasses).not.toContain('--tiger-fill')
    })

    it('lands toolbar fill on registered surface-muted, not locked bg-secondary', () => {
      expect(markdownEditorToolbarClasses).toContain('--tiger-surface-muted')
      expect(markdownEditorToolbarClasses).toContain(
        '--tiger-md-toolbar-bg,var(--tiger-surface-muted'
      )
      expect(markdownEditorToolbarClasses).not.toContain('--tiger-bg-secondary')
      expect(markdownEditorToolbarClasses).not.toContain('--tiger-bg')
      expect(markdownEditorToolbarClasses).not.toContain('--tiger-fill')
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

    it('keeps relative paths and hash links', () => {
      const html = renderMarkdownInline('[docs](/guide) [here](#anchor)')
      expect(html).toContain('<a href="/guide"')
      expect(html).toContain('<a href="#anchor"')
    })

    it('does not format markers inside code spans', () => {
      const html = renderMarkdownInline('`**x**`')
      expect(html).toBe('<code>**x**</code>')
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
      expect(html).toContain('<p>x</p>')
      expect(html).not.toContain('<script>')
      expect(html).not.toContain('onclick')
    })

    it('sanitizes bypass payloads from a custom renderer', () => {
      const html = renderMarkdownToHtml('x', {
        render: () =>
          '<a href=javascript:alert(1)>js</a><a href="java&#115;cript:alert(1)">ent</a><img src=x onerror=alert(1)>'
      })
      expect(html).not.toContain('javascript:')
      expect(html).not.toContain('onerror')
      expect(html).not.toContain('alert')
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

    it('keeps a blank line before a table inserted after a newline', () => {
      const result = applyMarkdownToolbarAction('table', {
        value: 'hello\n',
        selectionStart: 6,
        selectionEnd: 6
      })
      expect(result.value.startsWith('hello\n\n|')).toBe(true)
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
