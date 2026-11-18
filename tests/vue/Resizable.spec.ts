/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, onTestFinished, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { h, nextTick } from 'vue'
import { Resizable } from '@expcat/tigercat-vue/Resizable'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolations } from '../utils'
import { MockResizeObserver } from '../utils/mock-observers'
import { RESIZE_KEYBOARD_STEP } from '@expcat/tigercat-core'

function renderResizable(props: Record<string, unknown> = {}) {
  return render(Resizable, {
    props: {
      defaultWidth: 300,
      defaultHeight: 200,
      ...props
    },
    slots: {
      default: () => [h('div', { 'data-testid': 'content' }, 'Content')]
    }
  })
}

function handle(container: HTMLElement, pos: string): HTMLElement {
  return container.querySelector(`[data-handle="${pos}"]`) as HTMLElement
}

describe('Resizable', () => {
  describe('Rendering', () => {
    it('should render with content', () => {
      const { getByTestId } = renderResizable()
      expect(getByTestId('content')).toBeInTheDocument()
    })
    it('should apply default width and height', () => {
      const { container } = renderResizable()
      const root = container.firstElementChild as HTMLElement
      expect(root.style.width).toBe('300px')
      expect(root.style.height).toBe('200px')
    })
  })

  describe('Handles', () => {
    it('hides empty-axis edge handles', () => {
      const { container } = renderResizable({ axis: 'horizontal' })
      expect(handle(container, 'right')).toBeTruthy()
      expect(container.querySelector('[data-handle="bottom"]')).toBeNull()
    })
  })

  describe('Pointer interaction', () => {
    it('grows width from the right handle', async () => {
      const { container, emitted } = renderResizable({ handles: ['right'] })
      await fireEvent.pointerDown(handle(container, 'right'), {
        clientX: 300,
        clientY: 100,
        button: 0,
        pointerId: 1
      })
      await fireEvent.pointerMove(document, { clientX: 350, clientY: 100, pointerId: 1 })
      const resize = emitted().resize as unknown as Array<[{ width: number }]>
      expect(resize.at(-1)?.[0].width).toBe(350)
    })

    it('moves the start edge when dragging the left handle', async () => {
      const { container } = renderResizable({ handles: ['left'] })
      await fireEvent.pointerDown(handle(container, 'left'), {
        clientX: 0,
        clientY: 100,
        button: 0,
        pointerId: 1
      })
      await fireEvent.pointerMove(document, { clientX: -40, clientY: 100, pointerId: 1 })
      expect((container.firstElementChild as HTMLElement).style.marginInlineStart).toBe('-40px')
      expect((container.firstElementChild as HTMLElement).style.width).toBe('340px')
    })
  })

  describe('Keyboard resize', () => {
    it('exposes edge handles as named separators', () => {
      const { container } = renderResizable()
      const right = handle(container, 'right')
      expect(right.getAttribute('role')).toBe('separator')
      expect(right.getAttribute('tabindex')).toBe('0')
      expect(right.getAttribute('aria-label')).toBe('Resize right')
      expect(handle(container, 'bottom-right').getAttribute('tabindex')).toBe('0')
    })

    it('grows width with ArrowRight on the right handle', async () => {
      const { container, emitted } = renderResizable()
      await fireEvent.keyDown(handle(container, 'right'), { key: 'ArrowRight' })
      const events = emitted().resize as unknown[][]
      expect((events[0][0] as { width: number }).width).toBe(300 + RESIZE_KEYBOARD_STEP)
    })

    it('keeps the container maximum fixed and clamps keyboard and pointer resizing to it', async () => {
      const host = document.createElement('div')
      Object.defineProperties(host, {
        clientWidth: { value: 315 },
        clientHeight: { value: 215 }
      })
      document.body.appendChild(host)
      const { container } = render(Resizable, {
        props: { defaultWidth: 300, defaultHeight: 200, minWidth: 100, minHeight: 80 },
        container: host
      })
      await fireEvent(window, new Event('resize'))
      const root = container.firstElementChild as HTMLElement
      const right = handle(container, 'right')
      const bottom = handle(container, 'bottom')
      expect(right).toHaveAttribute('aria-valuemin', '100')
      expect(bottom).toHaveAttribute('aria-valuemin', '80')
      expect(right).toHaveAttribute('aria-valuemax', '315')
      expect(bottom).toHaveAttribute('aria-valuemax', '215')
      await fireEvent.keyDown(right, { key: 'ArrowRight' })
      await fireEvent.keyDown(bottom, { key: 'ArrowDown' })
      expect(right).toHaveAttribute('aria-valuenow', '310')
      expect(bottom).toHaveAttribute('aria-valuenow', '210')
      expect(right).toHaveAttribute('aria-valuemax', '315')
      expect(bottom).toHaveAttribute('aria-valuemax', '215')
      for (let i = 0; i < 2; i++) {
        await fireEvent.keyDown(right, { key: 'ArrowRight' })
        await fireEvent.keyDown(bottom, { key: 'ArrowDown' })
      }
      expect(right).toHaveAttribute('aria-valuenow', '315')
      expect(bottom).toHaveAttribute('aria-valuenow', '215')
      await fireEvent.pointerDown(handle(container, 'bottom-right'), {
        clientX: 315,
        clientY: 215,
        button: 0,
        pointerId: 1
      })
      await fireEvent.pointerMove(document, { clientX: 500, clientY: 400, pointerId: 1 })
      await fireEvent.pointerUp(document, { clientX: 500, clientY: 400, pointerId: 1 })
      expect(root.style.width).toBe('315px')
      expect(root.style.height).toBe('215px')
      expect(right).toHaveAttribute('aria-valuenow', '315')
      expect(bottom).toHaveAttribute('aria-valuenow', '215')
      expect(right).toHaveAttribute('aria-valuemax', '315')
      expect(bottom).toHaveAttribute('aria-valuemax', '215')
    })

    it('remeasures when its parent shrinks and clamps pointer and keyboard resizing', async () => {
      MockResizeObserver.reset()
      vi.stubGlobal('ResizeObserver', MockResizeObserver)
      onTestFinished(() => {
        vi.unstubAllGlobals()
      })
      let parentWidth = 500
      const { container } = render({
        setup: () => () =>
          h(
            'div',
            {
              ref: (host) => {
                if (host) Object.defineProperty(host, 'clientWidth', { get: () => parentWidth })
              }
            },
            [h(Resizable, { defaultWidth: 290 })]
          )
      })
      await nextTick()
      const right = handle(container, 'right')
      expect(right).toHaveAttribute('aria-valuemax', '500')
      await fireEvent.pointerDown(right, { clientX: 290, button: 0, pointerId: 1 })

      parentWidth = 300
      const observer = MockResizeObserver.instances[0]
      observer?.trigger(300, 400)
      await nextTick()
      expect(right).toHaveAttribute('aria-valuemax', '300')
      expect(observer.observe).toHaveBeenCalledWith(container.firstElementChild)
      await fireEvent.pointerMove(document, { clientX: 350, pointerId: 1 })
      expect(right).toHaveAttribute('aria-valuenow', '300')
      await fireEvent.pointerUp(document, { clientX: 350, pointerId: 1 })
      expect(right).toHaveAttribute('aria-valuenow', '300')

      await fireEvent.keyDown(right, { key: 'ArrowLeft' })
      expect(right).toHaveAttribute('aria-valuenow', '290')
      await fireEvent.keyDown(right, { key: 'ArrowRight' })
      await fireEvent.keyDown(right, { key: 'ArrowRight' })
      expect(right).toHaveAttribute('aria-valuenow', '300')
    })

    it('locks ratio from the bottom handle', async () => {
      const { container, emitted } = renderResizable({
        handles: ['bottom'],
        lockAspectRatio: true,
        defaultWidth: 200,
        defaultHeight: 100
      })
      await fireEvent.keyDown(handle(container, 'bottom'), { key: 'ArrowDown' })
      const evt = (emitted().resize as unknown as Array<[{ width: number; height: number }]>)[0][0]
      expect(evt.height).toBe(110)
      expect(evt.width).toBe(220)
    })

    it('does not resize via keyboard when disabled', async () => {
      const { container, emitted } = renderResizable({ disabled: true })
      expect(handle(container, 'right').getAttribute('tabindex')).toBe('-1')
      await fireEvent.keyDown(handle(container, 'right'), { key: 'ArrowRight' })
      expect(emitted().resize).toBeUndefined()
    })
  })

  describe('Locale', () => {
    it('names handles from official locale objects', () => {
      const view = render({
        setup() {
          return () =>
            h(ConfigProvider, { locale: zhCN }, () => [
              h(Resizable, { defaultWidth: 300, defaultHeight: 200, handles: ['right'] }, () => [
                h('div', 'Box')
              ])
            ])
        }
      })
      expect(handle(view.container, 'right')).toHaveAttribute('aria-label', '调整大小：right')
      view.unmount()
      const tw = render({
        setup() {
          return () =>
            h(ConfigProvider, { locale: zhTW }, () => [
              h(Resizable, { defaultWidth: 300, defaultHeight: 200, handles: ['right'] }, () => [
                h('div', 'Box')
              ])
            ])
        }
      })
      expect(handle(tw.container, 'right')).toHaveAttribute('aria-label', '調整大小：right')
    })
  })

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = renderResizable({ className: 'my-resizable' })
      expect(container.firstElementChild?.className).toContain('my-resizable')
    })
  })

  describe('Accessibility', () => {
    it('uses the viewport maximum when no container size or maximum is configured', () => {
      const { container } = renderResizable()
      const right = handle(container, 'right')
      expect(right.getAttribute('aria-valuenow')).toBe('300')
      expect(right.getAttribute('aria-valuemax')).toBe(String(window.innerWidth))
    })

    it('reports inline style width and height on the handles', () => {
      const { container } = render(Resizable, {
        props: { style: { width: '320px', height: '180px' } },
        slots: { default: () => [h('div', 'Box')] }
      })
      expect(handle(container, 'right').getAttribute('aria-valuenow')).toBe('320')
      expect(handle(container, 'bottom').getAttribute('aria-valuenow')).toBe('180')
    })

    it('keeps handle names when the root has aria-labelledby', () => {
      const { container } = render(Resizable, {
        props: { defaultWidth: 300, defaultHeight: 200 },
        attrs: { 'aria-labelledby': 'panel-name' },
        slots: { default: () => [h('div', { id: 'panel-name' }, 'Panel')] }
      })
      expect(container.firstElementChild?.getAttribute('aria-labelledby')).toBe('panel-name')
      expect(handle(container, 'right').getAttribute('aria-label')).toBe('Resize right')
      expect(handle(container, 'bottom').getAttribute('aria-label')).toBe('Resize bottom')
      expect(handle(container, 'bottom-right').getAttribute('aria-label')).toBe(
        'Resize bottom-right'
      )
    })

    it('has no accessibility violations with labeled handles', async () => {
      const { container } = renderResizable({ handles: ['right', 'bottom'] })
      await expectNoA11yViolations(container)
    })
  })
})
