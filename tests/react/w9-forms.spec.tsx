/**
 * @vitest-environment happy-dom
 */
import React, { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import { Select } from '@expcat/tigercat-react/Select'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Input } from '@expcat/tigercat-react/Input'
import { InputNumber } from '@expcat/tigercat-react/InputNumber'
import { Slider } from '@expcat/tigercat-react/Slider'

describe('W9 react forms', () => {
  it('selects filtered options up to maxCount', () => {
    function Host() {
      const [value, setValue] = useState<string[]>([])
      return (
        <Select
          multiple
          aria-label="People"
          maxCount={2}
          value={value}
          onChange={setValue}
          options={[
            { label: 'Ada', value: 'a', description: 'Pilot' },
            { label: 'Bea', value: 'b' },
            { label: 'Cam', value: 'c' }
          ]}
        />
      )
    }
    render(<Host />)
    fireEvent.click(screen.getByRole('combobox'))
    expect(screen.getByText('Pilot')).toBeTruthy()
    fireEvent.click(document.querySelector('[data-tiger-select-all]') as HTMLElement)
    expect(screen.getByRole('combobox')).toHaveTextContent('Ada')
    expect(screen.getByRole('combobox')).toHaveTextContent('Bea')
  })

  it('does not change a read-only select', () => {
    function Host() {
      const [value, setValue] = useState('a')
      return (
        <Select
          aria-label="People"
          readOnly
          value={value}
          onChange={setValue}
          options={[
            { label: 'Ada', value: 'a' },
            { label: 'Bea', value: 'b' }
          ]}
        />
      )
    }
    render(<Host />)
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('Bea'))
    expect(screen.getByRole('combobox')).toHaveTextContent('Ada')
  })

  it('submits a big integer as text and focuses from the error summary', async () => {
    render(<InputNumber aria-label="Big" name="big" defaultValue="9007199254740993" />)
    expect(screen.getByRole('spinbutton')).toHaveValue('9007199254740993')

    const form = render(
      <Form showErrorSummary rules={{ name: [{ required: true, message: 'Name required' }] }}>
        <FormItem name="name" label="Name">
          <Input aria-label="Name" />
        </FormItem>
      </Form>
    )
    fireEvent.submit(form.container.querySelector('form') as HTMLFormElement)
    const summary = await screen.findByRole('button', { name: 'Name required' })
    fireEvent.click(summary)
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus()
  })

  it('ignores arrow keys on a read-only slider', () => {
    render(<Slider aria-label="Volume" defaultValue={20} readOnly />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '20')
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(slider).toHaveAttribute('aria-valuenow', '20')
  })
})
