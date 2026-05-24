import { describe, it, expect } from 'vitest'
import {
  breadcrumbContainerClasses,
  breadcrumbCurrentClasses,
  breadcrumbEllipsisClasses,
  breadcrumbItemBaseClasses,
  breadcrumbLinkClasses,
  breadcrumbSeparatorBaseClasses,
  getBreadcrumbCollapsedItems,
  getBreadcrumbItemClasses,
  getBreadcrumbLinkClasses,
  getBreadcrumbSeparatorClasses,
  getSeparatorContent
} from '@expcat/tigercat-core'

describe('breadcrumb-utils', () => {
  it('exports stable breadcrumb class constants', () => {
    expect(breadcrumbContainerClasses).toContain('flex')
    expect(breadcrumbItemBaseClasses).toContain('inline-flex')
    expect(breadcrumbLinkClasses).toContain('cursor-pointer')
    expect(breadcrumbCurrentClasses).toContain('cursor-default')
    expect(breadcrumbSeparatorBaseClasses).toContain('select-none')
    expect(breadcrumbEllipsisClasses).toContain('px-1')
  })

  it('merges optional item and separator classes', () => {
    expect(getBreadcrumbItemClasses()).toBe(breadcrumbItemBaseClasses)
    expect(getBreadcrumbItemClasses('custom-item')).toContain('custom-item')
    expect(getBreadcrumbSeparatorClasses()).toBe(breadcrumbSeparatorBaseClasses)
    expect(getBreadcrumbSeparatorClasses('custom-separator')).toContain('custom-separator')
  })

  it('returns current and clickable link classes', () => {
    expect(getBreadcrumbLinkClasses(true)).toBe(breadcrumbCurrentClasses)
    expect(getBreadcrumbLinkClasses(false)).toBe(breadcrumbLinkClasses)
    expect(getBreadcrumbLinkClasses()).toBe(breadcrumbLinkClasses)
  })

  it('resolves built-in and custom separators', () => {
    expect(getSeparatorContent()).toBe('/')
    expect(getSeparatorContent('slash')).toBe('/')
    expect(getSeparatorContent('arrow')).toBe('→')
    expect(getSeparatorContent('chevron')).toBe('›')
    expect(getSeparatorContent('·')).toBe('·')
  })

  it('shows all items when maxItems is disabled or large enough', () => {
    expect(getBreadcrumbCollapsedItems(4, 0)).toEqual({ visible: [0, 1, 2, 3], collapsed: [] })
    expect(getBreadcrumbCollapsedItems(4, 4)).toEqual({ visible: [0, 1, 2, 3], collapsed: [] })
    expect(getBreadcrumbCollapsedItems(4, 10)).toEqual({ visible: [0, 1, 2, 3], collapsed: [] })
  })

  it('keeps the first item and trailing items when collapsed', () => {
    expect(getBreadcrumbCollapsedItems(6, 3)).toEqual({
      visible: [0, 4, 5],
      collapsed: [1, 2, 3]
    })
    expect(getBreadcrumbCollapsedItems(5, 2)).toEqual({
      visible: [0, 4],
      collapsed: [1, 2, 3]
    })
  })
})
