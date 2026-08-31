/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { ImageCompare } from '@expcat/tigercat-react/ImageCompare'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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
      const { container } = render(
        <ImageCompare
          beforeSrc="/before.jpg"
          afterSrc="/after.jpg"
          beforeAlt="Before"
          afterAlt="After"
        />
      )
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
      const { container } = render(
        <ConfigProvider locale={zhCN}>
          <ImageCompare beforeSrc="/b.jpg" afterSrc="/a.jpg" />
        </ConfigProvider>
      )
      expect(getHandle(container)).toHaveAttribute('aria-label', '图片对比')
    })

    it('forwards the ref to the root surface', () => {
      const rootRef = React.createRef<HTMLDivElement>()
      const { container } = render(
        <ImageCompare ref={rootRef} id="compare" beforeSrc="/b.jpg" afterSrc="/a.jpg" />
      )
      expect(rootRef.current).toBe(getRoot(container))
      expect(getRoot(container).id).toBe('compare')
    })

    it('renders vertical orientation and custom initial position', () => {
      const { container } = render(
        <ImageCompare
          beforeSrc="/b.jpg"
          afterSrc="/a.jpg"
          orientation="vertical"
          defaultPosition={30}
        />
      )
      const root = getRoot(container)
      expect(root).toHaveAttribute('data-image-compare-orientation', 'vertical')
      expect(root).toHaveAttribute('data-image-compare-position', '30')
      expect(getHandle(container)).toHaveAttribute('aria-orientation', 'vertical')
      expect(getHandle(container)).toHaveAttribute('aria-valuenow', '30')
    })

    it('prefers before/after nodes over src props', () => {
      const { container } = render(
        <ImageCompare
          beforeSrc="/ignored-before.jpg"
          afterSrc="/ignored-after.jpg"
          before={<span data-slot="before">Before slot</span>}
          after={<span data-slot="after">After slot</span>}
        />
      )
      expect(container.querySelector('[data-slot="before"]')).toHaveTextContent('Before slot')
      expect(container.querySelector('[data-slot="after"]')).toHaveTextContent('After slot')
      expect(container.querySelector('img')).toBeNull()
    })
  })

  describe('keyboard', () => {
    it('calls onChange on arrow keys', () => {
      const onChange = vi.fn()
      const { container } = render(
        <ImageCompare beforeSrc="/b.jpg" afterSrc="/a.jpg" position={50} onChange={onChange} />
      )
      fireEvent.keyDown(getHandle(container), { key: 'ArrowRight' })
      expect(onChange).toHaveBeenCalledWith(51)
    })

    it('decreases on ArrowRight in RTL horizontal mode', () => {
      const onChange = vi.fn()
      const { container } = render(
        <ImageCompare
          dir="rtl"
          beforeSrc="/b.jpg"
          afterSrc="/a.jpg"
          position={30}
          onChange={onChange}
        />
      )
      expect(getImageCompareClip(container)).toContain('inset(0 0 0 70%)')
      fireEvent.keyDown(getHandle(container), { key: 'ArrowRight' })
      expect(onChange).toHaveBeenCalledWith(29)
    })

    it('does not emit when disabled', () => {
      const onChange = vi.fn()
      const { container } = render(
        <ImageCompare beforeSrc="/b.jpg" afterSrc="/a.jpg" disabled onChange={onChange} />
      )
      expect(getHandle(container)).toHaveAttribute('aria-disabled', 'true')
      expect(getHandle(container)).toHaveAttribute('tabindex', '-1')
      fireEvent.keyDown(getHandle(container), { key: 'ArrowRight' })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('clamps Home and End to the edges', () => {
      const onChange = vi.fn()
      const { container } = render(
        <ImageCompare beforeSrc="/b.jpg" afterSrc="/a.jpg" position={50} onChange={onChange} />
      )
      fireEvent.keyDown(getHandle(container), { key: 'Home' })
      expect(onChange).toHaveBeenCalledWith(0)
      fireEvent.keyDown(getHandle(container), { key: 'End' })
      expect(onChange).toHaveBeenCalledWith(100)
    })
  })

  describe('pointer drag', () => {
    it('updates position from pointer location on the comparison surface', () => {
      const onChange = vi.fn()
      const { container } = render(
        <ImageCompare
          beforeSrc="/b.jpg"
          afterSrc="/a.jpg"
          defaultPosition={50}
          onChange={onChange}
        />
      )
      const root = getRoot(container)
      stubRootRect(root)
      fireEvent.pointerDown(root, { pointerId: 1, clientX: 80, clientY: 10, button: 0 })
      expect(onChange).toHaveBeenCalledWith(40)
      expect(root).toHaveAttribute('data-image-compare-position', '40')
      fireEvent.pointerMove(document, { pointerId: 1, clientX: 160, clientY: 10 })
      expect(onChange).toHaveBeenCalledWith(80)
      fireEvent.pointerUp(document, { pointerId: 1 })
      expect(root).toHaveAttribute('data-image-compare-dragging', 'false')
    })

    it('stops dragging on pointercancel', () => {
      const onChange = vi.fn()
      const { container } = render(
        <ImageCompare
          beforeSrc="/b.jpg"
          afterSrc="/a.jpg"
          defaultPosition={50}
          onChange={onChange}
        />
      )
      const root = getRoot(container)
      stubRootRect(root)
      fireEvent.pointerDown(root, { pointerId: 1, clientX: 80, clientY: 10, button: 0 })
      onChange.mockClear()
      fireEvent.pointerCancel(document, { pointerId: 1 })
      expect(root).toHaveAttribute('data-image-compare-dragging', 'false')
      fireEvent.pointerMove(document, { pointerId: 1, clientX: 160, clientY: 10 })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('does not start a drag when the user listener prevents default', () => {
      const onChange = vi.fn()
      const { container } = render(
        <ImageCompare
          beforeSrc="/b.jpg"
          afterSrc="/a.jpg"
          onChange={onChange}
          onPointerDown={(event) => event.preventDefault()}
        />
      )
      stubRootRect(getRoot(container))
      fireEvent.pointerDown(getRoot(container), {
        pointerId: 1,
        clientX: 80,
        clientY: 10,
        button: 0
      })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('lets a visible after-slot button receive click without moving the handle', () => {
      const onChange = vi.fn()
      const onClick = vi.fn()
      const { container } = render(
        <ImageCompare
          beforeSrc="/b.jpg"
          afterSrc="/a.jpg"
          position={20}
          onChange={onChange}
          after={
            <button type="button" onClick={onClick}>
              After action
            </button>
          }
        />
      )
      fireEvent.click(screen.getByRole('button', { name: 'After action' }))
      expect(onClick).toHaveBeenCalled()
      expect(onChange).not.toHaveBeenCalled()
      expect(getRoot(container)).toHaveAttribute('data-image-compare-dragging', 'false')
    })
  })

  describe('controlled and uncontrolled', () => {
    it('follows the position prop when controlled', () => {
      const { container, rerender } = render(
        <ImageCompare beforeSrc="/b.jpg" afterSrc="/a.jpg" position={20} />
      )
      expect(getHandle(container)).toHaveAttribute('aria-valuenow', '20')
      rerender(<ImageCompare beforeSrc="/b.jpg" afterSrc="/a.jpg" position={80} />)
      expect(getHandle(container)).toHaveAttribute('aria-valuenow', '80')
    })

    it('updates internally in uncontrolled mode', () => {
      const { container } = render(
        <ImageCompare beforeSrc="/b.jpg" afterSrc="/a.jpg" defaultPosition={50} />
      )
      const handle = getHandle(container)
      expect(handle).toHaveAttribute('aria-valuenow', '50')
      fireEvent.keyDown(handle, { key: 'ArrowRight' })
      expect(handle).toHaveAttribute('aria-valuenow', '51')
    })

    it('keeps the last position when dropping controlled position', () => {
      const { container, rerender } = render(
        <ImageCompare beforeSrc="/b.jpg" afterSrc="/a.jpg" position={80} />
      )
      rerender(<ImageCompare beforeSrc="/b.jpg" afterSrc="/a.jpg" />)
      expect(getHandle(container)).toHaveAttribute('aria-valuenow', '80')
    })
  })

  describe('style integration', () => {
    it('merges className and style onto the root', () => {
      const { container } = render(
        <ImageCompare
          beforeSrc="/b.jpg"
          afterSrc="/a.jpg"
          className="from-prop"
          style={{ color: 'red' }}
          width={320}
          height={180}
        />
      )
      const root = getRoot(container)
      expect(root.className).toContain('from-prop')
      expect(root.className).toContain('tiger-image-compare')
      expect(root.style.color).toBe('red')
      expect(root.style.width).toBe('320px')
      expect(root.style.height).toBe('180px')
    })

    it('lets a native aria-label override the default on the handle', () => {
      const { container } = render(
        <ImageCompare beforeSrc="/b.jpg" afterSrc="/a.jpg" aria-label="Renovation progress" />
      )
      expect(getHandle(container)).toHaveAttribute('aria-label', 'Renovation progress')
    })

    it('omits aria-label when named by aria-labelledby', () => {
      const { container } = render(
        <>
          <span id="compare-name">Renovation</span>
          <ImageCompare beforeSrc="/b.jpg" afterSrc="/a.jpg" aria-labelledby="compare-name" />
        </>
      )
      expect(getHandle(container)).not.toHaveAttribute('aria-label')
      expect(getHandle(container)).toHaveAttribute('aria-labelledby', 'compare-name')
    })
  })

  describe('a11y', () => {
    it('exposes a keyboard-operable slider with image alts', async () => {
      const { container } = render(
        <ImageCompare
          beforeSrc="/b.jpg"
          afterSrc="/a.jpg"
          beforeAlt="Original photo"
          afterAlt="Edited photo"
        />
      )
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
      const { container } = render(<ImageCompare />)
      expect(getRoot(container).querySelectorAll('img')).toHaveLength(0)
      expect(getHandle(container)).toHaveAttribute('aria-valuenow', '50')
    })
  })
})

function getImageCompareClip(container: HTMLElement): string {
  const before = container.querySelector('[data-image-compare-before]') as HTMLElement
  return before.style.clipPath
}
