/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Collapse, CollapsePanel } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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
      render(
        <Collapse>
          <CollapsePanel panelKey="1" header="Panel 1">
            Content 1
          </CollapsePanel>
          <CollapsePanel panelKey="2" header="Panel 2">
            Content 2
          </CollapsePanel>
        </Collapse>
      )

      expect(screen.getByText('Panel 1')).toBeInTheDocument()
      expect(screen.getByText('Panel 2')).toBeInTheDocument()
      expect(screen.getByText('Content 1')).toBeInTheDocument()
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })

    it('should render with bordered style by default', () => {
      const { container } = render(
        <Collapse>
          <CollapsePanel panelKey="1" header="Panel 1">
            Content 1
          </CollapsePanel>
        </Collapse>
      )

      const collapse = container.querySelector('[role="region"]')
      expect(collapse).toHaveClass('border')
    })

    it('should render without border when bordered is false', () => {
      const { container } = render(
        <Collapse bordered={false}>
          <CollapsePanel panelKey="1" header="Panel 1">
            Content 1
          </CollapsePanel>
        </Collapse>
      )

      const collapse = container.querySelector('[role="region"]')
      expect(collapse).toHaveClass('border-0')
    })

    it('should render with ghost mode', () => {
      const { container } = render(
        <Collapse ghost>
          <CollapsePanel panelKey="1" header="Panel 1">
            Content 1
          </CollapsePanel>
        </Collapse>
      )

      const collapse = container.querySelector('[role="region"]')
      expect(collapse).toHaveClass('bg-transparent')
    })
  })

  describe('Props - Controlled Mode', () => {
    it('should respect activeKey prop with single key', () => {
      render(
        <Collapse activeKey="2">
          <CollapsePanel panelKey="1" header="Panel 1">
            Content 1
          </CollapsePanel>
          <CollapsePanel panelKey="2" header="Panel 2">
            Content 2
          </CollapsePanel>
        </Collapse>
      )

      const panel1Header = screen.getByText('Panel 1').closest('[role="button"]')
      const panel2Header = screen.getByText('Panel 2').closest('[role="button"]')

      expect(panel1Header).toHaveAttribute('aria-expanded', 'false')
      expect(panel2Header).toHaveAttribute('aria-expanded', 'true')
    })

    it('should respect activeKey prop with multiple keys', () => {
      render(
        <Collapse activeKey={['1', '2']}>
          <CollapsePanel panelKey="1" header="Panel 1">
            Content 1
          </CollapsePanel>
          <CollapsePanel panelKey="2" header="Panel 2">
            Content 2
          </CollapsePanel>
          <CollapsePanel panelKey="3" header="Panel 3">
            Content 3
          </CollapsePanel>
        </Collapse>
      )

      const panel1Header = screen.getByText('Panel 1').closest('[role="button"]')
      const panel2Header = screen.getByText('Panel 2').closest('[role="button"]')
      const panel3Header = screen.getByText('Panel 3').closest('[role="button"]')

      expect(panel1Header).toHaveAttribute('aria-expanded', 'true')
      expect(panel2Header).toHaveAttribute('aria-expanded', 'true')
      expect(panel3Header).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('Props - Uncontrolled Mode', () => {
    it('should respect defaultActiveKey prop', () => {
      render(
        <Collapse defaultActiveKey="2">
          <CollapsePanel panelKey="1" header="Panel 1">
            Content 1
          </CollapsePanel>
          <CollapsePanel panelKey="2" header="Panel 2">
            Content 2
          </CollapsePanel>
        </Collapse>
      )

      const panel2Header = screen.getByText('Panel 2').closest('[role="button"]')
      expect(panel2Header).toHaveAttribute('aria-expanded', 'true')
    })

    it('should respect defaultActiveKey prop with multiple keys', () => {
      render(
        <Collapse defaultActiveKey={['1', '3']}>
          <CollapsePanel panelKey="1" header="Panel 1">
            Content 1
          </CollapsePanel>
          <CollapsePanel panelKey="2" header="Panel 2">
            Content 2
          </CollapsePanel>
          <CollapsePanel panelKey="3" header="Panel 3">
            Content 3
          </CollapsePanel>
        </Collapse>
      )

      const panel1Header = screen.getByText('Panel 1').closest('[role="button"]')
      const panel2Header = screen.getByText('Panel 2').closest('[role="button"]')
      const panel3Header = screen.getByText('Panel 3').closest('[role="button"]')

      expect(panel1Header).toHaveAttribute('aria-expanded', 'true')
      expect(panel2Header).toHaveAttribute('aria-expanded', 'false')
      expect(panel3Header).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('Accordion Mode', () => {
    it('should only allow one panel to be expanded in accordion mode', async () => {
      render(
        <Collapse accordion defaultActiveKey="1">
          <CollapsePanel panelKey="1" header="Panel 1">
            Content 1
          </CollapsePanel>
          <CollapsePanel panelKey="2" header="Panel 2">
            Content 2
          </CollapsePanel>
        </Collapse>
      )

      const panel1Header = screen.getByText('Panel 1').closest('[role="button"]')
      const panel2Header = screen.getByText('Panel 2').closest('[role="button"]')

      expect(panel1Header).toHaveAttribute('aria-expanded', 'true')
      expect(panel2Header).toHaveAttribute('aria-expanded', 'false')

      // Click panel 2
      await fireEvent.click(panel2Header!)

      expect(panel1Header).toHaveAttribute('aria-expanded', 'false')
      expect(panel2Header).toHaveAttribute('aria-expanded', 'true')
    })

    it('should call onChange with undefined when all panels are collapsed in accordion mode', async () => {
      const onChange = vi.fn()

      render(
        <Collapse accordion defaultActiveKey="1" onChange={onChange}>
          <CollapsePanel panelKey="1" header="Panel 1">
            Content 1
          </CollapsePanel>
          <CollapsePanel panelKey="2" header="Panel 2">
            Content 2
          </CollapsePanel>
        </Collapse>
      )

      const panel1Header = screen.getByText('Panel 1').closest('[role="button"]')

      expect(panel1Header).toHaveAttribute('aria-expanded', 'true')

      // Click the active panel to collapse it
      await fireEvent.click(panel1Header!)

      expect(panel1Header).toHaveAttribute('aria-expanded', 'false')
      expect(onChange).toHaveBeenCalledWith(undefined)
    })
  })

  describe('Interactions', () => {
    it('should toggle panel on header click', async () => {
      render(
        <Collapse>
          <CollapsePanel panelKey="1" header="Panel 1">
            Content 1
          </CollapsePanel>
        </Collapse>
      )

      const panelHeader = screen.getByText('Panel 1').closest('[role="button"]')

      expect(panelHeader).toHaveAttribute('aria-expanded', 'false')

      await fireEvent.click(panelHeader!)
      expect(panelHeader).toHaveAttribute('aria-expanded', 'true')

      await fireEvent.click(panelHeader!)
      expect(panelHeader).toHaveAttribute('aria-expanded', 'false')
    })

    it('should not toggle disabled panel', async () => {
      render(
        <Collapse>
          <CollapsePanel panelKey="1" header="Panel 1" disabled>
            Content 1
          </CollapsePanel>
        </Collapse>
      )

      const panelHeader = screen.getByText('Panel 1').closest('[role="button"]')

      expect(panelHeader).toHaveAttribute('aria-expanded', 'false')
      expect(panelHeader).toHaveAttribute('aria-disabled', 'true')

      await fireEvent.click(panelHeader!)
      expect(panelHeader).toHaveAttribute('aria-expanded', 'false')
    })

    it('should toggle on Enter key press', async () => {
      render(
        <Collapse>
          <CollapsePanel panelKey="1" header="Panel 1">
            Content 1
          </CollapsePanel>
        </Collapse>
      )

      const panelHeader = screen.getByText('Panel 1').closest('[role="button"]')

      expect(panelHeader).toHaveAttribute('aria-expanded', 'false')

      panelHeader!.focus()
      await fireEvent.keyDown(panelHeader!, { key: 'Enter' })
      expect(panelHeader).toHaveAttribute('aria-expanded', 'true')
    })

    it('should toggle on Space key press', async () => {
      render(
        <Collapse>
          <CollapsePanel panelKey="1" header="Panel 1">
            Content 1
          </CollapsePanel>
        </Collapse>
      )

      const panelHeader = screen.getByText('Panel 1').closest('[role="button"]')

      expect(panelHeader).toHaveAttribute('aria-expanded', 'false')

      panelHeader!.focus()
      await fireEvent.keyDown(panelHeader!, { key: ' ' })
      expect(panelHeader).toHaveAttribute('aria-expanded', 'true')
    })

    it('should expand content height on the next animation frame', async () => {
      const scheduler = createFrameScheduler()
      vi.stubGlobal('requestAnimationFrame', scheduler.requestAnimationFrame)
      vi.stubGlobal('cancelAnimationFrame', scheduler.cancelAnimationFrame)

      render(
        <Collapse>
          <CollapsePanel panelKey="1" header="Panel 1">
            Content 1
          </CollapsePanel>
        </Collapse>
      )

      const wrapper = getContentWrapper('Content 1')
      Object.defineProperty(wrapper, 'scrollHeight', { value: 80, configurable: true })

      await fireEvent.click(screen.getByText('Panel 1').closest('[role="button"]')!)

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

      render(
        <Collapse defaultActiveKey="1">
          <CollapsePanel panelKey="1" header="Panel 1">
            Content 1
          </CollapsePanel>
        </Collapse>
      )

      const wrapper = getContentWrapper('Content 1')
      Object.defineProperty(wrapper, 'scrollHeight', { value: 64, configurable: true })

      await fireEvent.click(screen.getByText('Panel 1').closest('[role="button"]')!)

      expect(wrapper.style.maxHeight).toBe('64px')
      scheduler.flush()
      expect(wrapper.style.maxHeight).toBe('0px')
      expect(wrapper.style.opacity).toBe('0')
    })
  })

  describe('Events', () => {
    it('should call onChange when panel is toggled', async () => {
      const onChange = vi.fn()

      render(
        <Collapse onChange={onChange}>
          <CollapsePanel panelKey="1" header="Panel 1">
            Content 1
          </CollapsePanel>
        </Collapse>
      )

      const panelHeader = screen.getByText('Panel 1').closest('[role="button"]')
      await fireEvent.click(panelHeader!)

      expect(onChange).toHaveBeenCalledWith(['1'])
    })

    it('should call onChange with correct keys in accordion mode', async () => {
      const onChange = vi.fn()

      render(
        <Collapse accordion onChange={onChange}>
          <CollapsePanel panelKey="1" header="Panel 1">
            Content 1
          </CollapsePanel>
          <CollapsePanel panelKey="2" header="Panel 2">
            Content 2
          </CollapsePanel>
        </Collapse>
      )

      const panel1Header = screen.getByText('Panel 1').closest('[role="button"]')
      await fireEvent.click(panel1Header!)

      expect(onChange).toHaveBeenCalledWith('1')
    })
  })

  describe('CollapsePanel', () => {
    it('should render arrow icon by default', () => {
      const { container } = render(
        <Collapse>
          <CollapsePanel panelKey="1" header="Panel 1">
            Content 1
          </CollapsePanel>
        </Collapse>
      )

      const arrow = container.querySelector('svg')
      expect(arrow).toBeInTheDocument()
    })

    it('should not render arrow icon when showArrow is false', () => {
      const { container } = render(
        <Collapse>
          <CollapsePanel panelKey="1" header="Panel 1" showArrow={false}>
            Content 1
          </CollapsePanel>
        </Collapse>
      )

      const arrow = container.querySelector('svg')
      expect(arrow).not.toBeInTheDocument()
    })

    it('should render arrow icon at end position', () => {
      const { container } = render(
        <Collapse expandIconPosition="end">
          <CollapsePanel panelKey="1" header="Panel 1">
            Content 1
          </CollapsePanel>
        </Collapse>
      )

      const arrow = container.querySelector('svg')
      expect(arrow).toHaveClass('ml-auto')
    })

    it('should render extra content', () => {
      render(
        <Collapse>
          <CollapsePanel panelKey="1" header="Panel 1" extra={<span>Extra Content</span>}>
            Content 1
          </CollapsePanel>
        </Collapse>
      )

      expect(screen.getByText('Extra Content')).toBeInTheDocument()
    })

    it('should render custom header', () => {
      render(
        <Collapse>
          <CollapsePanel panelKey="1" header={<strong>Custom Header</strong>}>
            Content 1
          </CollapsePanel>
        </Collapse>
      )

      const customHeader = screen.getByText('Custom Header')
      expect(customHeader.tagName).toBe('STRONG')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <Collapse>
          <CollapsePanel panelKey="1" header="Panel 1">
            Content 1
          </CollapsePanel>
        </Collapse>
      )

      const panelHeader = screen.getByText('Panel 1').closest('[role="button"]')
      expect(panelHeader).toHaveAttribute('role', 'button')
      expect(panelHeader).toHaveAttribute('aria-expanded')
      expect(panelHeader).toHaveAttribute('tabindex', '0')
    })

    it('should have tabindex -1 for disabled panel', () => {
      render(
        <Collapse>
          <CollapsePanel panelKey="1" header="Panel 1" disabled>
            Content 1
          </CollapsePanel>
        </Collapse>
      )

      const panelHeader = screen.getByText('Panel 1').closest('[role="button"]')
      expect(panelHeader).toHaveAttribute('tabindex', '-1')
      expect(panelHeader).toHaveAttribute('aria-disabled', 'true')
    })
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Collapse />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const { container } = render(<Collapse />)
      expect(container.firstChild).toBeTruthy()
    })
  })
})
