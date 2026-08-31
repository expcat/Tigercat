/**
 * @vitest-environment happy-dom
 */

import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { fireEvent, render, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { h, nextTick } from 'vue'
import { DEFAULT_FLOATING_HOVER_HIDE_DELAY_MS } from '@expcat/tigercat-core'
import { Popover } from '@expcat/tigercat-vue/Popover'
import { Select } from '@expcat/tigercat-vue/Select'
import { renderWithProps, renderWithSlots, expectNoA11yViolationsIsolated } from '../utils'

describe('Popover', () => {
  describe('Rendering', () => {
    it('should render trigger element', () => {
      const { getByText } = renderWithSlots(
        Popover,
        {
          default: '<button>Trigger</button>'
        },
        {
          content: 'Popover content'
        }
      )

      expect(getByText('Trigger')).toBeInTheDocument()
    })

    it('should not show popover content initially', () => {
      const { queryByText } = renderWithSlots(
        Popover,
        {
          default: '<button>Trigger</button>'
        },
        {
          content: 'Popover content'
        }
      )

      // Content should not be rendered initially (conditional rendering)
      expect(queryByText('Popover content')).toBeNull()
    })

    it('exposes data-state on the trigger reflecting open state', async () => {
      const user = userEvent.setup()
      const { container } = renderWithSlots(
        Popover,
        { default: '<button>Trigger</button>' },
        { content: 'Popover content', trigger: 'click' }
      )
      const trigger = container.querySelector('[aria-haspopup="dialog"]') as HTMLElement
      expect(trigger).toHaveAttribute('data-state', 'closed')
      await user.click(trigger)
      await waitFor(() => expect(trigger).toHaveAttribute('data-state', 'open'))
    })

    it('should show popover content when trigger is clicked', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithSlots(
        Popover,
        {
          default: '<button>Trigger</button>'
        },
        {
          content: 'Popover content',
          trigger: 'click'
        }
      )

      const trigger = getByText('Trigger')
      await user.click(trigger)

      await waitFor(() => {
        expect(getByText('Popover content')).toBeVisible()
      })
    })

    it('should render with title', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithSlots(
        Popover,
        {
          default: '<button>Trigger</button>'
        },
        {
          title: 'Popover Title',
          content: 'Popover content'
        }
      )

      await user.click(getByText('Trigger'))

      await waitFor(() => {
        expect(getByText('Popover Title')).toBeVisible()
        expect(getByText('Popover content')).toBeVisible()
      })
    })

    it('should render with custom content slot', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithSlots(Popover, {
        default: '<button>Trigger</button>',
        content: '<div>Custom content</div>'
      })

      await user.click(getByText('Trigger'))

      await waitFor(() => {
        expect(getByText('Custom content')).toBeVisible()
      })
    })

    it('should render with custom title slot', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithSlots(Popover, {
        default: '<button>Trigger</button>',
        title: '<span>Custom Title</span>',
        content: '<div>Content</div>'
      })

      await user.click(getByText('Trigger'))

      await waitFor(() => {
        expect(getByText('Custom Title')).toBeVisible()
        expect(getByText('Content')).toBeVisible()
      })
    })

    it('should render floating content through body teleport', async () => {
      const user = userEvent.setup()
      const { container, getByText } = renderWithSlots(
        Popover,
        {
          default: '<button>Trigger</button>'
        },
        {
          content: 'Teleported content',
          trigger: 'click'
        }
      )

      await user.click(getByText('Trigger'))

      await waitFor(() => {
        const contentElement = document.querySelector('.tiger-popover-content') as HTMLElement
        expect(contentElement).toBeTruthy()
        expect(document.body.contains(contentElement)).toBe(true)
        expect(container.contains(contentElement)).toBe(false)
      })
    })
  })

  describe('Props', () => {
    it('should accept content prop', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithProps(
        Popover,
        {
          content: 'Test content'
        },
        {
          slots: {
            default: '<button>Click me</button>'
          }
        }
      )

      await user.click(getByText('Click me'))

      await waitFor(() => {
        expect(getByText('Test content')).toBeVisible()
      })
    })

    it('should accept title prop', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithProps(
        Popover,
        {
          title: 'Test title',
          content: 'Test content'
        },
        {
          slots: {
            default: '<button>Click me</button>'
          }
        }
      )

      await user.click(getByText('Click me'))

      await waitFor(() => {
        expect(getByText('Test title')).toBeVisible()
      })
    })

    it('should support placement prop (smoke)', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithProps(
        Popover,
        {
          placement: 'bottom-end',
          content: 'Content'
        },
        {
          slots: {
            default: '<button>Trigger</button>'
          }
        }
      )

      await user.click(getByText('Trigger'))

      await waitFor(() => {
        expect(getByText('Content')).toBeVisible()
      })
    })

    it('should support custom width', async () => {
      const user = userEvent.setup()
      const { getByText, container } = renderWithProps(
        Popover,
        {
          width: '300',
          content: 'Wide content'
        },
        {
          slots: {
            default: '<button>Trigger</button>'
          }
        }
      )

      await user.click(getByText('Trigger'))

      await waitFor(() => {
        const contentElement = document.querySelector('.tiger-popover-content') as HTMLElement
        expect(contentElement.style.width).toBe('300px')
      })
    })
  })

  describe('Trigger', () => {
    it('should show/hide on click when trigger is "click"', async () => {
      const user = userEvent.setup()
      const { getByText, queryByText } = renderWithProps(
        Popover,
        {
          trigger: 'click',
          content: 'Click content'
        },
        {
          slots: {
            default: '<button>Click trigger</button>'
          }
        }
      )

      const trigger = getByText('Click trigger')

      // Click to show
      await user.click(trigger)
      await waitFor(() => {
        expect(getByText('Click content')).toBeVisible()
      })

      // Click again to hide
      await user.click(trigger)
      await waitFor(
        () => {
          expect(queryByText('Click content')).toBeNull()
        },
        { timeout: 2000 }
      )
    })

    it('should show/hide on hover when trigger is "hover"', async () => {
      const user = userEvent.setup()
      const { getByText, queryByText } = renderWithProps(
        Popover,
        {
          trigger: 'hover',
          content: 'Hover content'
        },
        {
          slots: {
            default: '<button>Hover trigger</button>'
          }
        }
      )

      const trigger = getByText('Hover trigger')

      // Hover to show
      await user.hover(trigger)
      await waitFor(() => {
        expect(getByText('Hover content')).toBeVisible()
      })

      // Unhover to hide
      await user.unhover(trigger)
      await waitFor(
        () => {
          expect(queryByText('Hover content')).toBeNull()
        },
        { timeout: 2000 }
      )
    })

    describe('hover delay and floating hover group', () => {
      beforeEach(() => {
        vi.useFakeTimers()
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      it('keeps content visible after trigger mouseLeave until hideDelay', async () => {
        const { getByText, queryByText, container } = renderWithProps(
          Popover,
          {
            trigger: 'hover',
            content: 'Hover content'
          },
          {
            slots: {
              default: '<button>Hover trigger</button>'
            }
          }
        )

        const trigger = container.querySelector('.tiger-popover-trigger') as HTMLElement
        await fireEvent.mouseEnter(trigger)
        expect(getByText('Hover content')).toBeVisible()

        await fireEvent.mouseLeave(trigger)
        expect(getByText('Hover content')).toBeVisible()

        vi.advanceTimersByTime(DEFAULT_FLOATING_HOVER_HIDE_DELAY_MS - 1)
        await nextTick()
        expect(getByText('Hover content')).toBeVisible()

        vi.advanceTimersByTime(1)
        await nextTick()
        expect(queryByText('Hover content')).toBeNull()
      })

      it('stays open when the pointer enters the floating layer before hideDelay', async () => {
        const { getByText, queryByText, container } = renderWithProps(
          Popover,
          {
            trigger: 'hover',
            content: 'Hover content'
          },
          {
            slots: {
              default: '<button>Hover trigger</button>'
            }
          }
        )

        const trigger = container.querySelector('.tiger-popover-trigger') as HTMLElement
        await fireEvent.mouseEnter(trigger)
        expect(getByText('Hover content')).toBeVisible()

        await fireEvent.mouseLeave(trigger)
        const floating = document.querySelector('[role="dialog"]')?.parentElement as HTMLElement
        expect(floating).toBeTruthy()

        await fireEvent.mouseEnter(floating)
        vi.advanceTimersByTime(DEFAULT_FLOATING_HOVER_HIDE_DELAY_MS)
        await nextTick()
        expect(getByText('Hover content')).toBeVisible()

        await fireEvent.mouseLeave(floating)
        expect(getByText('Hover content')).toBeVisible()

        vi.advanceTimersByTime(DEFAULT_FLOATING_HOVER_HIDE_DELAY_MS)
        await nextTick()
        expect(queryByText('Hover content')).toBeNull()
      })

      it('opens immediately on click without waiting for hover delay', async () => {
        const { getByText, container } = renderWithProps(
          Popover,
          {
            trigger: 'click',
            content: 'Click content'
          },
          {
            slots: {
              default: '<button>Click trigger</button>'
            }
          }
        )

        const trigger = container.querySelector('.tiger-popover-trigger') as HTMLElement
        await fireEvent.click(trigger)
        expect(getByText('Click content')).toBeVisible()
      })
    })

    it('closes immediately on Escape while hover-open', async () => {
      const user = userEvent.setup()
      const { getByText, queryByText, container } = renderWithProps(
        Popover,
        {
          trigger: 'hover',
          content: 'Hover content'
        },
        {
          slots: {
            default: '<button>Hover trigger</button>'
          }
        }
      )

      const trigger = getByText('Hover trigger')
      await user.hover(trigger)
      await waitFor(() => {
        expect(getByText('Hover content')).toBeVisible()
      })

      await user.keyboard('{Escape}')
      await waitFor(() => {
        expect(queryByText('Hover content')).toBeNull()
      })
    })

    it('should show/hide on focus when trigger is "focus"', async () => {
      const user = userEvent.setup()
      const { getByText, queryByText } = renderWithProps(
        Popover,
        {
          trigger: 'focus',
          content: 'Focus content'
        },
        {
          slots: {
            default: '<button>Focus trigger</button>'
          }
        }
      )

      const trigger = getByText('Focus trigger')

      // Focus to show
      await user.click(trigger)
      await waitFor(() => {
        expect(getByText('Focus content')).toBeVisible()
      })

      // Blur to hide
      await user.tab()
      await waitFor(
        () => {
          expect(queryByText('Focus content')).toBeNull()
        },
        { timeout: 2000 }
      )
    })

    it('should only respond to controlled open when trigger is "manual"', async () => {
      const user = userEvent.setup()
      const { getByText, queryByText, rerender } = renderWithProps(
        Popover,
        {
          trigger: 'manual',
          open: false,
          content: 'Manual content'
        },
        {
          slots: {
            default: '<button>Manual trigger</button>'
          }
        }
      )

      // Click should NOT open — opening is synchronous (no timers), so the
      // awaited click has already settled any state updates
      await user.click(getByText('Manual trigger'))
      expect(queryByText('Manual content')).toBeNull()

      // Controlled visible=true should open
      await rerender({ open: true })
      await waitFor(() => {
        expect(getByText('Manual content')).toBeVisible()
      })
    })
  })

  describe('States', () => {
    it('should support disabled state', async () => {
      const user = userEvent.setup()
      const { getByText, queryByText } = renderWithProps(
        Popover,
        {
          disabled: true,
          content: 'Disabled content'
        },
        {
          slots: {
            default: '<button>Disabled trigger</button>'
          }
        }
      )

      await user.click(getByText('Disabled trigger'))

      // Opening is synchronous when enabled, so absence right after the
      // awaited click proves the disabled state blocked it
      expect(queryByText('Disabled content')).toBeNull()
    })

    it('should support defaultOpen', () => {
      const { getByText } = renderWithProps(
        Popover,
        {
          defaultOpen: true,
          content: 'Default open content'
        },
        {
          slots: {
            default: '<button>Trigger</button>'
          }
        }
      )

      expect(getByText('Default open content')).toBeVisible()
    })

    it('should support controlled open state', async () => {
      const { getByText, queryByText, rerender } = renderWithProps(
        Popover,
        {
          open: false,
          content: 'Controlled content'
        },
        {
          slots: {
            default: '<button>Trigger</button>'
          }
        }
      )

      // Initially not rendered
      expect(queryByText('Controlled content')).toBeNull()

      await rerender({ open: true })

      await waitFor(() => {
        expect(getByText('Controlled content')).toBeVisible()
      })

      // Hide again
      await rerender({ open: false })

      await waitFor(() => {
        expect(queryByText('Controlled content')).toBeNull()
      })
    })
  })

  describe('Events', () => {
    it('should emit open-change event', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()

      const { getByText } = renderWithProps(
        Popover,
        {
          content: 'Test content',
          'onOpen-change': onOpenChange
        },
        {
          slots: {
            default: '<button>Trigger</button>'
          }
        }
      )

      await user.click(getByText('Trigger'))

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true)
      })
    })

    it('should emit update:open event', async () => {
      const user = userEvent.setup()
      const onUpdateOpen = vi.fn()

      const { getByText } = renderWithProps(
        Popover,
        {
          content: 'Test content',
          'onUpdate:open': onUpdateOpen
        },
        {
          slots: {
            default: '<button>Trigger</button>'
          }
        }
      )

      await user.click(getByText('Trigger'))

      await waitFor(() => {
        expect(onUpdateOpen).toHaveBeenCalledWith(true)
      })
    })
  })

  describe('Accessibility', () => {
    it('should pass a11y checks', async () => {
      const { container } = renderWithSlots(
        Popover,
        {
          default: '<button>Accessible trigger</button>'
        },
        {
          content: 'Accessible content'
        }
      )

      await expectNoA11yViolationsIsolated(container)
    })

    it('should be keyboard navigable with focus trigger', async () => {
      const user = userEvent.setup()
      const { getByText, queryByText } = renderWithProps(
        Popover,
        {
          trigger: 'focus',
          content: 'Focus content'
        },
        {
          slots: {
            default: '<button>Focus trigger</button>'
          }
        }
      )

      // Tab to focus
      await user.tab()

      await waitFor(() => {
        expect(getByText('Focus trigger')).toHaveFocus()
        expect(queryByText('Focus content')).toBeVisible()
      })
    })

    it('should close on Escape (non-manual)', async () => {
      const user = userEvent.setup()
      const { getByText, queryByText } = renderWithProps(
        Popover,
        {
          trigger: 'click',
          content: 'Esc content'
        },
        {
          slots: {
            default: '<button>Trigger</button>'
          }
        }
      )

      await user.click(getByText('Trigger'))
      await waitFor(() => {
        expect(getByText('Esc content')).toBeVisible()
      })

      await user.keyboard('{Escape}')
      await waitFor(() => {
        expect(queryByText('Esc content')).toBeNull()
      })
    })

    it('restores trigger focus after Escape but preserves outside-click focus', async () => {
      const user = userEvent.setup()
      const { getByText, queryByText } = renderWithProps(
        Popover,
        {
          trigger: 'click'
        },
        {
          slots: {
            default: '<button>Trigger</button>',
            content: '<button>Inside</button>'
          }
        }
      )

      const trigger = getByText('Trigger')
      await user.click(trigger)
      await user.click(getByText('Inside'))
      expect(getByText('Inside')).toHaveFocus()

      await user.keyboard('{Escape}')
      await waitFor(() => {
        expect(trigger).toHaveFocus()
      })

      await user.click(trigger)
      await user.click(getByText('Inside'))
      const outside = document.createElement('button')
      outside.textContent = 'Outside'
      document.body.appendChild(outside)
      await user.click(outside)
      await waitFor(() => {
        expect(queryByText('Inside')).toBeNull()
        expect(outside).toHaveFocus()
      })
      outside.remove()
    })

    it('keeps a parent popover open when selecting from a nested overlay', async () => {
      const user = userEvent.setup()
      const { getByText } = render(Popover, {
        props: { defaultOpen: true },
        slots: {
          default: () => h('button', 'Parent trigger'),
          content: () =>
            h('div', [
              h('span', 'Parent content'),
              h(Select, { options: [{ label: 'Nested option', value: 'nested' }] })
            ])
        }
      })

      await user.click(getByText('Select an option'))
      await user.click(getByText('Nested option'))
      expect(getByText('Parent content')).toBeVisible()
    })

    it('should passthrough attributes to container', () => {
      const { container } = renderWithProps(
        Popover,
        {
          content: 'Content'
        },
        {
          attrs: {
            'data-testid': 'popover-root'
          },
          slots: {
            default: '<button>Trigger</button>'
          }
        }
      )

      expect(container.querySelector('[data-testid="popover-root"]')).toBeTruthy()
    })
  })
})
