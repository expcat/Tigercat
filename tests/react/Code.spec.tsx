/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Code } from '@expcat/tigercat-react'
import { renderWithProps } from '../utils/render-helpers-react'
import { expectNoA11yViolations } from '../utils/react'

describe('Code (React)', () => {
  it('renders code content', () => {
    render(<Code code="const a = 1" />)
    expect(screen.getByText('const a = 1')).toBeInTheDocument()
  })

  it('copies code and fires onCopy', async () => {
    const user = userEvent.setup()
    const onCopy = vi.fn()
    const writeText = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    })

    render(<Code code="console.log('copy')" onCopy={onCopy} />)

    const button = screen.getByRole('button', { name: '复制' })
    await user.click(button)

    expect(writeText).toHaveBeenCalledWith("console.log('copy')")
    expect(onCopy).toHaveBeenCalledWith("console.log('copy')")
    expect(screen.getByRole('button', { name: '已复制' })).toBeInTheDocument()
  })

  it('hides copy button when copyable is false', () => {
    render(<Code code="let x = 1" copyable={false} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('has no obvious a11y violations', async () => {
    const { container } = renderWithProps(Code, { code: 'const sum = 1 + 2' })
    await expectNoA11yViolations(container)
  })
})
