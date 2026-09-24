/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Inplace } from '../../packages/react/src/components/Inplace'

describe('Inplace', () => {
  it('enters edit on click, commits with Enter, and cancels with Escape', () => {
    render(<Inplace display="Hello" input={<input data-testid="field" defaultValue="Hello" />} />)
    fireEvent.click(screen.getByRole('button', { name: 'Hello' }))
    expect(screen.getByTestId('field')).toBeTruthy()
    fireEvent.keyDown(screen.getByTestId('field'), { key: 'Enter' })
    expect(screen.queryByTestId('field')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Hello' }))
    fireEvent.keyDown(screen.getByTestId('field'), { key: 'Escape' })
    expect(screen.queryByTestId('field')).toBeNull()
    expect(screen.getByRole('button', { name: 'Hello' })).toBeTruthy()
  })
})
