import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { RadioGroup } from '@expcat/tigercat-react/RadioGroup'

describe('RadioGroup required semantics (React)', () => {
  it('inherits aria-required from a required FormItem', async () => {
    render(
      <FormItem label="Choice" required>
        <RadioGroup options={[{ label: 'A', value: 'a' }]} />
      </FormItem>
    )

    const group = screen.getByRole('radiogroup', { name: 'Choice' })
    expect(group).toHaveAttribute('aria-required', 'true')
    const results = await axe(group, { runOnly: ['aria-allowed-attr'] })
    expect(results.violations).toEqual([])
  })

  it('preserves explicit aria-required in a required FormItem', () => {
    render(
      <FormItem label="Choice" required>
        <RadioGroup aria-required={false} options={[{ label: 'A', value: 'a' }]} />
      </FormItem>
    )

    expect(screen.getByRole('radiogroup', { name: 'Choice' })).toHaveAttribute(
      'aria-required',
      'false'
    )
  })
})
