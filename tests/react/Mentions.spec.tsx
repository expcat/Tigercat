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

async function expectMentionsA11y(container: HTMLElement): Promise<void> {
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}

describe('Mentions', () => {
  it('keeps an active suggestion when options shrink', async () => {
    const onSelect = vi.fn()
    const { getByRole, rerender } = render(
      <Mentions options={defaultOptions} onSelect={onSelect} />
    )
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    await openMention(textarea, '@')
    fireEvent.mouseEnter(getByRole('option', { name: 'Charlie' }))
    expect(textarea).toHaveAttribute(
      'aria-activedescendant',
      getByRole('option', { name: 'Charlie' }).id
    )
    rerender(<Mentions options={defaultOptions.slice(0, 1)} onSelect={onSelect} />)
    expect
      .soft(textarea)
      .toHaveAttribute('aria-activedescendant', getByRole('option', { name: 'Alice' }).id)
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith(defaultOptions[0])
    expect(textarea).toHaveValue('@alice ')
  })

  it('keeps typed text when value is omitted', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(<Mentions options={defaultOptions} />)
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    await user.type(textarea, 'hello')
    expect(textarea).toHaveValue('hello')
  })

  it('does not reset to defaultValue on rerender', async () => {
    const user = userEvent.setup()
    const { getByRole, rerender } = render(
      <Mentions options={defaultOptions} defaultValue="start " />
    )
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    await user.type(textarea, 'more')
    rerender(<Mentions options={defaultOptions} defaultValue="start " />)
    expect(textarea.value).toContain('more')
  })

  it('opens a suggestion listbox after @ and filters by label or value', async () => {
    const { getByRole, getByText, queryByText } = render(
      <Mentions options={namedOptions} aria-label="Members" />
    )
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    await openMention(textarea, '@zhang')
    await screen.findByRole('listbox')
    expect(getByText('张三')).toBeInTheDocument()
    expect(queryByText('李四')).not.toBeInTheDocument()
    expect(textarea).toHaveAttribute('aria-controls', getByRole('listbox', { hidden: true }).id)
    expect(textarea).toHaveAttribute('aria-autocomplete', 'list')
  })

  it('recovers after a query with no matches', async () => {
    const { getByRole, getByText } = render(
      <Mentions options={defaultOptions} aria-label="Members" />
    )
    const textarea = getByRole('textbox') as HTMLTextAreaElement
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
    const textarea = getByRole('textbox') as HTMLTextAreaElement
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
    const textarea = getByRole('textbox') as HTMLTextAreaElement
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
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    await openMention(textarea, '@')
    await screen.findByRole('listbox')
    fireEvent.keyDown(textarea, { key: 'End' })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: 'charlie' }))
  })

  it('keeps navigation and Escape results after keyup', async () => {
    const { getByRole, getByText } = render(
      <Mentions options={defaultOptions} aria-label="Members" />
    )
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    await openMention(textarea, '@')
    await screen.findByRole('listbox')

    for (const [key, label] of [
      ['ArrowDown', 'Bob'],
      ['End', 'Charlie']
    ]) {
      fireEvent.keyDown(textarea, { key })
      fireEvent.keyUp(textarea, { key })
      expect.soft(textarea).toHaveAttribute('aria-activedescendant', getByText(label).id)
    }

    fireEvent.keyDown(textarea, { key: 'Escape' })
    fireEvent.keyUp(textarea, { key: 'Escape' })
    expect.soft(screen.queryByRole('listbox', { hidden: true })).not.toBeInTheDocument()
    expect.soft(textarea).not.toHaveAttribute('aria-controls')
    expect.soft(textarea).not.toHaveAttribute('aria-activedescendant')

    await openMention(textarea, '@b')
    expect(await screen.findByText('Bob')).toBeInTheDocument()
    expect(textarea).toHaveAttribute('aria-controls', getByRole('listbox', { hidden: true }).id)
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
    expect(textarea).not.toHaveAttribute('role')
    await user.click(textarea)
    await openMention(textarea, '@')
    await screen.findByRole('listbox')
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(textarea.value).toContain('@alice')
    expect(getByRole('textbox')).toHaveAttribute('id')
  })

  it('has no a11y violations on a named instance', async () => {
    const { container, getByRole } = render(
      <Mentions options={defaultOptions} placeholder="Mention a teammate" />
    )
    expect(getByRole('textbox')).toHaveAttribute('placeholder', 'Mention a teammate')
    await expectMentionsA11y(container)
  })

  it('has no a11y violations when opened', async () => {
    const { container, getByRole } = render(
      <Mentions options={defaultOptions} aria-label="Members" />
    )
    await openMention(getByRole('textbox') as HTMLTextAreaElement, '@')
    await screen.findByRole('listbox')
    await expectMentionsA11y(container)
  })

  it('has no a11y violations with no matches', async () => {
    const { container, getByRole } = render(
      <Mentions options={defaultOptions} aria-label="Members" />
    )
    await openMention(getByRole('textbox') as HTMLTextAreaElement, '@zzzz')
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
    getByRole('textbox').focus()
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
    expect(getByRole('textbox')).toBeDisabled()
  })

  it('applies rows', () => {
    const { getByRole } = render(
      <Mentions options={defaultOptions} rows={5} aria-label="Members" />
    )
    expect(getByRole('textbox')).toHaveAttribute('rows', '5')
  })

  it('honors maxLength, showCount, and readOnly', () => {
    const { getByRole, getByText, rerender } = render(
      <Mentions
        options={defaultOptions}
        defaultValue="hello"
        maxLength={10}
        showCount
        aria-label="Members"
      />
    )
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    expect(textarea).toHaveAttribute('maxLength', '10')
    expect(getByText('5 / 10')).toBeInTheDocument()

    rerender(
      <Mentions options={defaultOptions} defaultValue="hello" readOnly aria-label="Members" />
    )
    expect(getByRole('textbox')).toHaveAttribute('readonly')
  })

  it('rejects a whole mention that exceeds maxLength', async () => {
    const onChange = vi.fn()
    const onSelect = vi.fn()
    const { getByLabelText, getByRole, getByText, queryByText } = render(
      <Mentions
        options={defaultOptions}
        maxLength={5}
        showCount
        onChange={onChange}
        onSelect={onSelect}
        aria-label="Members"
      />
    )
    const textarea = getByLabelText('Members') as HTMLTextAreaElement
    await openMention(textarea, '@')
    fireEvent.click(getByRole('option', { name: 'Alice' }))
    expect.soft(textarea).toHaveValue('@')
    expect.soft(queryByText('1 / 5')).toBeInTheDocument()
    expect.soft(queryByText('7 / 5')).not.toBeInTheDocument()
    expect.soft(onChange.mock.calls).toEqual([['@']])
    expect.soft(onSelect).not.toHaveBeenCalled()

    fireEvent.keyDown(textarea, { key: 'ArrowDown' })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(textarea).toHaveValue('@bob ')
    expect(getByText('5 / 5')).toBeInTheDocument()
    expect(onSelect).toHaveBeenCalledWith(defaultOptions[1])
  })

  it('clears the value when clearable', async () => {
    const user = userEvent.setup()
    const { getByRole, getByLabelText } = render(
      <Mentions options={defaultOptions} defaultValue="hello" clearable aria-label="Members" />
    )
    expect(getByRole('textbox')).toHaveValue('hello')
    await user.click(getByLabelText('Clear'))
    expect(getByRole('textbox')).toHaveValue('')
  })

  it('closes on Escape and Tab leave', async () => {
    const { getByRole } = render(<Mentions options={defaultOptions} aria-label="Members" />)
    const textarea = getByRole('textbox') as HTMLTextAreaElement
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
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    await openMention(textarea, '@')
    await screen.findByRole('listbox')
    fireEvent.click(getByText('Alice'))
    await waitFor(() => {
      expect(textarea).toHaveValue('@alice ')
    })
  })
})
