/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { TagsInput } from '@expcat/tigercat-react/TagsInput'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('TagsInput', () => {
  describe('Rendering', () => {
    it('renders existing tags', () => {
      const { getByText } = render(<TagsInput defaultValue={['vue', 'react']} />)
      expect(getByText('vue')).toBeInTheDocument()
      expect(getByText('react')).toBeInTheDocument()
    })

    it('shows placeholder only when empty', () => {
      const { getByPlaceholderText, rerender, queryByPlaceholderText } = render(
        <TagsInput placeholder="Add tag" />
      )
      expect(getByPlaceholderText('Add tag')).toBeInTheDocument()
      rerender(<TagsInput placeholder="Add tag" value={['x']} />)
      expect(queryByPlaceholderText('Add tag')).not.toBeInTheDocument()
    })

    it('keeps ids unique for two unnamed instances in SSR and after rejections', async () => {
      const instances = (
        <>
          <TagsInput defaultValue={['a']} aria-label="First tags" />
          <TagsInput defaultValue={['b']} aria-label="Second tags" />
        </>
      )
      const ssr = document.createElement('div')
      ssr.innerHTML = renderToString(instances)
      const ssrIds = [...ssr.querySelectorAll('[id]')].map((node) => node.id)
      expect(ssrIds.length).toBeGreaterThanOrEqual(2)
      expect(new Set(ssrIds).size).toBe(ssrIds.length)

      const user = userEvent.setup()
      const { container, getAllByRole } = render(instances)
      const inputs = getAllByRole('textbox')
      for (const [index, tag] of ['a', 'b'].entries()) {
        await user.click(inputs[index])
        await user.keyboard(`${tag}{Enter}`)
        const rejectionId = inputs[index].getAttribute('aria-describedby')
        expect(rejectionId).toBeTruthy()
        expect(document.getElementById(rejectionId!)).toBe(
          inputs[index].parentElement?.querySelector('[aria-live="polite"]')
        )
      }
      const ids = [...container.querySelectorAll('[id]')].map((node) => node.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('Adding tags', () => {
    it('adds a tag on Enter (uncontrolled)', async () => {
      const user = userEvent.setup()
      const onAdd = vi.fn()
      const { getByRole, getByText } = render(<TagsInput onAdd={onAdd} />)
      const input = getByRole('textbox')
      await user.click(input)
      await user.keyboard('hello{Enter}')
      expect(getByText('hello')).toBeInTheDocument()
      expect(onAdd).toHaveBeenCalledWith('hello')
    })

    it('splits on a delimiter while typing', async () => {
      const user = userEvent.setup()
      const { getByRole, getByText } = render(<TagsInput />)
      const input = getByRole('textbox') as HTMLInputElement
      await user.click(input)
      await user.keyboard('a,')
      expect(getByText('a')).toBeInTheDocument()
      expect(input.value).toBe('')
    })

    it('rejects duplicates by default and keeps the pending text', async () => {
      const user = userEvent.setup()
      const onAdd = vi.fn()
      const { getAllByText, getByRole } = render(<TagsInput defaultValue={['dup']} onAdd={onAdd} />)
      const input = getByRole('textbox') as HTMLInputElement
      await user.click(input)
      await user.keyboard('dup{Enter}')
      expect(getAllByText('dup')).toHaveLength(1)
      expect(input.value).toBe('dup')
      expect(onAdd).not.toHaveBeenCalled()
    })

    it('rejects adds once max is reached', async () => {
      const user = userEvent.setup()
      const { queryByText, getByRole } = render(<TagsInput defaultValue={['a', 'b']} max={2} />)
      const input = getByRole('textbox')
      await user.click(input)
      await user.keyboard('c{Enter}')
      expect(queryByText('c')).not.toBeInTheDocument()
    })

    it('applies beforeAdd transform and veto', async () => {
      const user = userEvent.setup()
      const beforeAdd = (tag: string) => (tag === 'no' ? false : tag.toUpperCase())
      const { getByText, queryByText, getByRole } = render(<TagsInput beforeAdd={beforeAdd} />)
      const input = getByRole('textbox')
      await user.click(input)
      await user.keyboard('yes{Enter}')
      expect(getByText('YES')).toBeInTheDocument()
      await user.keyboard('no{Enter}')
      expect(queryByText('no')).not.toBeInTheDocument()
    })
  })

  describe('Removing tags', () => {
    it('two-stage backspace: highlight then remove', async () => {
      const user = userEvent.setup()
      const onRemove = vi.fn()
      const { getByRole, queryByText } = render(
        <TagsInput defaultValue={['a', 'b']} onRemove={onRemove} />
      )
      const input = getByRole('textbox')
      await user.click(input)
      await user.keyboard('{Backspace}')
      expect(onRemove).not.toHaveBeenCalled() // first press highlights
      await user.keyboard('{Backspace}')
      expect(onRemove).toHaveBeenCalledWith('b', 1)
      expect(queryByText('b')).not.toBeInTheDocument()
    })

    it('removes a tag via its close button', async () => {
      const user = userEvent.setup()
      const onRemove = vi.fn()
      const { getByLabelText, queryByText } = render(
        <TagsInput defaultValue={['solo']} onRemove={onRemove} />
      )
      await user.click(getByLabelText('Remove solo'))
      expect(onRemove).toHaveBeenCalledWith('solo', 0)
      expect(queryByText('solo')).not.toBeInTheDocument()
    })

    it('clears all tags with the clear button', async () => {
      const user = userEvent.setup()
      const onClear = vi.fn()
      const { getByLabelText, queryByText } = render(
        <TagsInput defaultValue={['a', 'b']} clearable onClear={onClear} />
      )
      await user.click(getByLabelText('Clear all tags'))
      expect(onClear).toHaveBeenCalled()
      expect(queryByText('a')).not.toBeInTheDocument()
    })
  })

  describe('Sorting tags', () => {
    it('commits the reordered array when a tag is dropped on another tag', () => {
      const onChange = vi.fn()
      const { getAllByRole } = render(
        <TagsInput defaultValue={['a', 'b', 'c']} onChange={onChange} />
      )
      const items = getAllByRole('listitem')
      items.forEach((item) => expect(item).toHaveAttribute('draggable', 'true'))
      const dataTransfer = new DataTransfer()
      fireEvent.dragStart(items[0], { dataTransfer })
      expect(dataTransfer.getData('text/plain')).toBe('0')
      fireEvent.dragOver(items[2], { dataTransfer })
      fireEvent.drop(items[2], { dataTransfer })
      expect(onChange).toHaveBeenCalledExactlyOnceWith(['b', 'c', 'a'])
      expect(getAllByRole('listitem').map((item) => item.textContent)).toEqual(['b', 'c', 'a'])
    })

    it('ignores external text drops, including empty and numeric text', () => {
      const onChange = vi.fn()
      const { getAllByRole } = render(
        <TagsInput defaultValue={['a', 'b', 'c']} onChange={onChange} />
      )
      for (const text of ['', '0']) {
        const dataTransfer = new DataTransfer()
        dataTransfer.setData('text/plain', text)
        fireEvent.drop(getAllByRole('listitem')[2], { dataTransfer })
        expect(onChange).not.toHaveBeenCalled()
        expect(getAllByRole('listitem').map((item) => item.textContent)).toEqual(['a', 'b', 'c'])
      }
    })

    it('ignores drops when the instance becomes read-only during a drag', () => {
      const onChange = vi.fn()
      const { getAllByRole, rerender } = render(
        <TagsInput defaultValue={['a', 'b', 'c']} onChange={onChange} />
      )
      const dataTransfer = new DataTransfer()
      fireEvent.dragStart(getAllByRole('listitem')[0], { dataTransfer })
      rerender(<TagsInput defaultValue={['a', 'b', 'c']} readOnly onChange={onChange} />)
      fireEvent.drop(getAllByRole('listitem')[2], { dataTransfer })
      expect(onChange).not.toHaveBeenCalled()
      expect(getAllByRole('listitem').map((item) => item.textContent)).toEqual(['a', 'b', 'c'])
    })
  })

  describe('Accessibility', () => {
    it('owns the list containing the active tag after Backspace', async () => {
      const user = userEvent.setup()
      const { getByRole, getAllByRole } = render(
        <TagsInput defaultValue={['a', 'b']} aria-label="Tags" />
      )
      const input = getByRole('textbox', { name: 'Tags' })
      await user.click(input)
      await user.keyboard('{Backspace}')
      const activeTag = document.getElementById(input.getAttribute('aria-activedescendant')!)
      expect(activeTag).toBe(getAllByRole('listitem')[1])
      const list = getByRole('list')
      expect(list.id).not.toBe('')
      expect(input).toHaveAttribute('aria-owns', list.id)
      expect(list).toContainElement(activeTag)
    })

    it.each(['{Enter}', ' '])(
      'clears once with %s after Tab and returns focus to the input',
      async (key) => {
        const user = userEvent.setup()
        const onChange = vi.fn()
        const onClear = vi.fn()
        const { getByRole, queryByRole, queryAllByRole } = render(
          <TagsInput
            defaultValue={['a', 'b']}
            clearable
            onChange={onChange}
            onClear={onClear}
            aria-label="Tags"
          />
        )
        const input = getByRole('textbox', { name: 'Tags' })
        input.focus()
        await user.tab()
        expect(getByRole('button', { name: 'Clear all tags' })).toHaveFocus()
        await user.keyboard(key)
        expect(onChange).toHaveBeenCalledExactlyOnceWith([])
        expect(onClear).toHaveBeenCalledTimes(1)
        expect(queryAllByRole('listitem')).toHaveLength(0)
        expect(queryByRole('button', { name: 'Clear all tags' })).not.toBeInTheDocument()
        expect(input).toHaveFocus()
      }
    )

    it('marks the input invalid and links the FormItem error message', () => {
      const { getByRole, getByText } = render(
        <Form>
          <FormItem name="tags" error="Required">
            <TagsInput aria-label="Tags" />
          </FormItem>
        </Form>
      )
      const input = getByRole('textbox', { name: 'Tags' })
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(getByText('Required')).toBeInTheDocument()
      expect(input.getAttribute('aria-describedby')).toBeTruthy()
    })

    it('has no a11y violations', async () => {
      const { container, getByRole } = render(
        <TagsInput defaultValue={['a']} placeholder="Add" aria-label="Tags" />
      )
      fireEvent.keyDown(getByRole('textbox'), { key: 'Backspace' })
      await expectNoA11yViolationsIsolated(container)
    })

    it('closes a tag with the keyboard and returns focus to the input', async () => {
      const user = userEvent.setup()
      const { getByRole, queryByText } = render(
        <TagsInput defaultValue={['vue', 'react']} aria-label="Tags" />
      )
      await user.tab()
      expect(getByRole('button', { name: /vue/ })).toHaveFocus()
      await user.keyboard('{Enter}')
      expect(queryByText('vue')).not.toBeInTheDocument()
      expect(getByRole('textbox')).toHaveFocus()
    })
  })

  describe('Rejected pending', () => {
    it('keeps the pending text when a duplicate is committed with a delimiter', async () => {
      const user = userEvent.setup()
      const onAdd = vi.fn()
      const { getByRole } = render(
        <TagsInput defaultValue={['dup']} onAdd={onAdd} aria-label="Tags" />
      )
      const input = getByRole('textbox') as HTMLInputElement
      await user.click(input)
      await user.keyboard('dup,')
      expect(input.value).toBe('dup')
      expect(onAdd).not.toHaveBeenCalled()
    })
  })
})
