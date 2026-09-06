/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FullscreenButton } from '@expcat/tigercat-react/FullscreenButton'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('FullscreenButton (React)', () => {
  it('renders a labelled toggle that is disabled without Fullscreen API', () => {
    render(<FullscreenButton />)
    const button = screen.getByRole('button', { name: 'Enter fullscreen' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('has no obvious a11y violations', async () => {
    const { container } = render(<FullscreenButton />)
    await expectNoA11yViolationsIsolated(container)
  })
})
