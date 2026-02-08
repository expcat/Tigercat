/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import { Dropdown, DropdownMenu, DropdownItem } from '@expcat/tigercat-vue'

describe('Dropdown', () => {
  it('renders trigger and menu content', () => {
    render(Dropdown, {
      slots: {
        default: () => [
          h('button', null, 'Trigger'),
          h(DropdownMenu, null, () => [
            h(DropdownItem, null, () => 'Item 1'),
            h(DropdownItem, null, () => 'Item 2')
          ])
        ]
      }
    })

    expect(screen.getByText('Trigger')).toBeInTheDocument()
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('is hidden by default (hover trigger)', () => {
    const { container } = render(Dropdown, {
      slots: {
        default: () => [
          h('button', null, 'Trigger'),
          h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
        ]
      }
    })

    // Floating UI uses `hidden` attribute now
    const wrapper = container.querySelector('.tiger-dropdown-container > .absolute')
    expect(wrapper).toHaveAttribute('hidden')
  })

  it('supports offset prop', () => {
    const { container } = render(Dropdown, {
      props: { placement: 'top-end', offset: 12 },
      slots: {
        default: () => [
          h('button', null, 'Trigger'),
          h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
        ]
      }
    })

    // Verify component renders with offset prop
    const wrapper = container.querySelector('.tiger-dropdown-container > .absolute')
    expect(wrapper).toBeInTheDocument()
  })

  it('toggles visibility in click trigger mode and closes on outside click / Escape', async () => {
    const { container } = render(Dropdown, {
      props: { trigger: 'click' },
      slots: {
        default: () => [
          h('button', null, 'Trigger'),
          h(DropdownMenu, null, () => [
            h(DropdownItem, null, () => 'Item 1'),
            h(DropdownItem, { disabled: true }, () => 'Disabled Item')
          ])
        ]
      }
    })

    // Floating UI uses `hidden` attribute now
    const wrapper = container.querySelector('.tiger-dropdown-container > .absolute')
    expect(wrapper).toHaveAttribute('hidden')

    await fireEvent.click(screen.getByText('Trigger'))
    expect(wrapper).not.toHaveAttribute('hidden')

    await fireEvent.click(screen.getByText('Item 1'))
    expect(wrapper).toHaveAttribute('hidden')

    await fireEvent.click(screen.getByText('Trigger'))
    expect(wrapper).not.toHaveAttribute('hidden')
    await fireEvent.click(screen.getByText('Disabled Item'))
    expect(wrapper).not.toHaveAttribute('hidden')

    // Close via outside click - note: defer mode requires setTimeout(0) timing
    // In test environment, we use a small delay to let event listeners attach
    await new Promise((r) => setTimeout(r, 10))
    await fireEvent.click(document.body)
    expect(wrapper).toHaveAttribute('hidden')

    await fireEvent.click(screen.getByText('Trigger'))
    expect(wrapper).not.toHaveAttribute('hidden')
    await fireEvent.keyDown(document, { key: 'Escape' })
    expect(wrapper).toHaveAttribute('hidden')
  })

  it('renders chevron indicator by default', () => {
    const { container } = render(Dropdown, {
      slots: {
        default: () => [
          h('button', null, 'Trigger'),
          h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
        ]
      }
    })

    const chevron = container.querySelector('.tiger-dropdown-chevron')
    expect(chevron).toBeInTheDocument()
    expect(chevron?.tagName.toLowerCase()).toBe('svg')
  })

  it('hides chevron when showArrow is false', () => {
    const { container } = render(Dropdown, {
      props: { showArrow: false },
      slots: {
        default: () => [
          h('button', null, 'Trigger'),
          h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
        ]
      }
    })

    const chevron = container.querySelector('.tiger-dropdown-chevron')
    expect(chevron).not.toBeInTheDocument()
  })

  it('rotates chevron when dropdown is open', async () => {
    const { container } = render(Dropdown, {
      props: { trigger: 'click' },
      slots: {
        default: () => [
          h('button', null, 'Trigger'),
          h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
        ]
      }
    })

    const chevron = container.querySelector('.tiger-dropdown-chevron')
    expect(chevron).not.toHaveClass('rotate-180')

    await fireEvent.click(screen.getByText('Trigger'))
    expect(chevron).toHaveClass('rotate-180')
  })
})
