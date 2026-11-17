/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { defineComponent, h } from 'vue'
import { render, fireEvent, screen, waitFor } from '@testing-library/vue'
import { Mentions } from '@expcat/tigercat-vue/Mentions'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { axe } from '../utils'

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
  textarea.value = value
  textarea.setSelectionRange(selectionStart, selectionStart)
  await fireEvent.input(textarea)
}

async function expectMentionsA11y(container: HTMLElement): Promise<void> {
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}

describe('Mentions', () => {
  it('keeps an active suggestion when options shrink', async () => {
    const { getByRole, rerender, emitted } = render(Mentions, {
      props: { options: defaultOptions }
    })
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    await openMention(textarea, '@')
    await fireEvent.mouseEnter(getByRole('option', { name: 'Charlie' }))
    expect(textarea).toHaveAttribute(
      'aria-activedescendant',
      getByRole('option', { name: 'Charlie' }).id
    )
    await rerender({ options: defaultOptions.slice(0, 1) })
    expect
      .soft(textarea)
      .toHaveAttribute('aria-activedescendant', getByRole('option', { name: 'Alice' }).id)
    await fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(emitted().select?.[0]?.[0]).toEqual(defaultOptions[0])
    expect(textarea).toHaveValue('@alice ')
  })

  it('keeps typed text when modelValue is omitted', async () => {
    const { getByRole } = render(Mentions, { props: { options: defaultOptions } })
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    await fireEvent.update(textarea, 'hello')
    expect(textarea).toHaveValue('hello')
  })

  it('keeps the controlled value when the parent rejects non-empty input', async () => {
    const { getByRole, emitted, rerender } = render(Mentions, {
      props: { modelValue: 'keep', options: defaultOptions }
    })
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    await fireEvent.update(textarea, 'keep-more')
    expect(textarea).toHaveValue('keep')
    expect(emitted()['update:modelValue']).toEqual([['keep-more']])
    await rerender({ modelValue: 'keep-more' })
    expect(textarea).toHaveValue('keep-more')
  })

  it('does not reset to defaultValue on rerender', async () => {
    const { getByRole, rerender } = render(Mentions, {
      props: { options: defaultOptions, defaultValue: 'start ' }
    })
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    await fireEvent.update(textarea, 'start more')
    await rerender({ options: defaultOptions, defaultValue: 'start ' })
    expect(textarea.value).toContain('more')
  })

  it('opens a suggestion listbox after @ and filters by label or value', async () => {
    const { getByRole, getByText, queryByText } = render(Mentions, {
      props: { options: namedOptions, 'aria-label': 'Members' }
    })
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    await openMention(textarea, '@zhang')
    await screen.findByRole('listbox')
    expect(getByText('张三')).toBeInTheDocument()
    expect(queryByText('李四')).not.toBeInTheDocument()
    expect(textarea).toHaveAttribute('aria-controls', getByRole('listbox', { hidden: true }).id)
    expect(textarea).toHaveAttribute('aria-autocomplete', 'list')
  })

  it('recovers after a query with no matches', async () => {
    const { getByRole, getByText } = render(Mentions, {
      props: { options: defaultOptions, 'aria-label': 'Members' }
    })
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    await openMention(textarea, '@z')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    await openMention(textarea, '@al')
    await screen.findByRole('listbox')
    expect(getByText('Alice')).toBeInTheDocument()
  })

  it('inserts prefix + value from the live textarea, not a stale modelValue', async () => {
    const { getByRole, getByText, emitted } = render(Mentions, {
      props: {
        options: defaultOptions,
        modelValue: 'hello ',
        'aria-label': 'Members'
      }
    })
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    await openMention(textarea, 'hello @al', 9)
    await screen.findByRole('listbox')
    await fireEvent.mouseDown(getByText('Alice'))
    await fireEvent.click(getByText('Alice'))
    expect(emitted()['update:modelValue']?.at(-1)).toEqual(['hello @alice '])
    expect(emitted().select?.[0]?.[0]).toEqual(expect.objectContaining({ value: 'alice' }))
    expect(document.activeElement).toBe(textarea)
  })

  it('does not eat Enter when the list is closed', async () => {
    const { getByRole, emitted } = render(Mentions, {
      props: { options: defaultOptions, 'aria-label': 'Members' }
    })
    await fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' })
    expect(emitted().select).toBeUndefined()
  })

  it('skips disabled options with the keyboard', async () => {
    const { getByRole, emitted } = render(Mentions, {
      props: {
        options: [...defaultOptions, { value: 'dave', label: 'Dave', disabled: true }],
        'aria-label': 'Members'
      }
    })
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    await openMention(textarea, '@')
    await screen.findByRole('listbox')
    await fireEvent.keyDown(textarea, { key: 'End' })
    await fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(emitted().select?.[0]?.[0]).toEqual(expect.objectContaining({ value: 'charlie' }))
  })

  it('keeps navigation and Escape results after keyup', async () => {
    const { getByRole, getByText } = render(Mentions, {
      props: { options: defaultOptions, 'aria-label': 'Members' }
    })
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    await openMention(textarea, '@')
    await screen.findByRole('listbox')

    for (const [key, label] of [
      ['ArrowDown', 'Bob'],
      ['End', 'Charlie']
    ]) {
      await fireEvent.keyDown(textarea, { key })
      await fireEvent.keyUp(textarea, { key })
      expect.soft(textarea).toHaveAttribute('aria-activedescendant', getByText(label).id)
    }

    await fireEvent.keyDown(textarea, { key: 'Escape' })
    await fireEvent.keyUp(textarea, { key: 'Escape' })
    expect.soft(screen.queryByRole('listbox', { hidden: true })).not.toBeInTheDocument()
    expect.soft(textarea).not.toHaveAttribute('aria-controls')
    expect.soft(textarea).not.toHaveAttribute('aria-activedescendant')

    await openMention(textarea, '@b')
    expect(await screen.findByText('Bob')).toBeInTheDocument()
    expect(textarea).toHaveAttribute('aria-controls', getByRole('listbox', { hidden: true }).id)
  })

  it('writes FormItem model on type and select', async () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(Form, () =>
            h(FormItem, { name: 'note', label: 'Note' }, () =>
              h(Mentions, { options: defaultOptions })
            )
          )
      }
    })
    const { getByLabelText } = render(Wrapper)
    const textarea = getByLabelText('Note') as HTMLTextAreaElement
    expect(textarea).not.toHaveAttribute('role')
    await openMention(textarea, '@')
    await screen.findByRole('listbox')
    await fireEvent.keyDown(textarea, { key: 'Enter' })
    await waitFor(() => {
      expect(textarea.value).toContain('@alice')
    })
  })

  it('has no a11y violations on a named instance', async () => {
    const { container, getByRole } = render(Mentions, {
      props: { options: defaultOptions, placeholder: 'Mention a teammate' }
    })
    expect(getByRole('textbox')).toHaveAttribute('placeholder', 'Mention a teammate')
    await expectMentionsA11y(container)
  })

  it('has no a11y violations when opened', async () => {
    const { container, getByRole } = render(Mentions, {
      props: { options: defaultOptions, 'aria-label': 'Members' }
    })
    await openMention(getByRole('textbox') as HTMLTextAreaElement, '@')
    await screen.findByRole('listbox')
    await expectMentionsA11y(container)
  })

  it('has no a11y violations with no matches', async () => {
    const { container, getByRole } = render(Mentions, {
      props: { options: defaultOptions, 'aria-label': 'Members' }
    })
    await openMention(getByRole('textbox') as HTMLTextAreaElement, '@zzzz')
    await expectMentionsA11y(container)
  })

  it('has no a11y violations inside a labelled FormItem', async () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(Form, () =>
            h(FormItem, { name: 'note', label: 'Note' }, () =>
              h(Mentions, { options: defaultOptions })
            )
          )
      }
    })
    const { container, getByRole } = render(Wrapper)
    await fireEvent.focus(getByRole('textbox'))
    await expectMentionsA11y(container)
  })

  it('merges className onto the chrome textarea', () => {
    const { container } = render(Mentions, {
      props: { options: defaultOptions, className: 'my-mentions', 'aria-label': 'Members' }
    })
    expect(container.querySelector('textarea')?.className).toContain('my-mentions')
  })

  it('disables the textarea', () => {
    const { getByRole } = render(Mentions, {
      props: { options: defaultOptions, disabled: true, 'aria-label': 'Members' }
    })
    expect(getByRole('textbox')).toBeDisabled()
  })

  it('applies rows', () => {
    const { getByRole } = render(Mentions, {
      props: { options: defaultOptions, rows: 5, 'aria-label': 'Members' }
    })
    expect(getByRole('textbox')).toHaveAttribute('rows', '5')
  })

  it('auto-resizes the initial multiline value after mounting', async () => {
    const { getByLabelText } = render(Mentions, {
      props: {
        defaultValue: 'one\ntwo\nthree\nfour',
        autoResize: true,
        minRows: 5,
        maxRows: 8,
        'aria-label': 'Members'
      }
    })
    const textarea = getByLabelText('Members') as HTMLTextAreaElement
    await waitFor(() => {
      expect(textarea.style.height).toMatch(/^\d+px$/)
      expect(textarea.style.overflowY).toBe('hidden')
    })
  })

  it('honors maxLength, showCount, and readOnly', async () => {
    const { getByRole, getByText, rerender } = render(Mentions, {
      props: {
        options: defaultOptions,
        defaultValue: 'hello',
        maxLength: 10,
        showCount: true,
        'aria-label': 'Members'
      }
    })
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    expect(textarea).toHaveAttribute('maxlength', '10')
    expect(getByText('5 / 10')).toBeInTheDocument()

    await rerender({
      options: defaultOptions,
      defaultValue: 'hello',
      readOnly: true,
      'aria-label': 'Members'
    })
    expect(getByRole('textbox')).toHaveAttribute('readonly')
  })

  it('rejects a whole mention that exceeds maxLength', async () => {
    const { getByLabelText, getByRole, getByText, queryByText, emitted } = render(Mentions, {
      props: {
        options: defaultOptions,
        maxLength: 5,
        showCount: true,
        'aria-label': 'Members'
      }
    })
    const textarea = getByLabelText('Members') as HTMLTextAreaElement
    await openMention(textarea, '@')
    await fireEvent.click(getByRole('option', { name: 'Alice' }))
    expect.soft(textarea).toHaveValue('@')
    expect.soft(queryByText('1 / 5')).toBeInTheDocument()
    expect.soft(queryByText('7 / 5')).not.toBeInTheDocument()
    expect.soft(emitted()['update:modelValue']).toEqual([['@']])
    expect.soft(emitted().select).toBeUndefined()

    await fireEvent.keyDown(textarea, { key: 'ArrowDown' })
    await fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(textarea).toHaveValue('@bob ')
    expect(getByText('5 / 5')).toBeInTheDocument()
    expect(emitted().select).toEqual([[defaultOptions[1]]])
  })

  it('clears the value when clearable', async () => {
    const { getByRole, getByLabelText } = render(Mentions, {
      props: {
        options: defaultOptions,
        defaultValue: 'hello',
        clearable: true,
        'aria-label': 'Members'
      }
    })
    expect(getByRole('textbox')).toHaveValue('hello')
    await fireEvent.click(getByLabelText('Clear'))
    expect(getByRole('textbox')).toHaveValue('')
  })

  it('closes on Escape', async () => {
    const { getByRole } = render(Mentions, {
      props: { options: defaultOptions, 'aria-label': 'Members' }
    })
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    await openMention(textarea, '@')
    await screen.findByRole('listbox')
    await fireEvent.keyDown(textarea, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
