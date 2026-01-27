/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tooltip } from '@expcat/tigercat-react'
import { renderWithProps, renderWithChildren, expectNoA11yViolations } from '../utils/react'
import React from 'react'

describe('Tooltip', () => {
  it('renders trigger element', () => {
    const { getByText } = renderWithChildren(
      Tooltip,
      { content: 'Tooltip content' },
      <button>Trigger</button>
    )

    expect(getByText('Trigger')).toBeInTheDocument()
  })

  it('does not render without children', () => {
    const { container } = renderWithProps(Tooltip, {
      content: 'Tooltip content'
    })

    expect(container.firstChild).toBeNull()
  })

  it('shows/hides on hover (default)', async () => {
    const user = userEvent.setup()
    const { getByText, queryByText } = renderWithChildren(
      Tooltip,
      { content: 'Tooltip content' },
      <button>Trigger</button>
    )

    const trigger = getByText('Trigger')

    // Tooltip not rendered initially
    expect(queryByText('Tooltip content')).toBeNull()

    await user.hover(trigger)
    await waitFor(() => expect(getByText('Tooltip content')).toBeVisible())

    await user.unhover(trigger)
    await waitFor(() => expect(queryByText('Tooltip content')).toBeNull())
  })

  it('supports custom ReactNode content', async () => {
    const user = userEvent.setup()
    const { getByText } = renderWithChildren(
      Tooltip,
      {
        content: <strong>Custom content</strong>,
        trigger: 'hover'
      },
      <button>Trigger</button>
    )

    await user.hover(getByText('Trigger'))
    await waitFor(() => expect(getByText('Custom content')).toBeVisible())
  })

  it('toggles on click and closes on outside click', async () => {
    const user = userEvent.setup()
    const { getByText, queryByText } = renderWithChildren(
      Tooltip,
      { content: 'Tooltip content', trigger: 'click' },
      <button>Trigger</button>
    )

    await user.click(getByText('Trigger'))
    await waitFor(() => expect(getByText('Tooltip content')).toBeVisible())

    await user.click(document.body)
    await waitFor(() => expect(queryByText('Tooltip content')).toBeNull())
  })

  it('shows on focus and hides on blur', async () => {
    const user = userEvent.setup()
    const { getByText, queryByText } = renderWithChildren(
      Tooltip,
      { content: 'Tooltip content', trigger: 'focus' },
      <button>Trigger</button>
    )

    await user.click(getByText('Trigger'))
    await waitFor(() => expect(getByText('Tooltip content')).toBeVisible())

    await user.tab()
    await waitFor(() => expect(queryByText('Tooltip content')).toBeNull())
  })

  it('does not auto-open in manual mode', async () => {
    const user = userEvent.setup()
    const { getByText, queryByText } = renderWithChildren(
      Tooltip,
      { content: 'Tooltip content', trigger: 'manual', visible: false },
      <button>Trigger</button>
    )

    await user.hover(getByText('Trigger'))
    expect(queryByText('Tooltip content')).toBeNull()

    await user.click(getByText('Trigger'))
    expect(queryByText('Tooltip content')).toBeNull()
  })

  it('does not open when disabled', async () => {
    const user = userEvent.setup()
    const { getByText, queryByText, container } = renderWithChildren(
      Tooltip,
      { content: 'Tooltip content', disabled: true },
      <button>Trigger</button>
    )

    await user.hover(getByText('Trigger'))
    expect(queryByText('Tooltip content')).toBeNull()

    expect(container.querySelector('.tiger-tooltip-trigger')).toHaveClass('cursor-not-allowed')
  })

  it('supports controlled visible', async () => {
    const { getByText, queryByText, rerender } = renderWithChildren(
      Tooltip,
      { content: 'Tooltip content', visible: false },
      <button>Trigger</button>
    )

    // Not rendered when visible=false
    expect(queryByText('Tooltip content')).toBeNull()

    rerender(
      <Tooltip content="Tooltip content" visible={true}>
        <button>Trigger</button>
      </Tooltip>
    )

    await waitFor(() => expect(getByText('Tooltip content')).toBeVisible())
  })

  it('calls onVisibleChange when visibility changes', async () => {
    const user = userEvent.setup()
    const onVisibleChange = vi.fn()

    const { getByText } = renderWithChildren(
      Tooltip,
      { content: 'Tooltip content', trigger: 'click', onVisibleChange },
      <button>Trigger</button>
    )

    await user.click(getByText('Trigger'))
    await waitFor(() => expect(onVisibleChange).toHaveBeenCalledWith(true))
  })

  it('sets aria-describedby and role=tooltip when visible', async () => {
    const user = userEvent.setup()
    const { container, getByText } = renderWithChildren(
      Tooltip,
      { content: 'Tooltip content' },
      <button>Trigger</button>
    )

    const triggerWrapper = container.querySelector('.tiger-tooltip-trigger') as HTMLElement
    expect(triggerWrapper).toBeTruthy()

    // aria-describedby should exist even before tooltip is shown
    expect(triggerWrapper.getAttribute('aria-describedby')).toBeTruthy()

    // Show tooltip and verify role
    await user.hover(triggerWrapper)
    await waitFor(() => {
      const tooltipEl = container.querySelector('[role="tooltip"]')
      expect(tooltipEl).toBeTruthy()
      expect(triggerWrapper.getAttribute('aria-describedby')).toBe((tooltipEl as HTMLElement).id)
    })
  })

  it('has no accessibility violations', async () => {
    const { container } = renderWithChildren(
      Tooltip,
      { content: 'Tooltip content' },
      <button>Trigger</button>
    )

    await expectNoA11yViolations(container)
  })
})
