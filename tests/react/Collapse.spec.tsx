/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Collapse, CollapsePanel } from '@expcat/tigercat-react'

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
})
