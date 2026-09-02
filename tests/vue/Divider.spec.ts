/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import { Divider } from '@expcat/tigercat-vue/Divider'
import { Space } from '@expcat/tigercat-vue/Space'
import { renderWithProps } from '../utils'

function getRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('[role="separator"]') as HTMLElement
}

describe('Divider (Vue)', () => {
  it('renders a separator with default orientation', () => {
    const { container } = render(Divider)
    const divider = getRoot(container)
    expect(divider).toBeInTheDocument()
    expect(divider).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('stretches a vertical rule in a default Space', () => {
    const { container } = render({
      template:
        '<Space><span style="font-size:24px;line-height:32px">Aa</span><Divider orientation="vertical" spacing="none" /><span style="font-size:24px;line-height:32px">Bb</span></Space>',
      components: { Space, Divider }
    })
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
    const { container } = renderWithProps(Divider, {
      lineStyle: 'gradient',
      color: 'rgb(124, 58, 237)',
      thickness: '4px',
      spacing: 'none'
    })
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

  it('renders a labeled separator from the default slot', () => {
    const { container } = render(Divider, { slots: { default: 'OR' } })
    const divider = getRoot(container)
    expect(divider.textContent).toBe('OR')
    expect(divider.querySelectorAll('[aria-hidden="true"]').length).toBe(2)
  })

  it('merges className without replacing base classes', () => {
    const { container } = render(Divider, {
      props: { className: 'custom' },
      attrs: { 'data-testid': 'divider' }
    })
    const divider = getRoot(container)
    expect(divider.className.match(/custom/g)?.length).toBe(1)
    expect(divider).toHaveAttribute('data-testid', 'divider')
  })

  it('does not set inline style when no custom color/thickness', () => {
    const { container } = render(Divider)
    expect(getRoot(container).style.borderColor).toBe('')
  })

  it('applies fallthrough attrs only once (inheritAttrs: false)', () => {
    const { container } = render(Divider, {
      attrs: { class: 'custom-divider-class', 'data-testid': 'divider' }
    })
    const dividers = container.querySelectorAll('[role="separator"]')
    expect(dividers.length).toBe(1)
    expect(dividers[0].className.match(/custom-divider-class/g)?.length).toBe(1)
  })
})
