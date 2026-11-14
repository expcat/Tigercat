/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { Container } from '@expcat/tigercat-vue/Container'
import { h } from 'vue'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('Container (Vue)', () => {
  const ContentSlot = () => h('div', 'Container content')

  it('should render children content', () => {
    render(Container, { slots: { default: ContentSlot } })
    expect(screen.getByText('Container content')).toBeInTheDocument()
  })

  it('distinguishes false, full, and named maxWidth', () => {
    const none = render(Container, {
      props: { maxWidth: false },
      slots: { default: ContentSlot }
    })
    const noneEl = none.container.querySelector('.tiger-container') as HTMLElement
    expect(noneEl.style.maxWidth).toBe('')

    const full = render(Container, {
      props: { maxWidth: 'full' },
      slots: { default: ContentSlot }
    })
    const fullEl = full.container.querySelector('.tiger-container') as HTMLElement
    expect(fullEl.style.maxWidth).toBe('100%')

    const sm = render(Container, {
      props: { maxWidth: 'sm' },
      slots: { default: ContentSlot }
    })
    const smEl = sm.container.querySelector('.tiger-container') as HTMLElement
    expect(smEl.style.maxWidth).toContain('--tiger-breakpoint-sm')
  })

  it('ignores inherited maxWidth keys the same way as unknown values', () => {
    const unknown = render(Container, {
      props: { maxWidth: 'nope' as 'sm' },
      slots: { default: ContentSlot }
    })
    const unknownEl = unknown.container.querySelector('.tiger-container') as HTMLElement
    for (const maxWidth of ['toString', 'constructor'] as const) {
      const view = render(Container, {
        props: { maxWidth: maxWidth as 'sm' },
        slots: { default: ContentSlot }
      })
      const el = view.container.querySelector('.tiger-container') as HTMLElement
      expect(el.style.maxWidth).toBe(unknownEl.style.maxWidth)
      expect(el.style.maxWidth).toBe('')
      expect(el.getAttribute('style') ?? '').not.toContain('function')
    }
  })

  it('centers and pads by default, and both can be turned off', () => {
    const on = render(Container, { slots: { default: ContentSlot } })
    const onEl = on.container.querySelector('.tiger-container') as HTMLElement
    expect(onEl.className).toContain('tiger-container-center')
    expect(onEl.className).toContain('tiger-container-pad')

    const off = render(Container, {
      props: { center: false, padding: false },
      slots: { default: ContentSlot }
    })
    const offEl = off.container.querySelector('.tiger-container') as HTMLElement
    expect(offEl.className).not.toContain('tiger-container-center')
    expect(offEl.className).not.toContain('tiger-container-pad')
  })

  it('keeps the base class when className is copied from React docs', () => {
    const { container } = render(Container, {
      props: { className: 'custom' },
      slots: { default: ContentSlot }
    })
    const el = container.querySelector('.tiger-container') as HTMLElement
    expect(el.className).toContain('tiger-container')
    expect(el.className).toContain('custom')
  })

  it('renders as a section', () => {
    const { container } = render(Container, {
      props: { as: 'section' },
      slots: { default: ContentSlot }
    })
    expect(container.querySelector('section.tiger-container')).toBeTruthy()
  })

  it('should have no accessibility violations', async () => {
    const { container } = render(Container, { slots: { default: ContentSlot } })
    await expectNoA11yViolationsIsolated(container)
  })
})
