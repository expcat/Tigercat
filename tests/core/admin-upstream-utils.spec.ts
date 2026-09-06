/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it } from 'vitest'
import {
  appendCalendarEventCountLabel,
  buildCalendarDateCellExtra,
  clearRegisteredIcons,
  getCalendarEventsForDate,
  isFullscreenSupported,
  isTextCopyable,
  renderCodeHighlightHtml,
  resolveMenuSearchQuery,
  resolveTextCopyContent,
  resolveTextCopyableOptions,
  shouldShowMenuSearch
} from '@expcat/tigercat-core'

describe('calendar date-cell events', () => {
  const june15 = new Date(2024, 5, 15)

  it('matches events by local calendar day', () => {
    const events = [
      { title: 'Ship', date: '2024-06-15' },
      { title: 'Other', date: new Date(2024, 5, 16) }
    ]
    expect(getCalendarEventsForDate(events, june15).map((event) => event.title)).toEqual(['Ship'])
  })

  it('builds extra and aria copy with the event count', () => {
    const extra = buildCalendarDateCellExtra({
      date: june15,
      events: [{ title: 'Ship', date: '2024-06-15' }],
      inCurrentMonth: true,
      today: true,
      selected: false,
      disabled: false
    })
    expect(extra.iso).toBe('2024-06-15')
    expect(extra.events).toHaveLength(1)
    expect(appendCalendarEventCountLabel('Saturday, June 15, 2024', 1, '{n} events')).toBe(
      'Saturday, June 15, 2024, 1 events'
    )
    expect(appendCalendarEventCountLabel('Saturday, June 15, 2024', 0, '{n} events')).toBe(
      'Saturday, June 15, 2024'
    )
  })
})

describe('text copyable helpers', () => {
  it('treats true and option objects as copyable', () => {
    expect(isTextCopyable(false)).toBe(false)
    expect(isTextCopyable(true)).toBe(true)
    expect(isTextCopyable({ text: 'id-1' })).toBe(true)
    expect(resolveTextCopyableOptions(true)).toEqual({})
    expect(resolveTextCopyContent({ text: 'id-1' }, 'fallback')).toBe('id-1')
    expect(resolveTextCopyContent({}, 'fallback')).toBe('fallback')
  })
})

describe('menu collapsed search', () => {
  it('hides search whenever the menu is collapsed', () => {
    expect(shouldShowMenuSearch(true, false)).toBe(true)
    expect(shouldShowMenuSearch(true, true)).toBe(false)
    expect(shouldShowMenuSearch('auto', false)).toBe(true)
    expect(shouldShowMenuSearch('auto', true)).toBe(false)
    expect(shouldShowMenuSearch(false, false)).toBe(false)
    expect(resolveMenuSearchQuery(true, true, 'Roles')).toBe('')
    expect(resolveMenuSearchQuery('auto', false, 'Roles')).toBe('Roles')
    expect(resolveMenuSearchQuery(false, false, 'Administration')).toBe('Administration')
  })
})

describe('code highlight renderer', () => {
  it('returns null without a highlighter so the default stays plain text', () => {
    expect(renderCodeHighlightHtml('const x = 1', 'javascript', undefined)).toBeNull()
  })

  it('uses highlightCode when provided', () => {
    const html = renderCodeHighlightHtml('const x = 1', 'javascript', {
      highlightCode: (code, language) => `<span data-lang="${language}">${code}</span>`
    })
    expect(html).toBe('<span data-lang="javascript">const x = 1</span>')
  })
})

describe('fullscreen helpers', () => {
  afterEach(() => {
    clearRegisteredIcons()
  })

  it('reports unsupported outside a Fullscreen API document', () => {
    expect(isFullscreenSupported()).toBe(false)
  })
})
