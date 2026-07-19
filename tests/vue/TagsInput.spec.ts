/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { TagsInput } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('TagsInput', () => {
  describe('Rendering', () => {
    it('renders existing tags from modelValue', () => {
      const { getByText } = render(TagsInput, { props: { modelValue: ['vue', 'react'] } })
      expect(getByText('vue')).toBeInTheDocument()
      expect(getByText('react')).toBeInTheDocument()
    })
  })

  describe('Adding tags', () => {
    it('adds a tag on Enter and emits update:modelValue + add', async () => {
      const onUpdate = vi.fn()
      const onAdd = vi.fn()
      const { getByRole } = render(TagsInput, {
        props: { 'onUpdate:modelValue': onUpdate, onAdd }
      })
      const input = getByRole('textbox') as HTMLInputElement
      await fireEvent.update(input, 'hello')
      await fireEvent.keyDown(input, { key: 'Enter' })
      expect(onAdd).toHaveBeenCalledWith('hello')
      expect(onUpdate).toHaveBeenCalledWith(['hello'])
    })

    it('splits on a delimiter while typing', async () => {
      const onAdd = vi.fn()
      const { getByRole } = render(TagsInput, { props: { onAdd } })
      const input = getByRole('textbox') as HTMLInputElement
      await fireEvent.update(input, 'a,')
      expect(onAdd).toHaveBeenCalledWith('a')
    })

    it('rejects duplicates by default', async () => {
      const onAdd = vi.fn()
      const { getAllByText, getByRole } = render(TagsInput, {
        props: { modelValue: ['dup'], onAdd }
      })
      const input = getByRole('textbox') as HTMLInputElement
      await fireEvent.update(input, 'dup')
      await fireEvent.keyDown(input, { key: 'Enter' })
      expect(getAllByText('dup')).toHaveLength(1)
      expect(onAdd).not.toHaveBeenCalled()
    })

    it('applies beforeAdd transform', async () => {
      const beforeAdd = (tag: string) => tag.toUpperCase()
      const { getByText, getByRole } = render(TagsInput, { props: { beforeAdd } })
      const input = getByRole('textbox') as HTMLInputElement
      await fireEvent.update(input, 'yes')
      await fireEvent.keyDown(input, { key: 'Enter' })
      expect(getByText('YES')).toBeInTheDocument()
    })
  })

  describe('Removing tags', () => {
    it('removes a tag via its close button', async () => {
      const onRemove = vi.fn()
      const { getByLabelText } = render(TagsInput, {
        props: { modelValue: ['solo'], onRemove }
      })
      await fireEvent.click(getByLabelText('Remove solo'))
      expect(onRemove).toHaveBeenCalledWith('solo', 0)
    })

    it('two-stage backspace highlights then removes', async () => {
      const onRemove = vi.fn()
      const { getByRole } = render(TagsInput, {
        props: { modelValue: ['a', 'b'], onRemove }
      })
      const input = getByRole('textbox') as HTMLInputElement
      await fireEvent.keyDown(input, { key: 'Backspace' })
      expect(onRemove).not.toHaveBeenCalled()
      await fireEvent.keyDown(input, { key: 'Backspace' })
      expect(onRemove).toHaveBeenCalledWith('b', 1)
    })
  })

  describe('Accessibility', () => {
    it('has no a11y violations', async () => {
      const { container } = render(TagsInput, {
        props: { modelValue: ['a'], placeholder: 'Add' },
        attrs: { 'aria-label': 'Tags' }
      })
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
