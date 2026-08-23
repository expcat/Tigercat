/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  DROPDOWN_ENTER_CLASS,
  NAVIGATION_MENU_CHEVRON_PATH,
  NAVIGATION_MENU_DEFAULT_DELAY_DURATION,
  NAVIGATION_MENU_DEFAULT_OFFSET,
  NAVIGATION_MENU_DEFAULT_SKIP_DELAY_DURATION,
  NAVIGATION_MENU_ENTER_CLASS,
  getDropdownItemClasses,
  getDropdownMenuClasses,
  getNavigationMenuClasses,
  getNavigationMenuContentClasses,
  getNavigationMenuLinkClasses,
  getNavigationMenuListClasses,
  getNavigationMenuTriggerClasses,
  isNavigationMenuOpen,
  isNavigationMenuTriggerOpenKey,
  isNavigationMenuValueOpen,
  resolveNavigationMenuOpenValue,
  shouldSkipNavigationMenuOpenDelay
} from '@expcat/tigercat-core'

describe('navigation-menu-utils', () => {
  describe('open value', () => {
    it('treats null, undefined, and empty string as closed', () => {
      expect(isNavigationMenuOpen(null)).toBe(false)
      expect(isNavigationMenuOpen(undefined)).toBe(false)
      expect(isNavigationMenuOpen('')).toBe(false)
      expect(isNavigationMenuOpen('products')).toBe(true)
      expect(isNavigationMenuValueOpen('products', 'products')).toBe(true)
      expect(isNavigationMenuValueOpen('products', 'docs')).toBe(false)
    })

    it('honours a controlled open=false overlay', () => {
      expect(
        resolveNavigationMenuOpenValue({
          value: 'products',
          internalValue: 'products',
          open: false
        })
      ).toBeNull()
      expect(
        resolveNavigationMenuOpenValue({
          internalValue: 'products'
        })
      ).toBe('products')
    })
  })

  describe('hover delay', () => {
    it('skips delay only within the skip window after an open', () => {
      expect(shouldSkipNavigationMenuOpenDelay(0, 1000, 150)).toBe(false)
      expect(shouldSkipNavigationMenuOpenDelay(1000, 1100, 150)).toBe(true)
      expect(shouldSkipNavigationMenuOpenDelay(1000, 1200, 150)).toBe(false)
    })

    it('exposes the dropdown-aligned defaults', () => {
      expect(NAVIGATION_MENU_DEFAULT_DELAY_DURATION).toBe(100)
      expect(NAVIGATION_MENU_DEFAULT_SKIP_DELAY_DURATION).toBe(150)
      expect(NAVIGATION_MENU_DEFAULT_OFFSET).toBe(4)
    })
  })

  describe('keyboard helpers', () => {
    it('opens a panel with Enter, Space, or ArrowDown', () => {
      expect(isNavigationMenuTriggerOpenKey('Enter')).toBe(true)
      expect(isNavigationMenuTriggerOpenKey(' ')).toBe(true)
      expect(isNavigationMenuTriggerOpenKey('ArrowDown')).toBe(true)
      expect(isNavigationMenuTriggerOpenKey('ArrowRight')).toBe(false)
    })
  })

  describe('class helpers', () => {
    it('reuses dropdown menu chrome and enter animation', () => {
      expect(getNavigationMenuContentClasses(false)).toContain(getDropdownMenuClasses())
      expect(getNavigationMenuLinkClasses(true, true)).toContain(
        getDropdownItemClasses(true, false)
      )
      expect(getNavigationMenuClasses()).toContain('tiger-navigation-menu')
      expect(getNavigationMenuListClasses()).toContain('tiger-navigation-menu-list')
      expect(getNavigationMenuTriggerClasses(false, true)).toContain(
        'tiger-navigation-menu-trigger'
      )
      expect(NAVIGATION_MENU_ENTER_CLASS).toBe(DROPDOWN_ENTER_CLASS)
      expect(NAVIGATION_MENU_CHEVRON_PATH.length).toBeGreaterThan(0)
    })
  })
})
