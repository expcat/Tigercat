/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  buildOverlayTriggerHandlerMap,
  getOverlayTriggerAria,
  getOverlayTriggerKeyboardAction,
  isNativeOverlayTriggerType,
  shouldMergeOverlayTriggerChild
} from '@expcat/tigercat-core'

describe('overlay-trigger', () => {
  it('merges onto native button/a even without asChild', () => {
    expect(isNativeOverlayTriggerType('button')).toBe(true)
    expect(isNativeOverlayTriggerType('a')).toBe(true)
    expect(shouldMergeOverlayTriggerChild(false, 'button')).toBe(true)
    expect(shouldMergeOverlayTriggerChild(false, 'span')).toBe(false)
    expect(shouldMergeOverlayTriggerChild(true, 'span')).toBe(true)
    expect(
      shouldMergeOverlayTriggerChild(false, function Button() {
        return null
      })
    ).toBe(true)
    expect(shouldMergeOverlayTriggerChild(false, Symbol('text'))).toBe(false)
  })

  it('puts haspopup and expanded on the trigger, not when disabled-open', () => {
    expect(getOverlayTriggerAria({ kind: 'menu', open: true, controlsId: 'm1' })).toMatchObject({
      'aria-haspopup': 'menu',
      'aria-expanded': true,
      'aria-controls': 'm1',
      'data-state': 'open'
    })

    expect(getOverlayTriggerAria({ kind: 'dialog', open: false, disabled: true })).toMatchObject({
      'aria-haspopup': 'dialog',
      'aria-expanded': false,
      'data-state': 'closed',
      disabled: true
    })
  })

  it('only writes describedby for an open tooltip', () => {
    expect(
      getOverlayTriggerAria({ kind: 'tooltip', open: false, describedBy: 't1' })['aria-describedby']
    ).toBeUndefined()
    expect(
      getOverlayTriggerAria({ kind: 'tooltip', open: true, describedBy: 't1' })['aria-describedby']
    ).toBe('t1')
    expect(getOverlayTriggerAria({ kind: 'tooltip', open: true })['aria-haspopup']).toBeUndefined()
  })

  it('opens a menu button with arrows and a context menu with Shift+F10', () => {
    expect(
      getOverlayTriggerKeyboardAction({ key: 'ArrowDown' }, { kind: 'menu', open: false })
    ).toBe('open-first')
    expect(getOverlayTriggerKeyboardAction({ key: 'ArrowUp' }, { kind: 'menu', open: false })).toBe(
      'open-last'
    )
    expect(
      getOverlayTriggerKeyboardAction({ key: 'Enter' }, { kind: 'menu', open: false })
    ).toBeNull()
    expect(
      getOverlayTriggerKeyboardAction(
        { key: 'F10', shiftKey: true },
        { kind: 'context-menu', open: false }
      )
    ).toBe('open')
    expect(
      getOverlayTriggerKeyboardAction({ key: 'ContextMenu' }, { kind: 'context-menu', open: false })
    ).toBe('open')
  })

  it('co-joins hover with click and focus', () => {
    const hover = buildOverlayTriggerHandlerMap(
      'hover',
      { toggle: 'toggle', show: 'show', hide: 'hide' },
      'react'
    )
    expect(hover).toMatchObject({
      onClick: 'toggle',
      onMouseEnter: 'show',
      onMouseLeave: 'hide',
      onFocus: 'show',
      onBlur: 'hide'
    })

    const click = buildOverlayTriggerHandlerMap(
      'click',
      { toggle: 'toggle', show: 'show', hide: 'hide' },
      'vue'
    )
    expect(click).toEqual({ onClick: 'toggle' })
  })
})
