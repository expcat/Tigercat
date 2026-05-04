/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { Watermark } from '@expcat/tigercat-vue'

describe('Watermark', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders children and watermark overlay', () => {
    const { container } = render(Watermark, {
      props: { content: 'Secret', className: 'from-prop' },
      attrs: { class: 'from-attr', 'data-testid': 'watermark' },
      slots: { default: 'Protected content' }
    })

    const wrapper = screen.getByTestId('watermark')
    const overlay = container.querySelector('[data-watermark="true"]')

    expect(screen.getByText('Protected content')).toBeInTheDocument()
    expect(wrapper).toHaveClass('relative')
    expect(wrapper).toHaveClass('from-prop')
    expect(wrapper).toHaveClass('from-attr')
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
    expect(overlay).toHaveStyle({
      position: 'absolute',
      pointerEvents: 'none',
      backgroundRepeat: 'repeat'
    })
  })
})
