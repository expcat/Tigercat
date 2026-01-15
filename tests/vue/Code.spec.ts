/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Code } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolations } from '../utils'

describe('Code (Vue)', () => {
  it('renders code content', () => {
    render(Code, { props: { code: 'const a = 1' } })
    expect(screen.getByText('const a = 1')).toBeInTheDocument()
  })

  it('copies code and emits copy', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    })

    const { emitted } = render(Code, { props: { code: "console.log('copy')" } })

    const button = screen.getByRole('button', { name: '复制' })
    await fireEvent.click(button)

    expect(writeText).toHaveBeenCalledWith("console.log('copy')")
    expect(emitted().copy?.[0]).toEqual(["console.log('copy')"])
    expect(screen.getByRole('button', { name: '已复制' })).toBeInTheDocument()
  })

  it('hides copy button when copyable is false', () => {
    render(Code, { props: { code: 'let x = 1', copyable: false } })
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('has no obvious a11y violations', async () => {
    const { container } = renderWithProps(Code, { code: 'const sum = 1 + 2' })
    await expectNoA11yViolations(container)
  })
})
