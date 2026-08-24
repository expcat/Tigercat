/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  CONTEXT_MENU_ENTER_CLASS,
  CONTEXT_MENU_POINT_SIZE,
  CONTEXT_MENU_SUB_CHEVRON_PATH,
  DROPDOWN_ENTER_CLASS,
  getContextMenuContainerClasses,
  getContextMenuItemClasses,
  getContextMenuMenuClasses,
  getContextMenuOpenPoint,
  getContextMenuPointFromElement,
  getContextMenuPointFromEvent,
  getContextMenuPointStyle,
  getContextMenuSubTriggerClasses,
  getDropdownItemClasses,
  getDropdownMenuClasses,
  isContextMenuKeyboardEvent
} from '@expcat/tigercat-core'

describe('context-menu-utils', () => {
  describe('getContextMenuOpenPoint', () => {
    it('prefers pointer event coordinates', () => {
      expect(
        getContextMenuOpenPoint(
          { clientX: 80, clientY: 40 },
          { getBoundingClientRect: () => ({ left: 1, top: 2 }) }
        )
      ).toEqual({
        x: 80,
        y: 40
      })
    })

    it('falls back to an element rect when no event is given', () => {
      expect(
        getContextMenuPointFromElement({
          getBoundingClientRect: () => ({ left: 12, top: 24 })
        })
      ).toEqual({ x: 12, y: 24 })
      expect(
        getContextMenuOpenPoint(null, {
          getBoundingClientRect: () => ({ left: 12, top: 24 })
        })
      ).toEqual({ x: 12, y: 24 })
    })

    it('returns the origin when neither event nor element is available', () => {
      expect(getContextMenuOpenPoint(undefined, undefined)).toEqual({ x: 0, y: 0 })
    })

    it('reads client coordinates from an event helper', () => {
      expect(getContextMenuPointFromEvent({ clientX: 3, clientY: 7 })).toEqual({ x: 3, y: 7 })
    })
  })

  describe('getContextMenuPointStyle', () => {
    it('emits a 1px fixed virtual reference at the cursor', () => {
      expect(getContextMenuPointStyle({ x: 16, y: 32 })).toEqual({
        position: 'fixed',
        left: '16px',
        top: '32px',
        width: `${CONTEXT_MENU_POINT_SIZE}px`,
        height: `${CONTEXT_MENU_POINT_SIZE}px`,
        margin: '0px',
        padding: '0px',
        border: '0px',
        pointerEvents: 'none'
      })
    })
  })

  describe('isContextMenuKeyboardEvent', () => {
    it('treats ContextMenu and Shift+F10 as open keys', () => {
      expect(isContextMenuKeyboardEvent({ key: 'ContextMenu', shiftKey: false })).toBe(true)
      expect(isContextMenuKeyboardEvent({ key: 'F10', shiftKey: true })).toBe(true)
      expect(isContextMenuKeyboardEvent({ key: 'F10', shiftKey: false })).toBe(false)
      expect(isContextMenuKeyboardEvent({ key: 'Enter', shiftKey: false })).toBe(false)
    })
  })

  describe('class helpers', () => {
    it('reuses dropdown menu and item chrome', () => {
      expect(getContextMenuMenuClasses()).toContain(getDropdownMenuClasses())
      expect(getContextMenuItemClasses(true, true)).toContain(getDropdownItemClasses(true, true))
      expect(getContextMenuSubTriggerClasses(false)).toContain(
        getContextMenuItemClasses(false, false)
      )
      expect(getContextMenuContainerClasses()).toContain('tiger-context-menu')
      expect(CONTEXT_MENU_ENTER_CLASS).toBe(DROPDOWN_ENTER_CLASS)
      expect(CONTEXT_MENU_SUB_CHEVRON_PATH.length).toBeGreaterThan(0)
    })
  })
})
