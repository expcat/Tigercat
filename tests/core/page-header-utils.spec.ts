/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  PAGE_HEADER_DEFAULT_BACK_ARIA_LABEL,
  getPageHeaderBackButtonClasses,
  getPageHeaderRootClasses,
  hasPageHeaderHeadingContent,
  pageHeaderActionsClasses,
  pageHeaderBackButtonClasses,
  pageHeaderHeadingRowClasses,
  pageHeaderRootClasses,
  pageHeaderStartClasses,
  resolvePageHeaderBackAriaLabel,
  resolvePageHeaderBackVisibility
} from '@expcat/tigercat-core'

describe('page-header-utils', () => {
  describe('resolvePageHeaderBackVisibility', () => {
    it('hides the control by default', () => {
      expect(resolvePageHeaderBackVisibility({})).toBe(false)
    })

    it('shows the control when showBack is true', () => {
      expect(resolvePageHeaderBackVisibility({ showBack: true })).toBe(true)
    })

    it('hides the control when showBack is false even if a handler exists', () => {
      expect(
        resolvePageHeaderBackVisibility({
          showBack: false,
          hasHandler: true,
          hasBackHref: true,
          hasBackOverride: true
        })
      ).toBe(false)
    })

    it('infers visibility from a handler, href, or custom override', () => {
      expect(resolvePageHeaderBackVisibility({ hasHandler: true })).toBe(true)
      expect(resolvePageHeaderBackVisibility({ hasBackHref: true })).toBe(true)
      expect(resolvePageHeaderBackVisibility({ hasBackOverride: true })).toBe(true)
    })
  })

  describe('resolvePageHeaderBackAriaLabel', () => {
    it('falls back to the default label', () => {
      expect(resolvePageHeaderBackAriaLabel()).toBe(PAGE_HEADER_DEFAULT_BACK_ARIA_LABEL)
      expect(resolvePageHeaderBackAriaLabel('')).toBe(PAGE_HEADER_DEFAULT_BACK_ARIA_LABEL)
      expect(resolvePageHeaderBackAriaLabel('   ')).toBe(PAGE_HEADER_DEFAULT_BACK_ARIA_LABEL)
    })

    it('keeps a custom non-empty label', () => {
      expect(resolvePageHeaderBackAriaLabel('返回')).toBe('返回')
    })
  })

  describe('hasPageHeaderHeadingContent', () => {
    it('is false when every region is empty', () => {
      expect(hasPageHeaderHeadingContent({})).toBe(false)
    })

    it('is true when any heading region is present', () => {
      expect(hasPageHeaderHeadingContent({ showBack: true })).toBe(true)
      expect(hasPageHeaderHeadingContent({ hasBreadcrumb: true })).toBe(true)
      expect(hasPageHeaderHeadingContent({ hasTitle: true })).toBe(true)
      expect(hasPageHeaderHeadingContent({ hasSubtitle: true })).toBe(true)
      expect(hasPageHeaderHeadingContent({ hasActions: true })).toBe(true)
    })
  })

  describe('class helpers', () => {
    it('exposes a flex heading layout with a right-aligned actions cluster', () => {
      expect(pageHeaderRootClasses).toContain('flex')
      expect(pageHeaderHeadingRowClasses).toContain('justify-between')
      expect(pageHeaderStartClasses).toContain('flex')
      expect(pageHeaderActionsClasses).not.toContain('ml-auto')
    })

    it('appends extra class names after the base classes', () => {
      expect(getPageHeaderRootClasses('custom')).toBe(pageHeaderRootClasses + ' custom')
      expect(getPageHeaderBackButtonClasses('extra')).toBe(pageHeaderBackButtonClasses + ' extra')
    })

    it('returns the bare base classes without extras', () => {
      expect(getPageHeaderRootClasses()).toBe(pageHeaderRootClasses)
      expect(getPageHeaderBackButtonClasses()).toBe(pageHeaderBackButtonClasses)
    })
  })
})
