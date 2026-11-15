/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { Button } from '@expcat/tigercat-react/Button'
import { ButtonGroup } from '@expcat/tigercat-react/ButtonGroup'
import { Input } from '@expcat/tigercat-react/Input'
import { InputGroup, InputGroupAddon } from '@expcat/tigercat-react/InputGroup'
import { InputNumber } from '@expcat/tigercat-react/InputNumber'
import { Mentions } from '@expcat/tigercat-react/Mentions'
import { Textarea } from '@expcat/tigercat-react/Textarea'
import { TimePicker } from '@expcat/tigercat-react/TimePicker'
import { TreeSelect } from '@expcat/tigercat-react/TreeSelect'
import { expectNoA11yViolations } from '../utils/react'

describe('InputGroup', () => {
  it('is a group only when it has an accessible name', () => {
    const { rerender } = render(<InputGroup>content</InputGroup>)
    expect(screen.queryByRole('group')).toBeNull()
    rerender(<InputGroup aria-label="Search">content</InputGroup>)
    expect(screen.getByRole('group', { name: 'Search' })).toBeInTheDocument()
  })

  it('applies compact mode classes', () => {
    render(
      <InputGroup compact aria-label="Compact">
        content
      </InputGroup>
    )
    const group = screen.getByRole('group')
    expect(group.className).toContain('rounded-none')
    expect(group.className).toContain('data-tiger-chrome')
  })

  it('applies spaced mode when not compact', () => {
    render(
      <InputGroup compact={false} aria-label="Spaced">
        content
      </InputGroup>
    )
    expect(screen.getByRole('group').className).toContain('gap-2')
  })

  it('merges custom className', () => {
    render(
      <InputGroup className="custom-class" aria-label="Custom">
        content
      </InputGroup>
    )
    expect(screen.getByRole('group').className).toContain('custom-class')
  })

  it('passes through HTML attributes', () => {
    render(
      <InputGroup data-testid="my-group" id="test" aria-label="Attrs">
        content
      </InputGroup>
    )
    expect(screen.getByTestId('my-group')).toBeInTheDocument()
    expect(screen.getByTestId('my-group').id).toBe('test')
  })

  it.each(['sm', 'lg'] as const)('passes size %s to children without an explicit size', (size) => {
    render(
      <InputGroup size={size} aria-label="Sized">
        <Input aria-label="plain input" />
        <Textarea aria-label="plain textarea" />
        <InputNumber aria-label="plain number" />
        <Mentions aria-label="plain mentions" />
        <TimePicker aria-label="plain time" />
        <TreeSelect aria-label="plain tree" />
      </InputGroup>
    )

    for (const label of [
      'plain input',
      'plain textarea',
      'plain mentions',
      'plain time',
      'plain tree'
    ]) {
      expect
        .soft(screen.getByLabelText(label, { selector: 'input, textarea, [role="combobox"]' }))
        .toHaveClass(`text-${size}`)
    }
    expect(screen.getByRole('spinbutton')).toHaveClass(`text-${size}`)
  })

  it.each(['sm', 'lg'] as const)('passes size %s to buttons while preserving overrides', (size) => {
    render(
      <InputGroup size={size} aria-label="Sized buttons">
        <Button>Inherited</Button>
        <Button size="md">Explicit</Button>
        <ButtonGroup size="md" aria-label="Actions">
          <Button>Button group</Button>
        </ButtonGroup>
      </InputGroup>
    )

    expect(screen.getByRole('button', { name: 'Inherited' })).toHaveClass(`text-${size}`)
    expect(screen.getByRole('button', { name: 'Explicit' })).toHaveClass('text-base')
    expect(screen.getByRole('button', { name: 'Button group' })).toHaveClass('text-base')
  })

  it('uses focus-within so nested field focus raises compact z-index', () => {
    render(
      <InputGroup compact aria-label="Focus">
        content
      </InputGroup>
    )
    const group = screen.getByRole('group')
    expect(group.className).toContain('focus-within')
    expect(group.className).not.toContain('[&>*:focus]:z-10')
  })

  it('joins compact Input chrome inside its stable group-child host', () => {
    render(
      <InputGroup compact aria-label="Query">
        <Input aria-label="q" />
        <button type="button">Go</button>
      </InputGroup>
    )
    const group = screen.getByRole('group')
    const first = group.firstElementChild as HTMLElement
    const last = group.lastElementChild as HTMLElement
    const input = screen.getByLabelText('q')

    expect(group.className).toContain(':first-child:not(:last-child)')
    const chrome = input.parentElement!
    expect(first).toBe(chrome.parentElement)
    expect(chrome).toHaveAttribute('data-tiger-chrome')
    expect(chrome.className).toContain('border')
    expect(input.className).not.toContain('rounded-[var(--tiger-radius-md')
    expect(last.tagName).toBe('BUTTON')
  })

  it('joins compact Textarea chrome inside its stable group-child host', () => {
    render(
      <InputGroup compact aria-label="Notes">
        <Textarea aria-label="notes" />
        <button type="button">Go</button>
      </InputGroup>
    )
    const group = screen.getByRole('group')
    const textarea = screen.getByLabelText('notes')
    expect(group.firstElementChild).toBe(textarea.parentElement)
    expect(textarea).toHaveAttribute('data-tiger-chrome')
    expect(textarea.parentElement?.parentElement).toBe(group)
  })

  it('still marks chrome when showCount wraps extras below the field', () => {
    render(
      <InputGroup compact aria-label="Counted">
        <InputGroupAddon>https://</InputGroupAddon>
        <Input aria-label="host" showCount defaultValue="ex" />
      </InputGroup>
    )
    const group = screen.getByRole('group')
    const chromes = group.querySelectorAll('[data-tiger-chrome]')
    expect(chromes.length).toBeGreaterThanOrEqual(2)
    const extra = group.querySelector('[data-tiger-field-extra]')
    expect(extra).toHaveAttribute('data-tiger-field-extra', 'line')
    expect(extra?.className).toContain('absolute')
    expect(extra).toContainElement(screen.getByText('2'))
    expect(group.firstElementChild).toHaveAttribute('data-tiger-chrome')
  })
})

describe('InputGroupAddon', () => {
  it('renders addon content', () => {
    render(<InputGroupAddon>@</InputGroupAddon>)
    expect(screen.getByText('@')).toBeInTheDocument()
  })

  it('uses the group default compact=false outside a group', () => {
    const { container } = render(<InputGroupAddon>@</InputGroupAddon>)
    const addon = container.firstElementChild as HTMLElement
    expect(addon.className).toContain('rounded-[var(--tiger-radius-md')
    expect(addon.className).not.toContain('rounded-l-md')
  })

  describe('a11y', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <InputGroup aria-label="Search field">
          <Input aria-label="Search" />
        </InputGroup>
      )
      await expectNoA11yViolations(container)
    })
  })
})
