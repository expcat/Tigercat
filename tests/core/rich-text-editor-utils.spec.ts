import { describe, it, expect } from 'vitest'
import {
  defaultToolbar,
  getRichTextContainerClasses,
  getToolbarButtonClasses,
  getEditorAreaClasses,
  richTextContainerBase,
  richTextContainerDisabled,
  richTextToolbarButtonBase,
  richTextToolbarButtonActive,
  richTextEditorAreaBase,
  richTextEditorAreaReadOnly,
  mapToolbarAction,
  isInlineFormat,
  parseHotkey,
  matchesHotkey,
  findHotkeyMatch,
  sanitizeHtml,
  isContentEmpty,
  parseHeight,
  isValidUrl
} from '@expcat/tigercat-core'

// ─── defaultToolbar ───────────────────────────────────────────────

describe('defaultToolbar', () => {
  it('has expected buttons', () => {
    const names = defaultToolbar.map((b) => b.name)
    expect(names).toContain('bold')
    expect(names).toContain('italic')
    expect(names).toContain('underline')
    expect(names).toContain('heading1')
    expect(names).toContain('bulletList')
    expect(names).toContain('link')
    expect(names).toContain('undo')
    expect(names).toContain('redo')
    expect(names).toContain('clear')
  })

  it('each button has name and label', () => {
    for (const btn of defaultToolbar) {
      expect(btn.name).toBeTruthy()
      expect(btn.label).toBeTruthy()
    }
  })
})

// ─── Class generators ─────────────────────────────────────────────

describe('getRichTextContainerClasses', () => {
  it('returns base classes when enabled', () => {
    const result = getRichTextContainerClasses(false)
    expect(result).toContain(richTextContainerBase)
    expect(result).not.toContain(richTextContainerDisabled)
  })

  it('adds disabled class when disabled', () => {
    const result = getRichTextContainerClasses(true)
    expect(result).toContain(richTextContainerDisabled)
  })

  it('appends custom className', () => {
    const result = getRichTextContainerClasses(false, 'custom-class')
    expect(result).toContain('custom-class')
  })
})

describe('getToolbarButtonClasses', () => {
  it('returns base classes when inactive', () => {
    const result = getToolbarButtonClasses(false)
    expect(result).toBe(richTextToolbarButtonBase)
  })

  it('includes active classes when active', () => {
    const result = getToolbarButtonClasses(true)
    expect(result).toContain(richTextToolbarButtonActive)
  })
})

describe('getEditorAreaClasses', () => {
  it('returns base classes when editable', () => {
    const result = getEditorAreaClasses(false)
    expect(result).toBe(richTextEditorAreaBase)
  })

  it('includes readonly classes when readonly', () => {
    const result = getEditorAreaClasses(true)
    expect(result).toContain(richTextEditorAreaReadOnly)
  })
})

// ─── mapToolbarAction ─────────────────────────────────────────────

describe('mapToolbarAction', () => {
  it('maps bold to bold command', () => {
    const result = mapToolbarAction('bold')
    expect(result).toEqual({ command: 'bold' })
  })

  it('maps heading1 to formatBlock H1', () => {
    const result = mapToolbarAction('heading1')
    expect(result).toEqual({ command: 'formatBlock', argument: 'H1' })
  })

  it('maps bulletList to insertUnorderedList', () => {
    const result = mapToolbarAction('bulletList')
    expect(result).toEqual({ command: 'insertUnorderedList' })
  })

  it('maps undo/redo', () => {
    expect(mapToolbarAction('undo')).toEqual({ command: 'undo' })
    expect(mapToolbarAction('redo')).toEqual({ command: 'redo' })
  })

  it('returns null for unknown actions', () => {
    expect(mapToolbarAction('link')).toBeNull()
    expect(mapToolbarAction('image')).toBeNull()
    expect(mapToolbarAction('unknown')).toBeNull()
  })

  it('maps clear to removeFormat', () => {
    expect(mapToolbarAction('clear')).toEqual({ command: 'removeFormat' })
  })
})

// ─── isInlineFormat ───────────────────────────────────────────────

describe('isInlineFormat', () => {
  it('returns true for inline formats', () => {
    expect(isInlineFormat('bold')).toBe(true)
    expect(isInlineFormat('italic')).toBe(true)
    expect(isInlineFormat('underline')).toBe(true)
    expect(isInlineFormat('strikethrough')).toBe(true)
  })

  it('returns false for block/other actions', () => {
    expect(isInlineFormat('heading1')).toBe(false)
    expect(isInlineFormat('bulletList')).toBe(false)
    expect(isInlineFormat('link')).toBe(false)
  })
})

// ─── Hotkey helpers ───────────────────────────────────────────────

describe('parseHotkey', () => {
  it('parses simple Ctrl+key', () => {
    const result = parseHotkey('Ctrl+B')
    expect(result).toEqual({ ctrl: true, shift: false, alt: false, meta: false, key: 'b' })
  })

  it('parses Cmd+Shift+key', () => {
    const result = parseHotkey('Cmd+Shift+Z')
    expect(result).toEqual({ ctrl: false, shift: true, alt: false, meta: true, key: 'z' })
  })

  it('parses Alt+key', () => {
    const result = parseHotkey('Alt+H')
    expect(result).toEqual({ ctrl: false, shift: false, alt: true, meta: false, key: 'h' })
  })
})

