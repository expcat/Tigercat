/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { Popover } from '@expcat/tigercat-vue'
import { renderWithProps, renderWithSlots, expectNoA11yViolations } from '../utils'
import { h } from 'vue'

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

      // Content should be hidden initially
      expect(queryByText('Popover content')).not.toBeVisible()
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
        const contentElement = container.querySelector('.tiger-popover-content')
        expect(contentElement).toHaveClass('w-[300px]')
      })
    })
  })

  describe('Trigger', () => {
    it('should show/hide on click when trigger is "click"', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithProps(
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
          expect(getByText('Click content')).not.toBeVisible()
        },
        { timeout: 2000 }
      )
    })

    it('should show/hide on hover when trigger is "hover"', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithProps(
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
          expect(getByText('Hover content')).not.toBeVisible()
        },
        { timeout: 2000 }
      )
    })

    it('should show/hide on focus when trigger is "focus"', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithProps(
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
          expect(getByText('Focus content')).not.toBeVisible()
        },
        { timeout: 2000 }
      )
    })
  })

  describe('States', () => {
    it('should support disabled state', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithProps(
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

      // Wait a bit to ensure it doesn't show
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Content should still not be visible
      expect(getByText('Disabled content')).not.toBeVisible()
    })

    it('should support defaultVisible', () => {
      const { getByText } = renderWithProps(
        Popover,
        {
          defaultVisible: true,
          content: 'Default visible content'
        },
        {
          slots: {
            default: '<button>Trigger</button>'
          }
        }
      )

      expect(getByText('Default visible content')).toBeVisible()
    })

    it('should support controlled visible state', async () => {
      const { getByText, rerender } = renderWithProps(
        Popover,
        {
          visible: false,
          content: 'Controlled content'
        },
        {
          slots: {
            default: '<button>Trigger</button>'
          }
        }
      )

      // Initially hidden
      expect(getByText('Controlled content')).not.toBeVisible()

      await rerender({ visible: true })

      await waitFor(() => {
        expect(getByText('Controlled content')).toBeVisible()
      })

      // Hide again
      await rerender({ visible: false })

      await waitFor(() => {
        expect(getByText('Controlled content')).not.toBeVisible()
      })
    })
  })

  describe('Events', () => {
    it('should emit visible-change event', async () => {
      const user = userEvent.setup()
      const onVisibleChange = vi.fn()

      const { getByText } = renderWithProps(
        Popover,
        {
          content: 'Test content',
          'onVisible-change': onVisibleChange
        },
        {
          slots: {
            default: '<button>Trigger</button>'
          }
        }
      )

      await user.click(getByText('Trigger'))

      await waitFor(() => {
        expect(onVisibleChange).toHaveBeenCalledWith(true)
      })
    })

    it('should emit update:visible event', async () => {
      const user = userEvent.setup()
      const onUpdateVisible = vi.fn()

      const { getByText } = renderWithProps(
        Popover,
        {
          content: 'Test content',
          'onUpdate:visible': onUpdateVisible
        },
        {
          slots: {
            default: '<button>Trigger</button>'
          }
        }
      )

      await user.click(getByText('Trigger'))

      await waitFor(() => {
        expect(onUpdateVisible).toHaveBeenCalledWith(true)
      })
    })
  })

  describe('Theme Support', () => {
    it('should apply custom className', () => {
      const { container } = renderWithProps(
        Popover,
        {
          className: 'custom-popover',
          content: 'Content'
        },
        {
          slots: {
            default: '<button>Trigger</button>'
          }
        }
      )

      const popover = container.querySelector('.tiger-popover')
      expect(popover).toHaveClass('custom-popover')
    })

    it('should use theme CSS variables (surface/border)', async () => {
      const user = userEvent.setup()
      const { getByText, container } = renderWithProps(
        Popover,
        {
          title: 'Title',
          content: 'The content'
        },
        {
          slots: {
            default: '<button>Trigger</button>'
          }
        }
      )

      await user.click(getByText('Trigger'))

      await waitFor(() => {
        const contentEl = container.querySelector('.tiger-popover-content')
        expect(contentEl).toHaveClass('bg-[var(--tiger-surface,#ffffff)]')
        expect(contentEl).toHaveClass('border-[var(--tiger-border,#e5e7eb)]')
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

      await expectNoA11yViolations(container)
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
      const { getByText } = renderWithProps(
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
        expect(getByText('Esc content')).not.toBeVisible()
      })
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
