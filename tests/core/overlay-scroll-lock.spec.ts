import { afterEach, describe, expect, it } from 'vitest'
import { getBodyScrollLockCount, lockBodyScroll } from '@expcat/tigercat-core'

describe('overlay scroll lock utilities', () => {
  afterEach(() => {
    document.body.style.overflow = ''
  })

  it('locks body scrolling and restores the previous overflow', () => {
    document.body.style.overflow = 'auto'

    const unlock = lockBodyScroll()

    expect(document.body.style.overflow).toBe('hidden')
    expect(getBodyScrollLockCount()).toBe(1)

    unlock()

    expect(document.body.style.overflow).toBe('auto')
    expect(getBodyScrollLockCount()).toBe(0)
  })

  it('keeps scrolling locked until all overlays release', () => {
    const unlockFirst = lockBodyScroll()
    const unlockSecond = lockBodyScroll()

    unlockFirst()

    expect(document.body.style.overflow).toBe('hidden')
    expect(getBodyScrollLockCount()).toBe(1)

    unlockSecond()

    expect(document.body.style.overflow).toBe('')
    expect(getBodyScrollLockCount()).toBe(0)
  })
})