describe('matchesHotkey', () => {
  it('matches when all modifiers and key match', () => {
    const parsed = parseHotkey('Ctrl+B')
    const event = { ctrlKey: true, shiftKey: false, altKey: false, metaKey: false, key: 'b' }
    expect(matchesHotkey(event, parsed)).toBe(true)
  })

  it('does not match when key differs', () => {
    const parsed = parseHotkey('Ctrl+B')
    const event = { ctrlKey: true, shiftKey: false, altKey: false, metaKey: false, key: 'i' }
    expect(matchesHotkey(event, parsed)).toBe(false)
  })

  it('does not match when modifier differs', () => {
    const parsed = parseHotkey('Ctrl+B')
    const event = { ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, key: 'b' }
    expect(matchesHotkey(event, parsed)).toBe(false)
  })
})

describe('findHotkeyMatch', () => {
  const toolbar = [
    { name: 'bold', label: 'Bold', hotkey: 'Ctrl+B' },
    { name: 'italic', label: 'Italic', hotkey: 'Ctrl+I' }
  ]

  it('returns action name when hotkey matches', () => {
    const event = { ctrlKey: true, shiftKey: false, altKey: false, metaKey: false, key: 'b' }
    expect(findHotkeyMatch(toolbar, event)).toBe('bold')
  })

  it('returns null when no match', () => {
    const event = { ctrlKey: true, shiftKey: false, altKey: false, metaKey: false, key: 'z' }
    expect(findHotkeyMatch(toolbar, event)).toBeNull()
  })

  it('handles buttons without hotkeys', () => {
    const tb = [{ name: 'link', label: 'Link' }]
    const event = { ctrlKey: true, shiftKey: false, altKey: false, metaKey: false, key: 'k' }
    expect(findHotkeyMatch(tb, event)).toBeNull()
  })
})

// ─── Content helpers ──────────────────────────────────────────────

describe('sanitizeHtml', () => {
  it('strips script tags', () => {
    const result = sanitizeHtml('<p>Hello</p><script>alert("xss")</script>')
    expect(result).toBe('<p>Hello</p>')
    expect(result).not.toContain('script')
  })

  it('removes inline event handlers with double quotes', () => {
    const result = sanitizeHtml('<a onclick="evil()">click</a>')
    expect(result).not.toContain('onclick')
  })

  it('removes inline event handlers with single quotes', () => {
    const result = sanitizeHtml("<img onerror='evil()' />")
    expect(result).not.toContain('onerror')
  })

  it('preserves safe content', () => {
    const html = '<p>Hello <strong>world</strong></p>'
    expect(sanitizeHtml(html)).toBe(html)
  })

  it('removes unquoted event handlers', () => {
    const result = sanitizeHtml('<div onmouseover=alert(1)>x</div>')
    expect(result).not.toContain('onmouseover')
  })

  it('strips iframe tags', () => {
    const result = sanitizeHtml('<p>text</p><iframe src="evil.com"></iframe>')
    expect(result).not.toContain('iframe')
  })

  it('strips object tags', () => {
    const result = sanitizeHtml('<object data="evil.swf"></object>')
    expect(result).not.toContain('object')
  })

  it('strips embed tags', () => {
    const result = sanitizeHtml('<embed src="evil.swf" />')
    expect(result).not.toContain('embed')
  })

  it('strips form tags', () => {
    const result = sanitizeHtml('<form action="evil.com"><input /></form>')
    expect(result).not.toContain('form')
  })

  it('removes javascript: URLs in href', () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>')
    expect(result).not.toContain('javascript:')
  })

  it('removes data: URLs in src', () => {
    const result = sanitizeHtml('<img src="data:text/html,<script>alert(1)</script>" />')
    expect(result).not.toContain('data:')
  })
})

// ─── isValidUrl ───────────────────────────────────────────────────

describe('isValidUrl', () => {
  it('accepts http URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true)
  })

  it('accepts https URLs', () => {
    expect(isValidUrl('https://example.com/path?q=1')).toBe(true)
  })

  it('accepts mailto URLs', () => {
    expect(isValidUrl('mailto:user@example.com')).toBe(true)
  })

  it('rejects javascript: URLs', () => {
    expect(isValidUrl('javascript:alert(1)')).toBe(false)
  })

  it('rejects javascript: with mixed case', () => {
    expect(isValidUrl('JavaScript:alert(1)')).toBe(false)
  })

  it('rejects data: URLs', () => {
    expect(isValidUrl('data:text/html,<script>alert(1)</script>')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidUrl('')).toBe(false)
  })

  it('rejects whitespace-only string', () => {
    expect(isValidUrl('   ')).toBe(false)
  })
})

describe('isContentEmpty', () => {
  it('returns true for empty string', () => {
    expect(isContentEmpty('')).toBe(true)
  })

  it('returns true for whitespace only', () => {
    expect(isContentEmpty('   ')).toBe(true)
  })

  it('returns true for empty tags', () => {
    expect(isContentEmpty('<p><br></p>')).toBe(true)
  })

  it('returns true for nbsp only', () => {
    expect(isContentEmpty('&nbsp;')).toBe(true)
  })

  it('returns false for real content', () => {
    expect(isContentEmpty('<p>Hello</p>')).toBe(false)
  })

  it('returns false for text with tags', () => {
    expect(isContentEmpty('<strong>text</strong>')).toBe(false)
  })
})

describe('parseHeight', () => {
  it('returns undefined for undefined', () => {
    expect(parseHeight(undefined)).toBeUndefined()
  })

  it('converts number to px string', () => {
    expect(parseHeight(400)).toBe('400px')
  })

  it('passes string through', () => {
    expect(parseHeight('50vh')).toBe('50vh')
  })
})
