/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import { Resizable } from '@expcat/tigercat-vue/Resizable'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolations } from '../utils'
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
      expect((container.firstElementChild as HTMLElement).style.transform).toBe(
        'translate(-40px, 0px)'
      )
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
      expect(handle(container, 'bottom-right').getAttribute('tabindex')).toBe('-1')
    })

    it('grows width with ArrowRight on the right handle', async () => {
      const { container, emitted } = renderResizable()
      await fireEvent.keyDown(handle(container, 'right'), { key: 'ArrowRight' })
      const events = emitted().resize as unknown[][]
      expect((events[0][0] as { width: number }).width).toBe(300 + RESIZE_KEYBOARD_STEP)
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
    it('has no accessibility violations with labeled handles', async () => {
      const { container } = renderResizable({ handles: ['right', 'bottom'] })
      await expectNoA11yViolations(container)
    })
  })
})
