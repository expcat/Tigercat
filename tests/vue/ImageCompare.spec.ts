/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { h } from 'vue'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { ImageCompare } from '@expcat/tigercat-vue/ImageCompare'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
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

function getImageCompareClip(container: HTMLElement): string {
  const before = container.querySelector('[data-image-compare-before]') as HTMLElement
  return before.style.clipPath
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
      expect(screen.getByRole('slider')).toBe(handle)
    })

    it('names the slider from ConfigProvider locale when no override is passed', () => {
      const { container } = render({
        components: { ConfigProvider, ImageCompare },
        setup() {
          return { zhCN }
        },
        template: `
          <ConfigProvider :locale="zhCN">
            <ImageCompare before-src="/b.jpg" after-src="/a.jpg" />
          </ConfigProvider>
        `
      })
      expect(getHandle(container)).toHaveAttribute('aria-label', '图片对比')
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

    it('decreases on ArrowRight in RTL horizontal mode', async () => {
      const onUpdate = vi.fn()
      const { container } = render(ImageCompare, {
        props: {
          beforeSrc: '/b.jpg',
          afterSrc: '/a.jpg',
          position: 30,
          'onUpdate:position': onUpdate
        },
        attrs: { dir: 'rtl' }
      })
      expect(getImageCompareClip(container)).toContain('inset(0 0 0 70%)')
      await fireEvent.keyDown(getHandle(container), { key: 'ArrowRight' })
      expect(onUpdate).toHaveBeenCalledWith(29)
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
      await fireEvent.pointerDown(root, { pointerId: 1, clientX: 80, clientY: 10, button: 0 })
      expect(onChange).toHaveBeenCalledWith(40)
      expect(root).toHaveAttribute('data-image-compare-position', '40')
      await fireEvent.pointerMove(document, { pointerId: 1, clientX: 160, clientY: 10 })
      expect(onChange).toHaveBeenCalledWith(80)
      await fireEvent.pointerUp(document, { pointerId: 1 })
      expect(root).toHaveAttribute('data-image-compare-dragging', 'false')
    })

    it('stops dragging on pointercancel', async () => {
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
      await fireEvent.pointerDown(root, { pointerId: 1, clientX: 80, clientY: 10, button: 0 })
      onChange.mockClear()
      await fireEvent.pointerCancel(document, { pointerId: 1 })
      expect(root).toHaveAttribute('data-image-compare-dragging', 'false')
      await fireEvent.pointerMove(document, { pointerId: 1, clientX: 160, clientY: 10 })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('does not start a drag when the user listener prevents default', async () => {
      const onChange = vi.fn()
      const { container } = render(ImageCompare, {
        props: {
          beforeSrc: '/b.jpg',
          afterSrc: '/a.jpg',
          onChange
        },
        attrs: {
          onPointerdown: (event: PointerEvent) => event.preventDefault()
        }
      })
      stubRootRect(getRoot(container))
      await fireEvent.pointerDown(getRoot(container), {
        pointerId: 1,
        clientX: 80,
        clientY: 10,
        button: 0
      })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('lets a visible after-slot button receive click without moving the handle', async () => {
      const onChange = vi.fn()
      const onClick = vi.fn()
      const { container } = render(ImageCompare, {
        props: {
          beforeSrc: '/b.jpg',
          afterSrc: '/a.jpg',
          position: 20,
          onChange
        },
        slots: {
          after: () =>
            h(
              'button',
              {
                type: 'button',
                onClick
              },
              'After action'
            )
        }
      })
      await fireEvent.click(screen.getByRole('button', { name: 'After action' }))
      expect(onClick).toHaveBeenCalled()
      expect(onChange).not.toHaveBeenCalled()
      expect(getRoot(container)).toHaveAttribute('data-image-compare-dragging', 'false')
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

    it('keeps the last position when dropping controlled position', async () => {
      const { container, rerender } = render(ImageCompare, {
        props: { beforeSrc: '/b.jpg', afterSrc: '/a.jpg', position: 80 }
      })
      await rerender({ beforeSrc: '/b.jpg', afterSrc: '/a.jpg', position: undefined })
      expect(getHandle(container)).toHaveAttribute('aria-valuenow', '80')
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

    it('omits aria-label when named by aria-labelledby', () => {
      const { container } = render(ImageCompare, {
        props: { beforeSrc: '/b.jpg', afterSrc: '/a.jpg' },
        attrs: { 'aria-labelledby': 'compare-name' }
      })
      expect(getHandle(container)).not.toHaveAttribute('aria-label')
      expect(getHandle(container)).toHaveAttribute('aria-labelledby', 'compare-name')
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
