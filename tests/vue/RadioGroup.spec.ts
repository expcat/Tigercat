import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { h } from 'vue'
import { axe } from 'jest-axe'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { RadioGroup } from '@expcat/tigercat-vue/RadioGroup'

describe('RadioGroup required semantics (Vue)', () => {
  it('inherits aria-required from a required FormItem', async () => {
    render(FormItem, {
      props: { label: 'Choice', required: true },
      slots: { default: () => h(RadioGroup, { options: [{ label: 'A', value: 'a' }] }) }
    })

    const group = screen.getByRole('radiogroup', { name: 'Choice' })
    expect(group).toHaveAttribute('aria-required', 'true')
    const results = await axe(group, { runOnly: ['aria-allowed-attr'] })
    expect(results.violations).toEqual([])
  })

  it('preserves explicit aria-required in a required FormItem', () => {
    render(FormItem, {
      props: { label: 'Choice', required: true },
      slots: {
        default: () =>
          h(RadioGroup, { options: [{ label: 'A', value: 'a' }], 'aria-required': false })
      }
    })

    expect(screen.getByRole('radiogroup', { name: 'Choice' })).toHaveAttribute(
      'aria-required',
      'false'
    )
  })
})
