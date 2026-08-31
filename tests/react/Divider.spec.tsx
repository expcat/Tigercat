/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { Divider } from '@expcat/tigercat-react/Divider'
import { Space } from '@expcat/tigercat-react/Space'
import { renderWithProps } from '../utils/render-helpers-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

function getRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('[role="separator"]') as HTMLElement
}

describe('Divider (React)', () => {
  it('renders a separator with default orientation', () => {
    const { container } = render(<Divider />)
    const divider = getRoot(container)
    expect(divider).toBeInTheDocument()
    expect(divider).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('forwards the ref to the root', () => {
    const ref = React.createRef<HTMLDivElement>()
    const { container } = render(<Divider ref={ref} />)
    expect(ref.current).toBe(getRoot(container))
  })

  it('stretches a vertical rule in a default Space', () => {
    const { container } = render(
      <Space>
        <span style={{ fontSize: 24, lineHeight: '32px' }}>Aa</span>
        <Divider orientation="vertical" spacing="none" />
        <span style={{ fontSize: 24, lineHeight: '32px' }}>Bb</span>
      </Space>
    )
    const divider = getRoot(container)
    const sibling = container.querySelector('span') as HTMLElement
    const dividerBox = divider.getBoundingClientRect()
    const siblingBox = sibling.getBoundingClientRect()
    if (siblingBox.height > 0) {
      expect(dividerBox.height).toBeGreaterThan(0)
      expect(dividerBox.height).toBeCloseTo(siblingBox.height, 0)
    } else {
      expect(getComputedStyle(divider).alignSelf).toBe('stretch')
    }
  })

  it('applies color and thickness to a gradient line', () => {
    const { container } = render(
      <Divider lineStyle="gradient" color="rgb(124, 58, 237)" thickness="4px" spacing="none" />
    )
    const divider = getRoot(container)
    expect(divider.style.backgroundImage).toContain('rgb(124, 58, 237)')
    expect(divider.style.height).toBe('4px')
    expect(divider.style.borderWidth).toBe('0px')
  })

  it('uses logical thickness on a vertical rule', () => {
    const { container } = renderWithProps(Divider, {
      orientation: 'vertical',
      color: '#00ff00',
      thickness: '3px'
    })
    const divider = getRoot(container)
    expect(divider.style.borderColor).toBe('#00ff00')
    expect(divider.style.borderInlineStartWidth).toBe('3px')
  })

  it('renders a labeled separator on both sides', () => {
    const { container } = render(<Divider>OR</Divider>)
    const divider = getRoot(container)
    expect(divider.textContent).toBe('OR')
    expect(divider.querySelectorAll('[aria-hidden="true"]').length).toBe(2)
  })

  it('merges custom className', () => {
    const { container } = renderWithProps(Divider, { className: 'custom-divider-class' })
    expect(getRoot(container)).toHaveClass('custom-divider-class')
  })

  it('does not set inline style when no custom color/thickness', () => {
    const { container } = render(<Divider />)
    const divider = getRoot(container)
    expect(divider.style.borderColor).toBe('')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Divider>OR</Divider>)
    await expectNoA11yViolationsIsolated(container)
  })
})
