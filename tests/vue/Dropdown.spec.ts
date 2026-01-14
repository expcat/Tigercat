/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import { Dropdown, DropdownMenu, DropdownItem } from '@tigercat/vue'

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

    const wrapper = container.querySelector('.tiger-dropdown-menu-wrapper')
    expect(wrapper).toHaveClass('hidden')
  })

  it('applies placement classes', () => {
    const { container } = render(Dropdown, {
      props: { placement: 'top-end' },
      slots: {
        default: () => [
          h('button', null, 'Trigger'),
          h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
        ]
      }
    })

    const wrapper = container.querySelector('.tiger-dropdown-menu-wrapper')
    expect(wrapper).toHaveClass('bottom-full', 'right-0')
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

    const wrapper = container.querySelector('.tiger-dropdown-menu-wrapper')
    expect(wrapper).toHaveClass('hidden')

    await fireEvent.click(screen.getByText('Trigger'))
    expect(wrapper).not.toHaveClass('hidden')

    await fireEvent.click(screen.getByText('Item 1'))
    expect(wrapper).toHaveClass('hidden')

    await fireEvent.click(screen.getByText('Trigger'))
    expect(wrapper).not.toHaveClass('hidden')
    await fireEvent.click(screen.getByText('Disabled Item'))
    expect(wrapper).not.toHaveClass('hidden')

    await fireEvent.click(document.body)
    expect(wrapper).toHaveClass('hidden')

    await fireEvent.click(screen.getByText('Trigger'))
    expect(wrapper).not.toHaveClass('hidden')
    await fireEvent.keyDown(document, { key: 'Escape' })
    expect(wrapper).toHaveClass('hidden')
  })
})
