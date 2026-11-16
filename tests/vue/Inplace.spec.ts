/**
 * @vitest-environment happy-dom
 */

import { defineComponent, h, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/vue'
import { Inplace } from '../../packages/vue/src/components/Inplace'

const Harness = defineComponent({
  setup() {
    return () =>
      h(Inplace, null, {
        display: () => 'Hello',
        input: () => h('input', { 'data-testid': 'field', value: 'Hello' })
      })
  }
})

describe('Inplace', () => {
  it('enters edit on click, commits with Enter, and cancels with Escape', async () => {
    const onEditingChange = vi.fn()
    const { getByRole, getByTestId, queryByTestId } = render(Harness, {
      attrs: { onEditingChange }
    })
    await fireEvent.click(getByRole('button', { name: 'Hello' }))
    expect(getByTestId('field')).toBeTruthy()
    await fireEvent.keyDown(getByTestId('field'), { key: 'Enter' })
    expect(queryByTestId('field')).toBeNull()

    await fireEvent.click(getByRole('button', { name: 'Hello' }))
    await fireEvent.keyDown(getByTestId('field'), { key: 'Escape' })
    expect(queryByTestId('field')).toBeNull()
    expect(getByRole('button', { name: 'Hello' })).toBeTruthy()
    expect(onEditingChange.mock.calls).toEqual([[true], [false], [true], [false]])
  })

  it('ignores composing keys and an enter the child already cancelled', async () => {
    let cancelEnter = false
    const Keys = defineComponent({
      setup() {
        return () =>
          h(Inplace, null, {
            display: () => 'Hello',
            input: () =>
              h('input', {
                'data-testid': 'field',
                onKeydown: (event: KeyboardEvent) => {
                  if (cancelEnter && event.key === 'Enter') event.preventDefault()
                }
              })
          })
      }
    })
    const { getByRole, getByTestId } = render(Keys)
    await fireEvent.click(getByRole('button', { name: 'Hello' }))
    await fireEvent.keyDown(getByTestId('field'), { key: 'Enter', isComposing: true })
    expect(getByTestId('field')).toBeTruthy()
    await fireEvent.keyDown(getByTestId('field'), { key: 'Escape', isComposing: true })
    expect(getByTestId('field')).toBeTruthy()
    cancelEnter = true
    await fireEvent.keyDown(getByTestId('field'), { key: 'Enter' })
    expect(getByTestId('field')).toBeTruthy()
  })

  it('focuses the editor after activation and restores the trigger', async () => {
    const FocusHarness = defineComponent({
      setup() {
        const editing = ref(false)
        return () =>
          h(
            Inplace,
            {
              editing: editing.value,
              'onUpdate:editing': (next: boolean) => {
                editing.value = next
              }
            },
            {
              display: () => '行内标题',
              input: () => h('input', { 'aria-label': '编辑标题', value: '行内标题' })
            }
          )
      }
    })
    const { getByRole } = render(FocusHarness)
    await fireEvent.click(getByRole('button', { name: '行内标题' }))
    const field = getByRole('textbox', { name: '编辑标题' })
    expect(document.activeElement).toBe(field)
    await fireEvent.keyDown(field, { key: 'Enter' })
    const committed = getByRole('button', { name: '行内标题' })
    expect(document.activeElement).toBe(committed)
    await fireEvent.click(committed)
    const again = getByRole('textbox', { name: '编辑标题' })
    expect(document.activeElement).toBe(again)
    await fireEvent.keyDown(again, { key: 'Escape' })
    expect(document.activeElement).toBe(getByRole('button', { name: '行内标题' }))
  })
})
