import { afterEach, describe, expect, it } from 'vitest'
import { getBodyScrollLockCount, lockBodyScroll, resetBodyScrollLock } from '@expcat/tigercat-core'

describe('overlay scroll lock utilities', () => {
  afterEach(() => {
    resetBodyScrollLock()
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
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

  it('isolates lock counts per document', () => {
    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    const frameDocument = frame.contentDocument
    expect(frameDocument).toBeTruthy()

    const unlockMain = lockBodyScroll(document)
    const unlockFrame = lockBodyScroll(frameDocument!)

    expect(getBodyScrollLockCount(document)).toBe(1)
    expect(getBodyScrollLockCount(frameDocument!)).toBe(1)
    expect(document.body.style.overflow).toBe('hidden')
    expect(frameDocument!.body.style.overflow).toBe('hidden')

    unlockMain()
    expect(document.body.style.overflow).toBe('')
    expect(frameDocument!.body.style.overflow).toBe('hidden')

    unlockFrame()
    expect(frameDocument!.body.style.overflow).toBe('')
    frame.remove()
  })
})
