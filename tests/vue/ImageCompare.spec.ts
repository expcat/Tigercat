/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { h } from 'vue'
import { ImageCompare } from '@expcat/tigercat-vue/ImageCompare'
import { expectNoA11yViolationsIsolated } from '../utils'

function getRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-image-compare]') as HTMLElement
}

function getHandle(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-image-compare-handle]') as HTMLElement
}

function stubRootRect(root: HTMLElement, width = 200, height = 100): void {
  root.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      right: width,
      bottom: height,
      width,
      height,
      x: 0,
      y: 0,
      toJSON: () => ({})
    }) as DOMRect
}

describe('ImageCompare', () => {
  describe('Rendering', () => {
    it('renders before/after images and a labeled slider handle at 50%', () => {
      const { container } = render(ImageCompare, {
        props: {
          beforeSrc: '/before.jpg',
          afterSrc: '/after.jpg',
          beforeAlt: 'Before',
          afterAlt: 'After'
        }
      })
      const root = getRoot(container)
      const handle = getHandle(container)
      const beforeImg = container.querySelector('[data-image-compare-before] img')
      const afterImg = container.querySelector('[data-image-compare-after] img')

      expect(root).toHaveAttribute('data-image-compare-orientation', 'horizontal')
      expect(root).toHaveAttribute('data-image-compare-position', '50')
      expect(beforeImg).toHaveAttribute('src', '/before.jpg')
      expect(beforeImg).toHaveAttribute('alt', 'Before')
      expect(afterImg).toHaveAttribute('src', '/after.jpg')
      expect(afterImg).toHaveAttribute('alt', 'After')
      expect(handle).toHaveAttribute('role', 'slider')
      expect(handle).toHaveAttribute('aria-valuenow', '50')
      expect(handle).toHaveAttribute('aria-valuemin', '0')
      expect(handle).toHaveAttribute('aria-valuemax', '100')
      expect(handle).toHaveAttribute('aria-orientation', 'horizontal')
      expect(screen.getByRole('slider', { name: 'Image comparison' })).toBe(handle)
    })

    it('renders vertical orientation and custom initial position', () => {
      const { container } = render(ImageCompare, {
        props: {
          beforeSrc: '/b.jpg',
          afterSrc: '/a.jpg',
          orientation: 'vertical',
          defaultPosition: 30
        }
      })
      const root = getRoot(container)
      expect(root).toHaveAttribute('data-image-compare-orientation', 'vertical')
      expect(root).toHaveAttribute('data-image-compare-position', '30')
      expect(getHandle(container)).toHaveAttribute('aria-orientation', 'vertical')
      expect(getHandle(container)).toHaveAttribute('aria-valuenow', '30')
    })

    it('prefers before/after slots over src props', () => {
      const { container } = render(ImageCompare, {
        props: { beforeSrc: '/ignored-before.jpg', afterSrc: '/ignored-after.jpg' },
        slots: {
          before: () => h('span', { 'data-slot': 'before' }, 'Before slot'),
          after: () => h('span', { 'data-slot': 'after' }, 'After slot')
        }
      })
      expect(container.querySelector('[data-slot="before"]')).toHaveTextContent('Before slot')
      expect(container.querySelector('[data-slot="after"]')).toHaveTextContent('After slot')
      expect(container.querySelector('img')).toBeNull()
    })
  })

  describe('keyboard', () => {
    it('emits update:position and change on arrow keys', async () => {
      const onUpdate = vi.fn()
      const onChange = vi.fn()
      const { container } = render(ImageCompare, {
        props: {
          beforeSrc: '/b.jpg',
          afterSrc: '/a.jpg',
          position: 50,
          'onUpdate:position': onUpdate,
          onChange
        }
      })
      await fireEvent.keyDown(getHandle(container), { key: 'ArrowRight' })
      expect(onUpdate).toHaveBeenCalledWith(51)
      expect(onChange).toHaveBeenCalledWith(51)
    })

    it('does not emit when disabled', async () => {
      const onUpdate = vi.fn()
      const { container } = render(ImageCompare, {
        props: {
          beforeSrc: '/b.jpg',
          afterSrc: '/a.jpg',
          disabled: true,
          'onUpdate:position': onUpdate
        }
      })
      expect(getHandle(container)).toHaveAttribute('aria-disabled', 'true')
      expect(getHandle(container)).toHaveAttribute('tabindex', '-1')
      await fireEvent.keyDown(getHandle(container), { key: 'ArrowRight' })
      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('clamps Home and End to the edges', async () => {
      const onUpdate = vi.fn()
      const { container } = render(ImageCompare, {
        props: {
          beforeSrc: '/b.jpg',
          afterSrc: '/a.jpg',
          position: 50,
          'onUpdate:position': onUpdate
        }
      })
      await fireEvent.keyDown(getHandle(container), { key: 'Home' })
      expect(onUpdate).toHaveBeenCalledWith(0)
      await fireEvent.keyDown(getHandle(container), { key: 'End' })
      expect(onUpdate).toHaveBeenCalledWith(100)
    })
  })

  describe('pointer drag', () => {
    it('updates position from pointer location on the comparison surface', async () => {
      const onChange = vi.fn()
      const { container } = render(ImageCompare, {
        props: {
          beforeSrc: '/b.jpg',
          afterSrc: '/a.jpg',
          defaultPosition: 50,
          onChange
        }
      })
      const root = getRoot(container)
      stubRootRect(root)
      await fireEvent.mouseDown(root, { clientX: 80, clientY: 10, button: 0 })
      expect(onChange).toHaveBeenCalledWith(40)
      expect(root).toHaveAttribute('data-image-compare-position', '40')
      await fireEvent.mouseMove(document, { clientX: 160, clientY: 10 })
      expect(onChange).toHaveBeenCalledWith(80)
      await fireEvent.mouseUp(document)
      expect(root).toHaveAttribute('data-image-compare-dragging', 'false')
    })
  })

  describe('controlled and uncontrolled', () => {
    it('follows the position prop when controlled', async () => {
      const { container, rerender } = render(ImageCompare, {
        props: { beforeSrc: '/b.jpg', afterSrc: '/a.jpg', position: 20 }
      })
      expect(getHandle(container)).toHaveAttribute('aria-valuenow', '20')
      await rerender({ beforeSrc: '/b.jpg', afterSrc: '/a.jpg', position: 80 })
      expect(getHandle(container)).toHaveAttribute('aria-valuenow', '80')
    })

    it('updates internally in uncontrolled mode', async () => {
      const { container } = render(ImageCompare, {
        props: { beforeSrc: '/b.jpg', afterSrc: '/a.jpg', defaultPosition: 50 }
      })
      const handle = getHandle(container)
      expect(handle).toHaveAttribute('aria-valuenow', '50')
      await fireEvent.keyDown(handle, { key: 'ArrowRight' })
      expect(handle).toHaveAttribute('aria-valuenow', '51')
    })
  })

  describe('attrs integration', () => {
    it('merges attrs class, className, and style onto the root', () => {
      const { container } = render(ImageCompare, {
        props: {
          beforeSrc: '/b.jpg',
          afterSrc: '/a.jpg',
          className: 'from-prop',
          style: { color: 'red' },
          width: 320,
          height: 180
        },
        attrs: { class: 'from-attr', id: 'compare' }
      })
      const root = getRoot(container)
      expect(root.id).toBe('compare')
      expect(root.className).toContain('from-prop')
      expect(root.className).toContain('from-attr')
      expect(root.className).toContain('tiger-image-compare')
      expect(root.style.color).toBe('red')
      expect(root.style.width).toBe('320px')
      expect(root.style.height).toBe('180px')
    })

    it('lets a native aria-label override the default on the handle', () => {
      const { container } = render(ImageCompare, {
        props: { beforeSrc: '/b.jpg', afterSrc: '/a.jpg' },
        attrs: { 'aria-label': 'Renovation progress' }
      })
      expect(getHandle(container)).toHaveAttribute('aria-label', 'Renovation progress')
    })
  })

  describe('a11y', () => {
    it('exposes a keyboard-operable slider with image alts', async () => {
      const { container } = render(ImageCompare, {
        props: {
          beforeSrc: '/b.jpg',
          afterSrc: '/a.jpg',
          beforeAlt: 'Original photo',
          afterAlt: 'Edited photo'
        }
      })
      const handle = getHandle(container)
      handle.focus()
      expect(handle).toHaveFocus()
      expect(screen.getByAltText('Original photo')).toBeInTheDocument()
      expect(screen.getByAltText('Edited photo')).toBeInTheDocument()
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('boundary', () => {
    it('renders empty panes when sources and slots are missing', () => {
      const { container } = render(ImageCompare)
      expect(getRoot(container).querySelectorAll('img')).toHaveLength(0)
      expect(getHandle(container)).toHaveAttribute('aria-valuenow', '50')
    })
  })
})
