/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import { Collapse } from '@expcat/tigercat-vue/Collapse'
import { CollapsePanel } from '@expcat/tigercat-vue/CollapsePanel'
import { expectNoA11yViolations } from '../utils'

function createFrameScheduler() {
  let nextFrame = 1
  const callbacks = new Map<number, FrameRequestCallback>()
  const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    const frame = nextFrame++
    callbacks.set(frame, callback)
    return frame
  })
  const cancelAnimationFrame = vi.fn((frame: number) => {
    callbacks.delete(frame)
  })

  return {
    requestAnimationFrame,
    cancelAnimationFrame,
    flush(frame = [...callbacks.keys()][0]) {
      const callback = callbacks.get(frame)
      callbacks.delete(frame)
      callback?.(16)
    }
  }
}

function getContentWrapper(text: string): HTMLElement {
  return screen.getByText(text).closest('[data-tiger-collapse-content]') as HTMLElement
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Collapse', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(Collapse, {
        slots: {
          default: () => [
            h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1'),
            h(CollapsePanel, { panelKey: '2', header: 'Panel 2' }, () => 'Content 2')
          ]
        }
      })

      expect(screen.getByText('Panel 1')).toBeInTheDocument()
      expect(screen.getByText('Panel 2')).toBeInTheDocument()
      expect(screen.getByText('Content 1')).toBeInTheDocument()
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })

    it('should render with bordered style by default', () => {
      const { container } = render(Collapse, {
        slots: {
          default: () => [h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1')]
        }
      })

      const collapse = container.firstElementChild
      expect(collapse).toHaveClass('border')
    })

    it('should render without border when bordered is false', () => {
      const { container } = render(Collapse, {
        props: { bordered: false },
        slots: {
          default: () => [h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1')]
        }
      })

      const collapse = container.firstElementChild
      expect(collapse).toHaveClass('border-0')
    })

    it('should render with ghost mode', () => {
      const { container } = render(Collapse, {
        props: { ghost: true },
        slots: {
          default: () => [h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1')]
        }
      })

      const collapse = container.firstElementChild
      expect(collapse).toHaveClass('bg-transparent')
    })
  })

  describe('Props - Controlled Mode', () => {
    it('should respect activeKey prop with single key', () => {
      render(Collapse, {
        props: { activeKey: '2' },
        slots: {
          default: () => [
            h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1'),
            h(CollapsePanel, { panelKey: '2', header: 'Panel 2' }, () => 'Content 2')
          ]
        }
      })

      const panel1Header = screen.getByText('Panel 1').closest('button')
      const panel2Header = screen.getByText('Panel 2').closest('button')

      expect(panel1Header).toHaveAttribute('aria-expanded', 'false')
      expect(panel2Header).toHaveAttribute('aria-expanded', 'true')
    })

    it('should respect activeKey prop with multiple keys', () => {
      render(Collapse, {
        props: { activeKey: ['1', '2'] },
        slots: {
          default: () => [
            h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1'),
            h(CollapsePanel, { panelKey: '2', header: 'Panel 2' }, () => 'Content 2'),
            h(CollapsePanel, { panelKey: '3', header: 'Panel 3' }, () => 'Content 3')
          ]
        }
      })

      const panel1Header = screen.getByText('Panel 1').closest('button')
      const panel2Header = screen.getByText('Panel 2').closest('button')
      const panel3Header = screen.getByText('Panel 3').closest('button')

      expect(panel1Header).toHaveAttribute('aria-expanded', 'true')
      expect(panel2Header).toHaveAttribute('aria-expanded', 'true')
      expect(panel3Header).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('Props - Uncontrolled Mode', () => {
    it('should respect defaultActiveKey prop', () => {
      render(Collapse, {
        props: { defaultActiveKey: '2' },
        slots: {
          default: () => [
            h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1'),
            h(CollapsePanel, { panelKey: '2', header: 'Panel 2' }, () => 'Content 2')
          ]
        }
      })

      const panel2Header = screen.getByText('Panel 2').closest('button')
      expect(panel2Header).toHaveAttribute('aria-expanded', 'true')
    })

    it('should respect defaultActiveKey prop with multiple keys', () => {
      render(Collapse, {
        props: { defaultActiveKey: ['1', '3'] },
        slots: {
          default: () => [
            h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1'),
            h(CollapsePanel, { panelKey: '2', header: 'Panel 2' }, () => 'Content 2'),
            h(CollapsePanel, { panelKey: '3', header: 'Panel 3' }, () => 'Content 3')
          ]
        }
      })

      const panel1Header = screen.getByText('Panel 1').closest('button')
      const panel2Header = screen.getByText('Panel 2').closest('button')
      const panel3Header = screen.getByText('Panel 3').closest('button')

      expect(panel1Header).toHaveAttribute('aria-expanded', 'true')
      expect(panel2Header).toHaveAttribute('aria-expanded', 'false')
      expect(panel3Header).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('Accordion Mode', () => {
    it('should only allow one panel to be expanded in accordion mode', async () => {
      render(Collapse, {
        props: { accordion: true, defaultActiveKey: '1' },
        slots: {
          default: () => [
            h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1'),
            h(CollapsePanel, { panelKey: '2', header: 'Panel 2' }, () => 'Content 2')
          ]
        }
      })

      const panel1Header = screen.getByText('Panel 1').closest('button')
      const panel2Header = screen.getByText('Panel 2').closest('button')

      expect(panel1Header).toHaveAttribute('aria-expanded', 'true')
      expect(panel2Header).toHaveAttribute('aria-expanded', 'false')

      // Click panel 2
      await fireEvent.click(panel2Header!)

      expect(panel1Header).toHaveAttribute('aria-expanded', 'false')
      expect(panel2Header).toHaveAttribute('aria-expanded', 'true')
    })

    it('should emit [] when all panels are collapsed in accordion mode', async () => {
      const onChange = vi.fn()

      render(Collapse, {
        props: {
          accordion: true,
          defaultActiveKey: '1',
          onChange
        },
        slots: {
          default: () => [
            h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1'),
            h(CollapsePanel, { panelKey: '2', header: 'Panel 2' }, () => 'Content 2')
          ]
        }
      })

      const panel1Header = screen.getByText('Panel 1').closest('button')

      expect(panel1Header).toHaveAttribute('aria-expanded', 'true')

      // Click the active panel to collapse it
      await fireEvent.click(panel1Header!)

      expect(panel1Header).toHaveAttribute('aria-expanded', 'false')
      expect(onChange).toHaveBeenCalledWith([])
    })
  })

  describe('Interactions', () => {
    it('should toggle panel on header click', async () => {
      render(Collapse, {
        slots: {
          default: () => [h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1')]
        }
      })

      const panelHeader = screen.getByText('Panel 1').closest('button')

      expect(panelHeader).toHaveAttribute('aria-expanded', 'false')

      await fireEvent.click(panelHeader!)
      expect(panelHeader).toHaveAttribute('aria-expanded', 'true')

      await fireEvent.click(panelHeader!)
      expect(panelHeader).toHaveAttribute('aria-expanded', 'false')
    })

    it('should not toggle disabled panel', async () => {
      render(Collapse, {
        slots: {
          default: () => [
            h(
              CollapsePanel,
              { panelKey: '1', header: 'Panel 1', disabled: true },
              () => 'Content 1'
            )
          ]
        }
      })

      const panelHeader = screen.getByText('Panel 1').closest('button')

      expect(panelHeader).toHaveAttribute('aria-expanded', 'false')
      expect(panelHeader).toHaveAttribute('aria-disabled', 'true')

      await fireEvent.click(panelHeader!)
      expect(panelHeader).toHaveAttribute('aria-expanded', 'false')
    })

    it('should toggle on Enter key press', async () => {
      render(Collapse, {
        slots: {
          default: () => [h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1')]
        }
      })

      const panelHeader = screen.getByText('Panel 1').closest('button')

      expect(panelHeader).toHaveAttribute('aria-expanded', 'false')

      panelHeader!.focus()
      await fireEvent.keyDown(panelHeader!, { key: 'Enter' })
      expect(panelHeader).toHaveAttribute('aria-expanded', 'true')
    })

    it('should toggle on Space key press', async () => {
      render(Collapse, {
        slots: {
          default: () => [h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1')]
        }
      })

      const panelHeader = screen.getByText('Panel 1').closest('button')

      expect(panelHeader).toHaveAttribute('aria-expanded', 'false')

      panelHeader!.focus()
      await fireEvent.keyDown(panelHeader!, { key: ' ' })
      expect(panelHeader).toHaveAttribute('aria-expanded', 'true')
    })

    it('should expand content height on the next animation frame', async () => {
      const scheduler = createFrameScheduler()
      vi.stubGlobal('requestAnimationFrame', scheduler.requestAnimationFrame)
      vi.stubGlobal('cancelAnimationFrame', scheduler.cancelAnimationFrame)

      render(Collapse, {
        slots: {
          default: () => [h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1')]
        }
      })

      const wrapper = getContentWrapper('Content 1')
      Object.defineProperty(wrapper, 'scrollHeight', { value: 80, configurable: true })

      await fireEvent.click(screen.getByText('Panel 1').closest('button')!)

      expect(scheduler.requestAnimationFrame).toHaveBeenCalledTimes(1)
      expect(wrapper.style.maxHeight).toBe('0px')

      scheduler.flush()
      expect(wrapper.style.maxHeight).toBe('80px')
      expect(wrapper.style.opacity).toBe('1')
    })

    it('should collapse content height on the next animation frame', async () => {
      const scheduler = createFrameScheduler()
      vi.stubGlobal('requestAnimationFrame', scheduler.requestAnimationFrame)
      vi.stubGlobal('cancelAnimationFrame', scheduler.cancelAnimationFrame)

      render(Collapse, {
        props: { defaultActiveKey: '1' },
        slots: {
          default: () => [h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1')]
        }
      })

      const wrapper = getContentWrapper('Content 1')
      Object.defineProperty(wrapper, 'scrollHeight', { value: 64, configurable: true })

      await fireEvent.click(screen.getByText('Panel 1').closest('button')!)

      expect(wrapper.style.maxHeight).toBe('64px')
      scheduler.flush()
      expect(wrapper.style.maxHeight).toBe('0px')
      expect(wrapper.style.opacity).toBe('0')
    })
  })

  describe('Events', () => {
    it('should emit change event when panel is toggled', async () => {
      const onChange = vi.fn()

      render(Collapse, {
        props: {
          onChange
        },
        slots: {
          default: () => [h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1')]
        }
      })

      const panelHeader = screen.getByText('Panel 1').closest('button')
      await fireEvent.click(panelHeader!)

      expect(onChange).toHaveBeenCalledWith(['1'])
    })

    it('should emit change event with correct keys in accordion mode', async () => {
      const onChange = vi.fn()

      render(Collapse, {
        props: {
          accordion: true,
          onChange
        },
        slots: {
          default: () => [
            h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1'),
            h(CollapsePanel, { panelKey: '2', header: 'Panel 2' }, () => 'Content 2')
          ]
        }
      })

      const panel1Header = screen.getByText('Panel 1').closest('button')
      await fireEvent.click(panel1Header!)

      expect(onChange).toHaveBeenCalledWith(['1'])
    })

    it('should emit update:activeKey event', async () => {
      const onUpdateActiveKey = vi.fn()

      render(Collapse, {
        props: {
          'onUpdate:activeKey': onUpdateActiveKey
        },
        slots: {
          default: () => [h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1')]
        }
      })

      const panelHeader = screen.getByText('Panel 1').closest('button')
      await fireEvent.click(panelHeader!)

      expect(onUpdateActiveKey).toHaveBeenCalledWith(['1'])
    })
  })

  describe('CollapsePanel', () => {
    it('should render arrow icon by default', () => {
      const { container } = render(Collapse, {
        slots: {
          default: () => [h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1')]
        }
      })

      const arrow = container.querySelector('svg')
      expect(arrow).toBeInTheDocument()
    })

    it('should not render arrow icon when showArrow is false', () => {
      const { container } = render(Collapse, {
        slots: {
          default: () => [
            h(
              CollapsePanel,
              { panelKey: '1', header: 'Panel 1', showArrow: false },
              () => 'Content 1'
            )
          ]
        }
      })

      const arrow = container.querySelector('svg')
      expect(arrow).not.toBeInTheDocument()
    })

    it('should render arrow icon at end position', () => {
      const { container } = render(Collapse, {
        props: { expandIconPosition: 'end' },
        slots: {
          default: () => [h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1')]
        }
      })

      const arrow = container.querySelector('svg')
      expect(arrow).toHaveClass('ms-auto')
    })

    it('should render extra content', () => {
      render(Collapse, {
        slots: {
          default: () => [
            h(
              CollapsePanel,
              { panelKey: '1', header: 'Panel 1' },
              {
                default: () => 'Content 1',
                extra: () => 'Extra Content'
              }
            )
          ]
        }
      })

      expect(screen.getByText('Extra Content')).toBeInTheDocument()
    })

    it('should not toggle the panel when extra content is clicked', async () => {
      const onChange = vi.fn()

      render(Collapse, {
        props: {
          defaultActiveKey: '1',
          onChange
        },
        slots: {
          default: () => [
            h(
              CollapsePanel,
              { panelKey: '1', header: 'Panel 1' },
              {
                default: () => 'Content 1',
                extra: () => '已更新'
              }
            )
          ]
        }
      })

      const panelHeader = screen.getByText('Panel 1').closest('button')
      expect(panelHeader).toHaveAttribute('aria-expanded', 'true')

      await fireEvent.click(screen.getByText('已更新'))
      expect(panelHeader).toHaveAttribute('aria-expanded', 'true')
      expect(onChange).not.toHaveBeenCalled()

      await fireEvent.click(panelHeader!)
      expect(panelHeader).toHaveAttribute('aria-expanded', 'false')
      expect(onChange).toHaveBeenCalled()
    })

    it('should render custom header slot', () => {
      render(Collapse, {
        slots: {
          default: () => [
            h(
              CollapsePanel,
              { panelKey: '1' },
              {
                default: () => 'Content 1',
                header: () => h('strong', 'Custom Header')
              }
            )
          ]
        }
      })

      const customHeader = screen.getByText('Custom Header')
      expect(customHeader.tagName).toBe('STRONG')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(Collapse, {
        slots: {
          default: () => [h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1')]
        }
      })

      const panelHeader = screen.getByRole('button', { name: 'Panel 1' })
      expect(panelHeader.tagName).toBe('BUTTON')
      expect(panelHeader).toHaveAttribute('aria-expanded')
    })

    it('keeps a disabled header in the tab order', () => {
      render(Collapse, {
        slots: {
          default: () => [
            h(
              CollapsePanel,
              { panelKey: '1', header: 'Panel 1', disabled: true },
              () => 'Content 1'
            )
          ]
        }
      })

      const panelHeader = screen.getByRole('button', { name: 'Panel 1' })
      expect(panelHeader).toHaveAttribute('aria-disabled', 'true')
      expect(panelHeader).not.toHaveAttribute('disabled')
      panelHeader.focus()
      expect(panelHeader).toHaveFocus()
    })

    it('should mark a default-collapsed panel content wrapper as inert and aria-hidden', () => {
      render(Collapse, {
        slots: {
          default: () => [h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1')]
        }
      })

      const wrapper = getContentWrapper('Content 1')
      expect(wrapper).toHaveAttribute('inert')
      expect(wrapper).toHaveAttribute('aria-hidden', 'true')
    })

    it('should not mark a default-expanded panel content wrapper as inert or aria-hidden', () => {
      render(Collapse, {
        props: { defaultActiveKey: '1' },
        slots: {
          default: () => [h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1')]
        }
      })

      const wrapper = getContentWrapper('Content 1')
      expect(wrapper).not.toHaveAttribute('inert')
      expect(wrapper.getAttribute('aria-hidden')).not.toBe('true')
    })

    it('should update inert and aria-hidden when a panel is toggled', async () => {
      render(Collapse, {
        props: { defaultActiveKey: '1' },
        slots: {
          default: () => [h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1')]
        }
      })

      const panelHeader = screen.getByText('Panel 1').closest('button')
      const wrapper = getContentWrapper('Content 1')

      expect(wrapper).not.toHaveAttribute('inert')
      expect(wrapper.getAttribute('aria-hidden')).not.toBe('true')

      await fireEvent.click(panelHeader!)
      expect(wrapper).toHaveAttribute('inert')
      expect(wrapper).toHaveAttribute('aria-hidden', 'true')

      await fireEvent.click(panelHeader!)
      expect(wrapper).not.toHaveAttribute('inert')
      expect(wrapper.getAttribute('aria-hidden')).not.toBe('true')
    })

    it('should have no accessibility violations', async () => {
      const { container } = render(Collapse, {
        slots: {
          default: () => [
            h(
              CollapsePanel,
              { panelKey: '1', header: 'Panel 1' },
              { extra: () => h('button', { type: 'button' }, '已更新'), default: () => 'Content 1' }
            ),
            h(CollapsePanel, { panelKey: '2', header: 'Panel 2' }, () => 'Content 2')
          ]
        }
      })
      await expectNoA11yViolations(container)
    })

    it('names the header from the title only and points aria-controls at the region', () => {
      render(Collapse, {
        props: { defaultActiveKey: '1' },
        slots: {
          default: () => [
            h(
              CollapsePanel,
              { panelKey: '1', header: 'Panel 1' },
              { extra: () => '已更新', default: () => 'Content 1' }
            )
          ]
        }
      })

      const header = screen.getByRole('button', { name: 'Panel 1' })
      const region = screen.getByRole('region', { name: 'Panel 1' })
      expect(header).toHaveAttribute('aria-controls', region.id)
    })

    it('treats numeric and string panel keys as the same panel', () => {
      render(Collapse, {
        props: { activeKey: '1' },
        slots: {
          default: () => [
            h(CollapsePanel, { panelKey: 1, header: 'Panel 1' }, () => 'Content 1')
          ]
        }
      })

      expect(screen.getByRole('button', { name: 'Panel 1' })).toHaveAttribute(
        'aria-expanded',
        'true'
      )
    })

    it('keeps the first panel expanded when a sibling opens', async () => {
      const scheduler = createFrameScheduler()
      vi.stubGlobal('requestAnimationFrame', scheduler.requestAnimationFrame)
      vi.stubGlobal('cancelAnimationFrame', scheduler.cancelAnimationFrame)

      render(Collapse, {
        slots: {
          default: () => [
            h(CollapsePanel, { panelKey: '1', header: 'Panel 1' }, () => 'Content 1'),
            h(CollapsePanel, { panelKey: '2', header: 'Panel 2' }, () => 'Content 2')
          ]
        }
      })

      const firstWrapper = getContentWrapper('Content 1')
      Object.defineProperty(firstWrapper, 'scrollHeight', { value: 80, configurable: true })
      await fireEvent.click(screen.getByRole('button', { name: 'Panel 1' }))
      scheduler.flush()
      expect(firstWrapper.style.maxHeight).toBe('80px')

      await fireEvent.click(screen.getByRole('button', { name: 'Panel 2' }))
      expect(screen.getByRole('button', { name: 'Panel 1' })).toHaveAttribute(
        'aria-expanded',
        'true'
      )
      expect(firstWrapper.style.maxHeight).not.toBe('0px')
    })
  })
})
