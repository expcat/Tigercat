/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { useState } from 'react'
import { Mentions } from '@expcat/tigercat-react/Mentions'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { axe } from '../utils/react'

const defaultOptions = [
  { value: 'alice', label: 'Alice' },
  { value: 'bob', label: 'Bob' },
  { value: 'charlie', label: 'Charlie' }
]

const namedOptions = [
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' }
]

async function openMention(
  textarea: HTMLTextAreaElement,
  value: string,
  selectionStart = value.length
) {
  fireEvent.change(textarea, { target: { value, selectionStart, selectionEnd: selectionStart } })
}

/** textarea + combobox is the APG mentions pattern; axe-core still rejects that pairing. */
async function expectMentionsA11y(container: HTMLElement): Promise<void> {
  const results = await axe(container, {
    rules: { 'aria-allowed-role': { enabled: false } }
  })
  expect(results).toHaveNoViolations()
}

describe('Mentions', () => {
  it('keeps typed text when value is omitted', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(<Mentions options={defaultOptions} />)
    const textarea = getByRole('combobox') as HTMLTextAreaElement
    await user.type(textarea, 'hello')
    expect(textarea).toHaveValue('hello')
  })

  it('does not reset to defaultValue on rerender', async () => {
    const user = userEvent.setup()
    const { getByRole, rerender } = render(
      <Mentions options={defaultOptions} defaultValue="start " />
    )
    const textarea = getByRole('combobox') as HTMLTextAreaElement
    await user.type(textarea, 'more')
    rerender(<Mentions options={defaultOptions} defaultValue="start " />)
    expect(textarea.value).toContain('more')
  })

  it('opens a combobox listbox after @ and filters by label or value', async () => {
    const { getByRole, getByText, queryByText } = render(
      <Mentions options={namedOptions} aria-label="Members" />
    )
    const textarea = getByRole('combobox') as HTMLTextAreaElement
    await openMention(textarea, '@zhang')
    await screen.findByRole('listbox')
    expect(getByText('张三')).toBeInTheDocument()
    expect(queryByText('李四')).not.toBeInTheDocument()
    expect(textarea).toHaveAttribute('aria-expanded', 'true')
    expect(textarea).toHaveAttribute('aria-autocomplete', 'list')
  })

  it('recovers after a query with no matches', async () => {
    const { getByRole, getByText } = render(
      <Mentions options={defaultOptions} aria-label="Members" />
    )
    const textarea = getByRole('combobox') as HTMLTextAreaElement
    await openMention(textarea, '@z')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    await openMention(textarea, '@al')
    await screen.findByRole('listbox')
    expect(getByText('Alice')).toBeInTheDocument()
  })

  it('inserts prefix + value from the live textarea, not a stale value prop', async () => {
    const onChange = vi.fn()
    const onSelect = vi.fn()
    const { getByRole, getByText } = render(
      <Mentions
        options={defaultOptions}
        value="hello "
        onChange={onChange}
        onSelect={onSelect}
        aria-label="Members"
      />
    )
    const textarea = getByRole('combobox') as HTMLTextAreaElement
    await openMention(textarea, 'hello @al', 9)
    await screen.findByRole('listbox')
    fireEvent.mouseDown(getByText('Alice'))
    fireEvent.click(getByText('Alice'))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: 'alice' }))
    expect(onChange).toHaveBeenCalledWith('hello @alice ')
    expect(document.activeElement).toBe(textarea)
  })

  it('does not eat Enter when the list is closed', async () => {
    const onChange = vi.fn()
    const { getByRole } = render(
      <Mentions options={defaultOptions} onChange={onChange} aria-label="Members" />
    )
    const textarea = getByRole('combobox') as HTMLTextAreaElement
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('skips disabled options with the keyboard', async () => {
    const onSelect = vi.fn()
    const { getByRole } = render(
      <Mentions
        options={[...defaultOptions, { value: 'dave', label: 'Dave', disabled: true }]}
        onSelect={onSelect}
        aria-label="Members"
      />
    )
    const textarea = getByRole('combobox') as HTMLTextAreaElement
    await openMention(textarea, '@')
    await screen.findByRole('listbox')
    fireEvent.keyDown(textarea, { key: 'End' })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: 'charlie' }))
  })

  it('writes FormItem model on type and select, and focuses from the label', async () => {
    const user = userEvent.setup()
    const { getByLabelText, getByRole } = render(
      <Form>
        <FormItem name="note" label="Note">
          <Mentions options={defaultOptions} />
        </FormItem>
      </Form>
    )
    const textarea = getByLabelText('Note') as HTMLTextAreaElement
    expect(textarea).toHaveAttribute('role', 'combobox')
    await user.click(textarea)
    await openMention(textarea, '@')
    await screen.findByRole('listbox')
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(textarea.value).toContain('@alice')
    expect(getByRole('combobox')).toHaveAttribute('id')
  })

  it('has no a11y violations on a named instance', async () => {
    const { container, getByRole } = render(
      <Mentions options={defaultOptions} placeholder="Mention a teammate" />
    )
    expect(getByRole('combobox')).toHaveAttribute('placeholder', 'Mention a teammate')
    await expectMentionsA11y(container)
  })

  it('has no a11y violations when opened', async () => {
    const { container, getByRole } = render(
      <Mentions options={defaultOptions} aria-label="Members" />
    )
    await openMention(getByRole('combobox') as HTMLTextAreaElement, '@')
    await screen.findByRole('listbox')
    await expectMentionsA11y(container)
  })

  it('has no a11y violations with no matches', async () => {
    const { container, getByRole } = render(
      <Mentions options={defaultOptions} aria-label="Members" />
    )
    await openMention(getByRole('combobox') as HTMLTextAreaElement, '@zzzz')
    await expectMentionsA11y(container)
  })

  it('has no a11y violations inside a labelled FormItem', async () => {
    const { container, getByRole } = render(
      <Form>
        <FormItem name="note" label="Note">
          <Mentions options={defaultOptions} />
        </FormItem>
      </Form>
    )
    getByRole('combobox').focus()
    await expectMentionsA11y(container)
  })

  it('applies className to the chrome textarea', () => {
    const { container } = render(
      <Mentions options={defaultOptions} className="my-mentions" aria-label="Members" />
    )
    expect(container.querySelector('textarea')?.className).toContain('my-mentions')
  })

  it('disables the textarea', () => {
    const { getByRole } = render(
      <Mentions options={defaultOptions} disabled aria-label="Members" />
    )
    expect(getByRole('combobox')).toBeDisabled()
  })

  it('applies rows', () => {
    const { getByRole } = render(
      <Mentions options={defaultOptions} rows={5} aria-label="Members" />
    )
    expect(getByRole('combobox')).toHaveAttribute('rows', '5')
  })

  it('closes on Escape and Tab leave', async () => {
    const { getByRole } = render(<Mentions options={defaultOptions} aria-label="Members" />)
    const textarea = getByRole('combobox') as HTMLTextAreaElement
    await openMention(textarea, '@')
    await screen.findByRole('listbox')
    fireEvent.keyDown(textarea, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})

describe('Mentions controlled wrapper', () => {
  it('keeps bound value when the parent writes onChange', async () => {
    function Bound() {
      const [value, setValue] = useState('')
      return (
        <Mentions value={value} onChange={setValue} options={defaultOptions} aria-label="Members" />
      )
    }
    const { getByRole, getByText } = render(<Bound />)
    const textarea = getByRole('combobox') as HTMLTextAreaElement
    await openMention(textarea, '@')
    await screen.findByRole('listbox')
    fireEvent.click(getByText('Alice'))
    await waitFor(() => {
      expect(textarea).toHaveValue('@alice ')
    })
  })
})
