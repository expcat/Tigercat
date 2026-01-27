/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { Tooltip } from '@expcat/tigercat-vue'
import { renderWithProps, renderWithSlots, expectNoA11yViolations } from '../utils'

describe('Tooltip', () => {
  it('renders trigger element', () => {
    const { getByText } = renderWithSlots(
      Tooltip,
      { default: '<button>Trigger</button>' },
      { content: 'Tooltip content' }
    )

    expect(getByText('Trigger')).toBeInTheDocument()
  })

  it('does not render without trigger element', () => {
    const { container } = renderWithProps(Tooltip, {
      content: 'Tooltip content'
    })

    expect(container.querySelector('.tiger-tooltip')).toBeNull()
  })

  it('forwards attrs and merges class (and applies style prop)', () => {
    const { container } = renderWithSlots(
      Tooltip,
      { default: '<button>Trigger</button>' },
      {
        props: {
          content: 'Tooltip content',
          className: 'from-props',
          style: { paddingLeft: '12px' }
        },
        attrs: {
          id: 'tooltip-root',
          class: 'from-attrs',
          'data-foo': 'bar'
        }
      }
    )

    const root = container.querySelector('#tooltip-root') as HTMLElement
    expect(root).toBeTruthy()
    expect(root.getAttribute('data-foo')).toBe('bar')
    expect(root.className).toContain('tiger-tooltip')
    expect(root.className).toContain('from-props')
    expect(root.className).toContain('from-attrs')
    expect(root.getAttribute('style') || '').toContain('padding-left')
  })

  it('shows/hides on hover (default)', async () => {
    const user = userEvent.setup()
    const { getByText, queryByText, container } = renderWithSlots(
      Tooltip,
      { default: '<button>Trigger</button>' },
      { content: 'Tooltip content' }
    )

    const trigger = container.querySelector('.tiger-tooltip-trigger') as HTMLElement
    expect(trigger).toBeTruthy()

    // Tooltip not rendered initially
    expect(queryByText('Tooltip content')).toBeNull()

    await user.hover(trigger)
    await waitFor(() => expect(getByText('Tooltip content')).toBeVisible())

    await user.unhover(trigger)
    await waitFor(() => expect(queryByText('Tooltip content')).toBeNull())
  })

  it('supports content slot', async () => {
    const user = userEvent.setup()
    const { getByText, container } = renderWithSlots(
      Tooltip,
      {
        default: '<button>Trigger</button>',
        content: '<strong>Custom content</strong>'
      },
      { trigger: 'hover' }
    )

    const trigger = container.querySelector('.tiger-tooltip-trigger') as HTMLElement
    expect(trigger).toBeTruthy()

    await user.hover(trigger)
    await waitFor(() => expect(getByText('Custom content')).toBeVisible())
  })

  it('toggles on click and closes on outside click', async () => {
    const user = userEvent.setup()
    const { getByText, queryByText } = renderWithSlots(
      Tooltip,
      { default: '<button>Trigger</button>' },
      { content: 'Tooltip content', trigger: 'click' }
    )

    await user.click(getByText('Trigger'))
    await waitFor(() => expect(getByText('Tooltip content')).toBeVisible())

    await user.click(document.body)
    await waitFor(() => expect(queryByText('Tooltip content')).toBeNull())
  })

  it('shows on focus and hides on blur', async () => {
    const user = userEvent.setup()
    const { getByText, queryByText, container } = renderWithSlots(
      Tooltip,
      { default: '<button>Trigger</button>' },
      { content: 'Tooltip content', trigger: 'focus' }
    )

    const trigger = container.querySelector('.tiger-tooltip-trigger') as HTMLElement
    expect(trigger).toBeTruthy()

    trigger.focus()
    await waitFor(() => expect(getByText('Tooltip content')).toBeVisible())

    trigger.blur()
    await waitFor(() => expect(queryByText('Tooltip content')).toBeNull())
  })

  it('does not auto-open in manual mode', async () => {
    const user = userEvent.setup()
    const { getByText, queryByText } = renderWithSlots(
      Tooltip,
      { default: '<button>Trigger</button>' },
      { content: 'Tooltip content', trigger: 'manual', visible: false }
    )

    await user.hover(getByText('Trigger'))
    expect(queryByText('Tooltip content')).toBeNull()

    await user.click(getByText('Trigger'))
    expect(queryByText('Tooltip content')).toBeNull()
  })

  it('does not open when disabled', async () => {
    const user = userEvent.setup()
    const { getByText, queryByText, container } = renderWithSlots(
      Tooltip,
      { default: '<button>Trigger</button>' },
      { content: 'Tooltip content', disabled: true }
    )

    await user.hover(getByText('Trigger'))
    expect(queryByText('Tooltip content')).toBeNull()
    expect(container.querySelector('.tiger-tooltip-trigger')).toHaveClass('cursor-not-allowed')
  })

  it('supports controlled visible', async () => {
    const { getByText } = renderWithProps(
      Tooltip,
      { content: 'Tooltip content', trigger: 'manual', visible: true },
      {
        slots: {
          default: '<button>Trigger</button>'
        }
      }
    )

    await waitFor(() => expect(getByText('Tooltip content')).toBeVisible())
  })

  it('emits update:visible and visible-change', async () => {
    const user = userEvent.setup()
    const onUpdateVisible = vi.fn()
    const onVisibleChange = vi.fn()

    const { getByText } = renderWithSlots(
      Tooltip,
      { default: '<button>Trigger</button>' },
      {
        content: 'Tooltip content',
        trigger: 'click',
        'onUpdate:visible': onUpdateVisible,
        'onVisible-change': onVisibleChange
      }
    )

    await user.click(getByText('Trigger'))
    await waitFor(() => expect(onUpdateVisible).toHaveBeenCalledWith(true))
    await waitFor(() => expect(onVisibleChange).toHaveBeenCalledWith(true))
  })

  it('sets aria-describedby and role=tooltip when visible', async () => {
    const user = userEvent.setup()
    const { container, getByText } = renderWithSlots(
      Tooltip,
      { default: '<button>Trigger</button>' },
      { content: 'Tooltip content' }
    )

    const triggerWrapper = container.querySelector('.tiger-tooltip-trigger') as HTMLElement
    expect(triggerWrapper).toBeTruthy()

    // aria-describedby should exist even before tooltip is shown
    expect(triggerWrapper.getAttribute('aria-describedby')).toBeTruthy()

    // Show tooltip and verify role
    await user.hover(triggerWrapper)
    await waitFor(() => {
      const tooltipEl = container.querySelector('[role="tooltip"]') as HTMLElement
      expect(tooltipEl).toBeTruthy()
      expect(triggerWrapper.getAttribute('aria-describedby')).toBe(tooltipEl.id)
    })
  })

  it('has no accessibility violations', async () => {
    const { container } = renderWithSlots(
      Tooltip,
      { default: '<button>Trigger</button>' },
      { content: 'Tooltip content' }
    )

    await expectNoA11yViolations(container)
  })
})
