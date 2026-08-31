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

/** textarea + combobox is the APG mentions pattern; axe-core still rejects that pairing. */
async function expectMentionsA11y(container: HTMLElement): Promise<void> {
  const results = await axe(container, {
    rules: { 'aria-allowed-role': { enabled: false } }
  })
  expect(results).toHaveNoViolations()
}

describe('Mentions', () => {
  it('keeps typed text when modelValue is omitted', async () => {
    const { getByRole } = render(Mentions, { props: { options: defaultOptions } })
    const textarea = getByRole('combobox') as HTMLTextAreaElement
    await fireEvent.update(textarea, 'hello')
    expect(textarea).toHaveValue('hello')
  })

  it('does not reset to defaultValue on rerender', async () => {
    const { getByRole, rerender } = render(Mentions, {
      props: { options: defaultOptions, defaultValue: 'start ' }
    })
    const textarea = getByRole('combobox') as HTMLTextAreaElement
    await fireEvent.update(textarea, 'start more')
    await rerender({ options: defaultOptions, defaultValue: 'start ' })
    expect(textarea.value).toContain('more')
  })

  it('opens a combobox listbox after @ and filters by label or value', async () => {
    const { getByRole, getByText, queryByText } = render(Mentions, {
      props: { options: namedOptions, 'aria-label': 'Members' }
    })
    const textarea = getByRole('combobox') as HTMLTextAreaElement
    await openMention(textarea, '@zhang')
    await screen.findByRole('listbox')
    expect(getByText('张三')).toBeInTheDocument()
    expect(queryByText('李四')).not.toBeInTheDocument()
    expect(textarea).toHaveAttribute('aria-expanded', 'true')
    expect(textarea).toHaveAttribute('aria-autocomplete', 'list')
  })

  it('recovers after a query with no matches', async () => {
    const { getByRole, getByText } = render(Mentions, {
      props: { options: defaultOptions, 'aria-label': 'Members' }
    })
    const textarea = getByRole('combobox') as HTMLTextAreaElement
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
    const textarea = getByRole('combobox') as HTMLTextAreaElement
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
    await fireEvent.keyDown(getByRole('combobox'), { key: 'Enter' })
    expect(emitted().select).toBeUndefined()
  })

  it('skips disabled options with the keyboard', async () => {
    const { getByRole, emitted } = render(Mentions, {
      props: {
        options: [...defaultOptions, { value: 'dave', label: 'Dave', disabled: true }],
        'aria-label': 'Members'
      }
    })
    const textarea = getByRole('combobox') as HTMLTextAreaElement
    await openMention(textarea, '@')
    await screen.findByRole('listbox')
    await fireEvent.keyDown(textarea, { key: 'End' })
    await fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(emitted().select?.[0]?.[0]).toEqual(expect.objectContaining({ value: 'charlie' }))
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
    const { getByLabelText, getByText } = render(Wrapper)
    const textarea = getByLabelText('Note') as HTMLTextAreaElement
    expect(textarea).toHaveAttribute('role', 'combobox')
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
    expect(getByRole('combobox')).toHaveAttribute('placeholder', 'Mention a teammate')
    await expectMentionsA11y(container)
  })

  it('has no a11y violations when opened', async () => {
    const { container, getByRole } = render(Mentions, {
      props: { options: defaultOptions, 'aria-label': 'Members' }
    })
    await openMention(getByRole('combobox') as HTMLTextAreaElement, '@')
    await screen.findByRole('listbox')
    await expectMentionsA11y(container)
  })

  it('has no a11y violations with no matches', async () => {
    const { container, getByRole } = render(Mentions, {
      props: { options: defaultOptions, 'aria-label': 'Members' }
    })
    await openMention(getByRole('combobox') as HTMLTextAreaElement, '@zzzz')
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
    await fireEvent.focus(getByRole('combobox'))
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
    expect(getByRole('combobox')).toBeDisabled()
  })

  it('applies rows', () => {
    const { getByRole } = render(Mentions, {
      props: { options: defaultOptions, rows: 5, 'aria-label': 'Members' }
    })
    expect(getByRole('combobox')).toHaveAttribute('rows', '5')
  })

  it('closes on Escape', async () => {
    const { getByRole } = render(Mentions, {
      props: { options: defaultOptions, 'aria-label': 'Members' }
    })
    const textarea = getByRole('combobox') as HTMLTextAreaElement
    await openMention(textarea, '@')
    await screen.findByRole('listbox')
    await fireEvent.keyDown(textarea, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
