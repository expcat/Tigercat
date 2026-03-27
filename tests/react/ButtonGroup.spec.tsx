/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { ButtonGroup, Button } from '@expcat/tigercat-react'
import { expectNoA11yViolations } from '../utils/react'

describe('ButtonGroup', () => {
  describe('rendering', () => {
    it('renders children buttons', () => {
      render(
        <ButtonGroup>
          <Button>A</Button>
          <Button>B</Button>
          <Button>C</Button>
        </ButtonGroup>
      )
      expect(screen.getByText('A')).toBeTruthy()
      expect(screen.getByText('B')).toBeTruthy()
      expect(screen.getByText('C')).toBeTruthy()
    })

    it('renders with role="group"', () => {
      render(
        <ButtonGroup>
          <Button>Ok</Button>
        </ButtonGroup>
      )
      expect(screen.getByRole('group')).toBeTruthy()
    })

    it('renders as a div element', () => {
      const { container } = render(<ButtonGroup>content</ButtonGroup>)
      expect(container.firstElementChild!.tagName).toBe('DIV')
    })
  })

  describe('layout', () => {
    it('applies horizontal classes by default', () => {
      const { container } = render(<ButtonGroup>content</ButtonGroup>)
      const el = container.firstElementChild!
      expect(el.className).toContain('flex-row')
      expect(el.className).not.toContain('flex-col')
    })

    it('applies vertical classes when vertical prop is true', () => {
      const { container } = render(<ButtonGroup vertical>content</ButtonGroup>)
      const el = container.firstElementChild!
      expect(el.className).toContain('flex-col')
    })

    it('applies base inline-flex class', () => {
      const { container } = render(<ButtonGroup>content</ButtonGroup>)
      expect(container.firstElementChild!.className).toContain('inline-flex')
    })
  })

  describe('size', () => {
    it('accepts size prop without error', () => {
      const { container } = render(
        <ButtonGroup size="sm">
          <Button>Small</Button>
        </ButtonGroup>
      )
      expect(container.firstElementChild).toBeTruthy()
    })

    it('accepts lg size', () => {
      const { container } = render(
        <ButtonGroup size="lg">
          <Button>Large</Button>
        </ButtonGroup>
      )
      expect(container.firstElementChild).toBeTruthy()
    })
  })

  describe('className', () => {
    it('merges custom className', () => {
      const { container } = render(<ButtonGroup className="my-group">content</ButtonGroup>)
      expect(container.firstElementChild!.className).toContain('my-group')
    })
  })

  describe('attrs passthrough', () => {
    it('passes data attributes', () => {
      const { container } = render(
        <ButtonGroup data-testid="my-group" aria-label="Actions">
          content
        </ButtonGroup>
      )
      const el = container.firstElementChild!
      expect(el.getAttribute('data-testid')).toBe('my-group')
      expect(el.getAttribute('aria-label')).toBe('Actions')
    })
  })

  describe('a11y', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <ButtonGroup aria-label="Button group">
          <Button>A</Button>
          <Button>B</Button>
        </ButtonGroup>
      )
      await expectNoA11yViolations(container)
    })
  })
})
