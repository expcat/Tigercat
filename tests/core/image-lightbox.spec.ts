import { describe, it, expect } from 'vitest'
import {
  clampLightboxIndex,
  createLightboxGestureSession,
  formatLightboxImageAlt,
  getLightboxNavState,
  lightboxShouldClose,
  resolveLightboxImages,
  resolveLightboxKeyAction,
  resolveLightboxNavIndex,
  resolveLightboxScaleRange,
  resolveLightboxSwipe
} from '@expcat/tigercat-core'

describe('lightbox gallery', () => {
  it('resolves string URLs and object items', () => {
    expect(resolveLightboxImages(['a.jpg', { src: 'b.jpg', alt: 'Bee' }])).toEqual([
      { src: 'a.jpg' },
      { src: 'b.jpg', alt: 'Bee' }
    ])
  })

  it('treats a missing list as empty', () => {
    expect(resolveLightboxImages(undefined)).toEqual([])
  })

  it('clamps the current index and never uses modulo of 0', () => {
    expect(clampLightboxIndex(9, 3)).toBe(2)
    expect(clampLightboxIndex(-2, 3)).toBe(0)
    expect(clampLightboxIndex(1, 0)).toBe(0)
    expect(clampLightboxIndex(Number.NaN, 3)).toBe(0)
  })

  it('closes when open with an empty gallery', () => {
    expect(lightboxShouldClose(true, 0)).toBe(true)
    expect(lightboxShouldClose(true, 2)).toBe(false)
    expect(lightboxShouldClose(false, 0)).toBe(false)
  })
})

describe('lightbox alt and nav', () => {
  it('uses the item alt, including empty decorative alt', () => {
    expect(
      formatLightboxImageAlt({ src: 'a.jpg', alt: 'Cat' }, 0, 2, 'Image {index} of {total}')
    ).toBe('Cat')
    expect(
      formatLightboxImageAlt({ src: 'a.jpg', alt: '' }, 0, 2, 'Image {index} of {total}')
    ).toBe('')
  })

  it('fills the locale template when alt is omitted', () => {
    expect(formatLightboxImageAlt({ src: 'a.jpg' }, 1, 3, 'Image {index} of {total}')).toBe(
      'Image 2 of 3'
    )
  })

  it('stops at the ends instead of wrapping', () => {
    expect(resolveLightboxNavIndex(0, 3, 'prev')).toBeNull()
    expect(resolveLightboxNavIndex(2, 3, 'next')).toBeNull()
    expect(resolveLightboxNavIndex(0, 3, 'next')).toBe(1)
    expect(resolveLightboxNavIndex(0, 1, 'next')).toBeNull()
    expect(resolveLightboxNavIndex(0, 0, 'prev')).toBeNull()
  })

  it('clamps nav state like the display index', () => {
    expect(getLightboxNavState(9, 3)).toEqual({ hasPrev: true, hasNext: false, counter: '3 / 3' })
  })
})

describe('lightbox gestures and keys', () => {
  it('maps a horizontal swipe past the threshold', () => {
    expect(resolveLightboxSwipe(-80, 4, 48)).toBe('next')
    expect(resolveLightboxSwipe(80, 4, 48)).toBe('prev')
    expect(resolveLightboxSwipe(-20, 4, 48)).toBeNull()
    expect(resolveLightboxSwipe(-80, 90, 48)).toBeNull()
  })

  it('maps zoom and rotate keys and honors dir for arrows', () => {
    expect(
      resolveLightboxKeyAction('ArrowLeft', { canNavigate: true, zoomable: true, rotatable: true })
    ).toBe('prev')
    expect(
      resolveLightboxKeyAction('ArrowLeft', {
        canNavigate: true,
        zoomable: true,
        rotatable: true,
        rtl: true
      })
    ).toBe('next')
    expect(
      resolveLightboxKeyAction('ArrowRight', {
        canNavigate: false,
        zoomable: true,
        rotatable: true
      })
    ).toBeNull()
    expect(
      resolveLightboxKeyAction('+', { canNavigate: true, zoomable: true, rotatable: false })
    ).toBe('zoomIn')
    expect(
      resolveLightboxKeyAction('[', { canNavigate: true, zoomable: true, rotatable: true })
    ).toBe('rotateLeft')
    expect(
      resolveLightboxKeyAction('-', { canNavigate: true, zoomable: false, rotatable: true })
    ).toBeNull()
  })

  it('maps minZoom onto minScale', () => {
    expect(resolveLightboxScaleRange({ minZoom: 0.75, maxZoom: 2 })).toEqual({
      minScale: 0.75,
      maxScale: 2
    })
    expect(resolveLightboxScaleRange({ minScale: 0.4, minZoom: 0.9 })).toEqual({
      minScale: 0.4,
      maxScale: 5
    })
  })

  it('pinches with clientX/clientY so scale follows finger distance', () => {
    const scales: number[] = []
    const session = createLightboxGestureSession({
      getScale: () => 1,
      getTranslate: () => ({ x: 0, y: 0 }),
      minScale: 0.25,
      maxScale: 5,
      zoomable: true,
      swipeable: false,
      swipeThreshold: 48,
      imageCount: 1,
      onTransform: (next) => {
        if (typeof next.scale === 'number') scales.push(next.scale)
      },
      onSwipe: () => {},
      ownerDocument: document
    })

    session.pointerDown(
      new PointerEvent('pointerdown', {
        bubbles: true,
        pointerId: 1,
        pointerType: 'touch',
        clientX: 0,
        clientY: 0
      })
    )
    session.pointerDown(
      new PointerEvent('pointerdown', {
        bubbles: true,
        pointerId: 2,
        pointerType: 'touch',
        clientX: 100,
        clientY: 0
      })
    )
    document.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        pointerId: 2,
        pointerType: 'touch',
        clientX: 200,
        clientY: 0
      })
    )

    expect(scales.at(-1)).toBe(2)
    session.dispose()
  })
})
