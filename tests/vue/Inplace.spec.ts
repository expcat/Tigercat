/**
 * @vitest-environment happy-dom
 */

import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
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
    const { getByRole, getByTestId, queryByTestId } = render(Harness)
    await fireEvent.click(getByRole('button', { name: 'Hello' }))
    expect(getByTestId('field')).toBeTruthy()
    await fireEvent.keyDown(getByTestId('field'), { key: 'Enter' })
    expect(queryByTestId('field')).toBeNull()

    await fireEvent.click(getByRole('button', { name: 'Hello' }))
    await fireEvent.keyDown(getByTestId('field'), { key: 'Escape' })
    expect(queryByTestId('field')).toBeNull()
    expect(getByRole('button', { name: 'Hello' })).toBeTruthy()
  })
})
