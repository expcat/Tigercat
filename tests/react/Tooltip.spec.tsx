/**
 * @vitest-environment happy-dom
 */

import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { act, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DEFAULT_FLOATING_HOVER_HIDE_DELAY_MS } from '@expcat/tigercat-core'
import { Tooltip } from '@expcat/tigercat-react/Tooltip'
import { renderWithProps, renderWithChildren, expectNoA11yViolationsIsolated } from '../utils/react'
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

  describe('hover delay and floating hover group', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('keeps content visible after trigger mouseLeave until hideDelay', () => {
      const { getByText, queryByText, container } = renderWithChildren(
        Tooltip,
        { content: 'Tooltip content' },
        <button>Trigger</button>
      )

      const trigger = container.querySelector('.tiger-tooltip-trigger') as HTMLElement
      fireEvent.mouseEnter(trigger)
      expect(getByText('Tooltip content')).toBeVisible()

      fireEvent.mouseLeave(trigger)
      expect(getByText('Tooltip content')).toBeVisible()

      act(() => {
        vi.advanceTimersByTime(DEFAULT_FLOATING_HOVER_HIDE_DELAY_MS - 1)
      })
      expect(getByText('Tooltip content')).toBeVisible()

      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(queryByText('Tooltip content')).toBeNull()
    })

    it('stays open when the pointer enters the floating layer before hideDelay', () => {
      const { getByText, queryByText, container } = renderWithChildren(
        Tooltip,
        { content: 'Tooltip content' },
        <button>Trigger</button>
      )

      const trigger = container.querySelector('.tiger-tooltip-trigger') as HTMLElement
      fireEvent.mouseEnter(trigger)
      expect(getByText('Tooltip content')).toBeVisible()

      fireEvent.mouseLeave(trigger)
      const floating = document.querySelector('[role="tooltip"]')?.parentElement as HTMLElement
      expect(floating).toBeTruthy()

      fireEvent.mouseEnter(floating)
      act(() => {
        vi.advanceTimersByTime(DEFAULT_FLOATING_HOVER_HIDE_DELAY_MS)
      })
      expect(getByText('Tooltip content')).toBeVisible()

      fireEvent.mouseLeave(floating)
      expect(getByText('Tooltip content')).toBeVisible()

      act(() => {
        vi.advanceTimersByTime(DEFAULT_FLOATING_HOVER_HIDE_DELAY_MS)
      })
      expect(queryByText('Tooltip content')).toBeNull()
    })
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
      { content: 'Tooltip content', trigger: 'manual', open: false },
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

  it('supports controlled open', async () => {
    const { getByText, queryByText, rerender } = renderWithChildren(
      Tooltip,
      { content: 'Tooltip content', open: false },
      <button>Trigger</button>
    )

    // Not rendered when visible=false
    expect(queryByText('Tooltip content')).toBeNull()

    rerender(
      <Tooltip content="Tooltip content" open={true}>
        <button>Trigger</button>
      </Tooltip>
    )

    await waitFor(() => expect(getByText('Tooltip content')).toBeVisible())
  })

  it('calls onOpenChange when open state changes', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    const { getByText } = renderWithChildren(
      Tooltip,
      { content: 'Tooltip content', trigger: 'click', onOpenChange },
      <button>Trigger</button>
    )

    await user.click(getByText('Trigger'))
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true))
  })

  it('sets aria-describedby and role=tooltip when visible', async () => {
    const user = userEvent.setup()
    const { container, getByText } = renderWithChildren(
      Tooltip,
      { content: 'Tooltip content' },
      <button>Trigger</button>
    )

    const trigger = getByText('Trigger')
    expect(trigger.getAttribute('aria-describedby')).toBeNull()

    trigger.focus()
    await waitFor(() => {
      const tooltipEl = document.querySelector('[role="tooltip"]')
      expect(tooltipEl).toBeTruthy()
      expect(trigger.getAttribute('aria-describedby')).toBe((tooltipEl as HTMLElement).id)
    })
  })

  it('renders floating content through body portal', async () => {
    const user = userEvent.setup()
    const { container, getByText } = renderWithChildren(
      Tooltip,
      { content: 'Portaled tooltip', trigger: 'click' },
      <button>Trigger</button>
    )

    await user.click(getByText('Trigger'))

    await waitFor(() => {
      const tooltipEl = document.querySelector('[role="tooltip"]') as HTMLElement
      expect(tooltipEl).toBeTruthy()
      expect(document.body.contains(tooltipEl)).toBe(true)
      expect(container.contains(tooltipEl)).toBe(false)
    })
  })

  it('has no accessibility violations', async () => {
    const { container } = renderWithChildren(
      Tooltip,
      { content: 'Tooltip content' },
      <button>Trigger</button>
    )

    await expectNoA11yViolationsIsolated(container)
  })

  it('supports defaultOpen', async () => {
    const { getByText } = renderWithChildren(
      Tooltip,
      { content: 'Tooltip content', defaultOpen: true },
      <button>Trigger</button>
    )

    await waitFor(() => expect(getByText('Tooltip content')).toBeVisible())
  })

  it('closes on escape key', async () => {
    const user = userEvent.setup()
    const { getByText, queryByText } = renderWithChildren(
      Tooltip,
      { content: 'Tooltip content', trigger: 'click' },
      <button>Trigger</button>
    )

    await user.click(getByText('Trigger'))
    await waitFor(() => expect(getByText('Tooltip content')).toBeVisible())

    await user.keyboard('{Escape}')
    await waitFor(() => expect(queryByText('Tooltip content')).toBeNull())
  })

  it('does not close on escape in manual mode', async () => {
    const { getByText } = renderWithChildren(
      Tooltip,
      { content: 'Tooltip content', open: true, trigger: 'manual' },
      <button>Trigger</button>
    )

    await waitFor(() => expect(getByText('Tooltip content')).toBeVisible())

    const user = userEvent.setup()
    await user.keyboard('{Escape}')
    // Should remain visible in manual mode
    expect(getByText('Tooltip content')).toBeVisible()
  })
})
