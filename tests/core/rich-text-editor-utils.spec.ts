import { describe, it, expect } from 'vitest'
import {
  defaultToolbar,
  createDefaultRichTextToolbar,
  mapToolbarAction,
  isInlineFormat,
  parseHotkey,
  matchesHotkey,
  findHotkeyMatch,
  sanitizeHtml,
  isContentEmpty,
  parseHeight,
  isValidUrl,
  isToolbarSeparator,
  getToolbarButtons
} from '@expcat/tigercat-core'
import type { ToolbarItem } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'

// ─── defaultToolbar ───────────────────────────────────────────────

describe('defaultToolbar', () => {
  it('has expected buttons', () => {
    const names = getToolbarButtons(defaultToolbar).map((b) => b.name)
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

  it('includes image and separators', () => {
    expect(getToolbarButtons(defaultToolbar).some((btn) => btn.name === 'image')).toBe(true)
    expect(defaultToolbar.some((item) => 'type' in item && item.type === 'separator')).toBe(true)
  })

  it('createDefaultRichTextToolbar uses locale labels for Bold / Italic', () => {
    const toolbar = createDefaultRichTextToolbar(
      zhCN.richTextEditor as Parameters<typeof createDefaultRichTextToolbar>[0]
    )
    const buttons = getToolbarButtons(toolbar)
    const bold = buttons.find((btn) => btn.name === 'bold')
    const italic = buttons.find((btn) => btn.name === 'italic')
    expect(bold?.label).toBe('加粗')
    expect(italic?.label).toBe('斜体')
  })
})

// ─── mapToolbarAction ─────────────────────────────────────────────

describe('mapToolbarAction', () => {
  it('maps bold to bold command', () => {
    const result = mapToolbarAction('bold')
    expect(result).toEqual({ command: 'bold' })
  })

  it('maps heading1 to formatBlock h1', () => {
    const result = mapToolbarAction('heading1')
    expect(result).toEqual({ command: 'formatBlock', argument: 'h1' })
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

  it('matches Cmd+B against a Ctrl+B hotkey', () => {
    const parsed = parseHotkey('Ctrl+B')
    const event = { ctrlKey: false, shiftKey: false, altKey: false, metaKey: true, key: 'b' }
    expect(matchesHotkey(event, parsed)).toBe(true)
  })
})

describe('findHotkeyMatch', () => {
  const toolbar = [
    { name: 'bold', label: 'Bold', hotkey: 'Ctrl+B' },
    { name: 'italic', label: 'Italic', hotkey: 'Ctrl+I' }
  ]

  it('returns matching button when hotkey matches', () => {
    const event = { ctrlKey: true, shiftKey: false, altKey: false, metaKey: false, key: 'b' }
    expect(findHotkeyMatch(toolbar, event)).toEqual(toolbar[0])
  })

  it('returns null when no match', () => {
    const event = { ctrlKey: true, shiftKey: false, altKey: false, metaKey: false, key: 'z' }
    expect(findHotkeyMatch(toolbar, event)).toBeNull()
  })

  it('handles buttons without hotkeys', () => {
    const tb: ToolbarItem[] = [{ name: 'link', label: 'Link' }]
    const event = { ctrlKey: true, shiftKey: false, altKey: false, metaKey: false, key: 'k' }
    expect(findHotkeyMatch(tb, event)).toBeNull()
  })

  it('skips separators when matching', () => {
    const tb: ToolbarItem[] = [
      { type: 'separator' },
      { name: 'bold', label: 'Bold', hotkey: 'Ctrl+B' },
      { type: 'separator' }
    ]
    const event = { ctrlKey: true, shiftKey: false, altKey: false, metaKey: false, key: 'b' }
    expect(findHotkeyMatch(tb, event)).toEqual(tb[1])
  })
})

// ─── Toolbar item helpers ─────────────────────────────────────────

describe('isToolbarSeparator', () => {
  it('returns true for separator items', () => {
    expect(isToolbarSeparator({ type: 'separator' })).toBe(true)
  })

  it('returns false for button items', () => {
    expect(isToolbarSeparator({ name: 'bold', label: 'Bold' })).toBe(false)
  })
})

describe('getToolbarButtons', () => {
  it('filters out separators', () => {
    const items: ToolbarItem[] = [
      { name: 'bold', label: 'Bold' },
      { type: 'separator' },
      { name: 'italic', label: 'Italic' }
    ]
    const buttons = getToolbarButtons(items)
    expect(buttons).toHaveLength(2)
    expect(buttons[0].name).toBe('bold')
    expect(buttons[1].name).toBe('italic')
  })

  it('returns empty array for all separators', () => {
    const items: ToolbarItem[] = [{ type: 'separator' }, { type: 'separator' }]
    expect(getToolbarButtons(items)).toHaveLength(0)
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

  it('drops unquoted javascript href', () => {
    const result = sanitizeHtml('<a href=javascript:alert(1)>x</a>')
    expect(result).not.toContain('javascript:')
    expect(result).toContain('x')
  })

  it('drops entity-encoded javascript href', () => {
    const result = sanitizeHtml('<a href="java&#115;cript:alert(1)">x</a>')
    expect(result.toLowerCase()).not.toContain('javascript:')
    expect(result).not.toContain('alert')
  })

  it('drops unclosed iframe', () => {
    const result = sanitizeHtml('<p>safe</p><iframe src="javascript:alert(1)">after')
    expect(result).not.toContain('iframe')
    expect(result).not.toContain('javascript:')
  })

  it('drops style url javascript', () => {
    const result = sanitizeHtml('<div style="background:url(javascript:alert(1))">x</div>')
    expect(result).not.toContain('javascript:')
    expect(result).not.toContain('style=')
    expect(result).toContain('x')
  })

  it('does not eat content= when stripping events', () => {
    const result = sanitizeHtml(
      '<p>keep</p><meta http-equiv="refresh" content="0;url=javascript:alert(1)">'
    )
    expect(result).toContain('<p>keep</p>')
    expect(result).not.toContain('meta')
    expect(result).not.toContain('javascript:')
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

  it('accepts relative paths and hash fragments', () => {
    expect(isValidUrl('/guide')).toBe(true)
    expect(isValidUrl('#anchor')).toBe(true)
    expect(isValidUrl('./logo.png')).toBe(true)
  })

  it('rejects protocol-relative and tab-obfuscated javascript', () => {
    expect(isValidUrl('//evil.example')).toBe(false)
    expect(isValidUrl('java\tscript:alert(1)')).toBe(false)
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
