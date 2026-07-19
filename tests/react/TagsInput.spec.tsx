/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { TagsInput } from '@expcat/tigercat-react'
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
      const { getAllByText, getByRole } = render(
        <TagsInput defaultValue={['dup']} onAdd={onAdd} />
      )
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

  describe('Accessibility', () => {
    it('marks the input invalid and links the error message', () => {
      const { getByRole, getByText } = render(
        <TagsInput status="error" errorMessage="Required" />
      )
      const input = getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(getByText('Required')).toBeInTheDocument()
    })

    it('has no a11y violations', async () => {
      const { container } = render(
        <TagsInput defaultValue={['a']} placeholder="Add" aria-label="Tags" />
      )
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
