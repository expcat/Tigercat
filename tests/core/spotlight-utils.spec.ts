import { describe, expect, it } from 'vitest'
import {
  getSpotlightFuzzyScore,
  getSpotlightSearchState,
  getSpotlightSearchText,
  getSpotlightShortcutLabel,
  normalizeSpotlightText,
  type SpotlightItem
} from '@expcat/tigercat-core'

const items: SpotlightItem[] = [
  {
    key: 'dashboard',
    label: 'Open Dashboard',
    description: 'View metrics',
    group: 'Navigation',
    keywords: ['home']
  },
  {
    key: 'docs',
    label: 'Search Documentation',
    group: 'Navigation',
    keywords: ['help']
  },
  {
    key: 'invite',
    label: 'Invite teammate',
    group: 'Actions',
    disabled: true
  }
]

describe('spotlight-utils', () => {
  it('normalizes diacritics, case and whitespace', () => {
    expect(normalizeSpotlightText('  Café  ')).toBe('cafe')
  })

  it('builds searchable text from label, description, group and keywords', () => {
    expect(getSpotlightSearchText(items[0])).toContain('Open Dashboard')
    expect(getSpotlightSearchText(items[0])).toContain('View metrics')
    expect(getSpotlightSearchText(items[0])).toContain('home')
  })

  it('scores exact matches ahead of partial fuzzy matches', () => {
    const exact = getSpotlightFuzzyScore('open dashboard', 'Open Dashboard')
    const fuzzy = getSpotlightFuzzyScore('od', 'Open Dashboard')

    expect(exact).toBeLessThan(fuzzy)
  })

  it('returns infinity for non matching fuzzy queries', () => {
    expect(getSpotlightFuzzyScore('zzz', 'Open Dashboard')).toBe(Number.POSITIVE_INFINITY)
  })

  it('keeps original order for empty query', () => {
    const state = getSpotlightSearchState(items, '')

    expect(state.flatResults.map((result) => result.item.key)).toEqual([
      'dashboard',
      'docs',
      'invite'
    ])
  })

  it('filters and groups matching results', () => {
    const state = getSpotlightSearchState(items, 'help')

    expect(state.flatResults.map((result) => result.item.key)).toEqual(['docs'])
    expect(state.groups).toHaveLength(1)
    expect(state.groups[0].label).toBe('Navigation')
  })

  it('supports custom item filters and limits', () => {
    const state = getSpotlightSearchState(items, 'anything', {
      filterItem: (_query, item) => item.group === 'Navigation',
      limit: 1
    })

    expect(state.flatResults).toHaveLength(1)
    expect(state.flatResults[0].item.group).toBe('Navigation')
  })

  it('formats shortcut labels', () => {
    expect(getSpotlightShortcutLabel(['⌘', 'K'])).toBe('⌘ K')
    expect(getSpotlightShortcutLabel('Ctrl K')).toBe('Ctrl K')
    expect(getSpotlightShortcutLabel(undefined)).toBe('')
  })
})
