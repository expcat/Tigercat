/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import {
  createAriaId,
  isActivationKey,
  isEnterKey,
  isEscapeKey,
  isSpaceKey,
  isTabKey
} from '@tigercat/core'

describe('a11y-utils (core)', () => {
  it('createAriaId should generate unique ids with default prefix', () => {
    const id1 = createAriaId()
    const id2 = createAriaId()

    expect(id1).toMatch(/^tigercat-\d+$/)
    expect(id2).toMatch(/^tigercat-\d+$/)
    expect(id1).not.toEqual(id2)
  })

  it('createAriaId should support custom prefix and separator', () => {
    const id = createAriaId({ prefix: 'tiger', separator: '_' })
    expect(id).toMatch(/^tiger_\d+$/)
  })

  it('key helpers should detect Enter', () => {
    expect(isEnterKey({ key: 'Enter' })).toBe(true)
    expect(isEnterKey({ code: 'Enter' })).toBe(true)
    expect(isEnterKey({ keyCode: 13 })).toBe(true)
    expect(isEnterKey({ key: ' ' })).toBe(false)
  })

  it('key helpers should detect Space', () => {
    expect(isSpaceKey({ key: ' ' })).toBe(true)
    expect(isSpaceKey({ key: 'Spacebar' })).toBe(true)
    expect(isSpaceKey({ code: 'Space' })).toBe(true)
    expect(isSpaceKey({ keyCode: 32 })).toBe(true)
    expect(isSpaceKey({ key: 'Enter' })).toBe(false)
  })

  it('isActivationKey should detect Enter or Space', () => {
    expect(isActivationKey({ key: 'Enter' })).toBe(true)
    expect(isActivationKey({ key: ' ' })).toBe(true)
    expect(isActivationKey({ key: 'Escape' })).toBe(false)
  })

  it('key helpers should detect Escape', () => {
    expect(isEscapeKey({ key: 'Escape' })).toBe(true)
    expect(isEscapeKey({ code: 'Escape' })).toBe(true)
    expect(isEscapeKey({ keyCode: 27 })).toBe(true)
    expect(isEscapeKey({ key: 'Enter' })).toBe(false)
  })

  it('key helpers should detect Tab', () => {
    expect(isTabKey({ key: 'Tab' })).toBe(true)
    expect(isTabKey({ code: 'Tab' })).toBe(true)
    expect(isTabKey({ keyCode: 9 })).toBe(true)
    expect(isTabKey({ key: 'Enter' })).toBe(false)
  })
})
