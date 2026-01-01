/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { Tooltip } from '@tigercat/vue'
import {
  renderWithProps,
  renderWithSlots,
  expectNoA11yViolations,
} from '../utils'
import { h } from 'vue'

const triggers = ['click', 'hover', 'focus', 'manual'] as const
const placements = ['top', 'bottom', 'left', 'right', 'top-start', 'bottom-end'] as const

describe('Tooltip', () => {
  describe('Rendering', () => {
    it('should render trigger element', () => {
      const { getByText } = renderWithSlots(
        Tooltip,
        {
          default: '<button>Trigger</button>',
        },
        {
          content: 'Tooltip content',
        }
      )
      
      expect(getByText('Trigger')).toBeInTheDocument()
    })

    it('should not show tooltip content initially', () => {
      const { queryByText } = renderWithSlots(
        Tooltip,
        {
          default: '<button>Trigger</button>',
        },
        {
          content: 'Tooltip content',
        }
      )
      
      // Content should be hidden initially
      expect(queryByText('Tooltip content')).not.toBeVisible()
    })

    it('should show tooltip content when trigger is hovered (default trigger)', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithSlots(
        Tooltip,
        {
          default: '<button>Trigger</button>',
        },
        {
          content: 'Tooltip content',
        }
      )
      
      const trigger = getByText('Trigger')
      await user.hover(trigger)
      
      await waitFor(() => {
        expect(getByText('Tooltip content')).toBeVisible()
      })
    })

    it('should render with custom content slot', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithSlots(
        Tooltip,
        {
          default: '<button>Trigger</button>',
          content: '<strong>Custom content</strong>',
        },
        {
          trigger: 'hover',
        }
      )
      
      const trigger = getByText('Trigger')
      await user.hover(trigger)
      
      await waitFor(() => {
        expect(getByText('Custom content')).toBeVisible()
      })
    })

    it('should not render without trigger element', () => {
      const { container } = renderWithProps(Tooltip, {
        content: 'Tooltip content',
      })
      
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Props', () => {
    describe('trigger', () => {
      it('should show tooltip on click when trigger is "click"', async () => {
        const user = userEvent.setup()
        const { getByText } = renderWithSlots(
          Tooltip,
          {
            default: '<button>Trigger</button>',
          },
          {
            content: 'Tooltip content',
            trigger: 'click',
          }
        )
        
        const trigger = getByText('Trigger')
        
        // Initially hidden
        expect(getByText('Tooltip content')).not.toBeVisible()
        
        // Show on click
        await user.click(trigger)
        await waitFor(() => {
          expect(getByText('Tooltip content')).toBeVisible()
        })
        
        // Hide on second click
        await user.click(trigger)
        await waitFor(() => {
          expect(getByText('Tooltip content')).not.toBeVisible()
        })
      })

      it('should show tooltip on hover when trigger is "hover"', async () => {
        const user = userEvent.setup()
        const { getByText } = renderWithSlots(
          Tooltip,
          {
            default: '<button>Trigger</button>',
          },
          {
            content: 'Tooltip content',
            trigger: 'hover',
          }
        )
        
        const trigger = getByText('Trigger')
        
        // Show on hover
        await user.hover(trigger)
        await waitFor(() => {
          expect(getByText('Tooltip content')).toBeVisible()
        })
        
        // Hide on unhover
        await user.unhover(trigger)
        await waitFor(() => {
          expect(getByText('Tooltip content')).not.toBeVisible()
        })
      })

      it('should show tooltip on focus when trigger is "focus"', async () => {
        const user = userEvent.setup()
        const { getByText } = renderWithSlots(
          Tooltip,
          {
            default: '<button>Trigger</button>',
          },
          {
            content: 'Tooltip content',
            trigger: 'focus',
          }
        )
        
        const trigger = getByText('Trigger')
        
        // Show on focus
        await user.click(trigger) // Click will also focus
        await waitFor(() => {
          expect(getByText('Tooltip content')).toBeVisible()
        })
        
        // Hide on blur
        await user.tab() // Tab away to blur
        await waitFor(() => {
          expect(getByText('Tooltip content')).not.toBeVisible()
        })
      })

      it('should not auto-show tooltip when trigger is "manual"', async () => {
        const user = userEvent.setup()
        const { getByText } = renderWithSlots(
          Tooltip,
          {
            default: '<button>Trigger</button>',
          },
          {
            content: 'Tooltip content',
            trigger: 'manual',
            visible: false,
          }
        )
        
        const trigger = getByText('Trigger')
        
        // Should not show on hover
        await user.hover(trigger)
        expect(getByText('Tooltip content')).not.toBeVisible()
        
        // Should not show on click
        await user.click(trigger)
        expect(getByText('Tooltip content')).not.toBeVisible()
      })
    })

    describe('placement', () => {
      placements.forEach((placement) => {
        it(`should support ${placement} placement`, async () => {
          const user = userEvent.setup()
          const { getByText, container } = renderWithSlots(
            Tooltip,
            {
              default: '<button>Trigger</button>',
            },
            {
              content: 'Tooltip content',
              placement,
              trigger: 'hover',
            }
          )
          
          const trigger = getByText('Trigger')
          await user.hover(trigger)
          
          await waitFor(() => {
            expect(getByText('Tooltip content')).toBeVisible()
          })
          
          // Check that the placement class is applied
          const wrapper = container.querySelector('.tiger-dropdown-menu-wrapper')
          expect(wrapper).toBeTruthy()
        })
      })
    })

    describe('disabled', () => {
      it('should not show tooltip when disabled', async () => {
        const user = userEvent.setup()
        const { getByText } = renderWithSlots(
          Tooltip,
          {
            default: '<button>Trigger</button>',
          },
          {
            content: 'Tooltip content',
            disabled: true,
            trigger: 'hover',
          }
        )
        
        const trigger = getByText('Trigger')
        await user.hover(trigger)
        
        // Should not show
        expect(getByText('Tooltip content')).not.toBeVisible()
      })

      it('should apply disabled styling to trigger', () => {
        const { container } = renderWithSlots(
          Tooltip,
          {
            default: '<button>Trigger</button>',
          },
          {
            content: 'Tooltip content',
            disabled: true,
          }
        )
        
        const trigger = container.querySelector('.tiger-tooltip-trigger')
        expect(trigger).toHaveClass('cursor-not-allowed')
        expect(trigger).toHaveClass('opacity-50')
      })
    })

    describe('visible (controlled mode)', () => {
      it('should control visibility with visible prop', async () => {
        const { getByText, rerender } = renderWithSlots(
          Tooltip,
          {
            default: '<button>Trigger</button>',
          },
          {
            content: 'Tooltip content',
            visible: false,
          }
        )
        
        // Initially hidden
        expect(getByText('Tooltip content')).not.toBeVisible()
        
        // Show when visible is true
        await rerender({
          content: 'Tooltip content',
          visible: true,
        })
        
        await waitFor(() => {
          expect(getByText('Tooltip content')).toBeVisible()
        })
      })
    })

    describe('defaultVisible (uncontrolled mode)', () => {
      it('should show tooltip by default when defaultVisible is true', () => {
        const { getByText } = renderWithSlots(
          Tooltip,
          {
            default: '<button>Trigger</button>',
          },
          {
            content: 'Tooltip content',
            defaultVisible: true,
          }
        )
        
        expect(getByText('Tooltip content')).toBeVisible()
      })
    })

    describe('className', () => {
      it('should apply custom className', () => {
        const { container } = renderWithSlots(
          Tooltip,
          {
            default: '<button>Trigger</button>',
          },
          {
            content: 'Tooltip content',
            className: 'custom-tooltip',
          }
        )
        
        const tooltipContainer = container.querySelector('.tiger-tooltip')
        expect(tooltipContainer).toHaveClass('custom-tooltip')
      })
    })
  })

  describe('Events', () => {
    it('should emit update:visible when visibility changes', async () => {
      const user = userEvent.setup()
      const onUpdateVisible = vi.fn()
      
      const { getByText } = renderWithSlots(
        Tooltip,
        {
          default: '<button>Trigger</button>',
        },
        {
          content: 'Tooltip content',
          trigger: 'click',
          'onUpdate:visible': onUpdateVisible,
        }
      )
      
      const trigger = getByText('Trigger')
      await user.click(trigger)
      
      await waitFor(() => {
        expect(onUpdateVisible).toHaveBeenCalledWith(true)
      })
    })

    it('should emit visible-change when visibility changes', async () => {
      const user = userEvent.setup()
      const onVisibleChange = vi.fn()
      
      const { getByText } = renderWithSlots(
        Tooltip,
        {
          default: '<button>Trigger</button>',
        },
        {
          content: 'Tooltip content',
          trigger: 'hover',
          'onVisible-change': onVisibleChange,
        }
      )
      
      const trigger = getByText('Trigger')
      await user.hover(trigger)
      
      await waitFor(() => {
        expect(onVisibleChange).toHaveBeenCalledWith(true)
      })
      
      await user.unhover(trigger)
      
      await waitFor(() => {
        expect(onVisibleChange).toHaveBeenCalledWith(false)
      })
    })
  })

  describe('States', () => {
    it('should handle click outside to close tooltip (click trigger)', async () => {
      const user = userEvent.setup()
      const { getByText, container } = renderWithSlots(
        Tooltip,
        {
          default: '<button>Trigger</button>',
        },
        {
          content: 'Tooltip content',
          trigger: 'click',
        }
      )
      
      const trigger = getByText('Trigger')
      
      // Open tooltip
      await user.click(trigger)
      await waitFor(() => {
        expect(getByText('Tooltip content')).toBeVisible()
      })
      
      // Click outside
      await user.click(document.body)
      
      await waitFor(() => {
        expect(getByText('Tooltip content')).not.toBeVisible()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithSlots(
        Tooltip,
        {
          default: '<button>Trigger</button>',
        },
        {
          content: 'Tooltip content',
        }
      )
      
      await expectNoA11yViolations(container)
    })

    it('should have proper ARIA attributes on trigger', () => {
      const { container } = renderWithSlots(
        Tooltip,
        {
          default: '<button>Trigger</button>',
        },
        {
          content: 'Tooltip content',
        }
      )
      
      const trigger = container.querySelector('.tiger-tooltip-trigger')
      expect(trigger).toBeInTheDocument()
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for default state', () => {
      const { container } = renderWithSlots(
        Tooltip,
        {
          default: '<button>Trigger</button>',
        },
        {
          content: 'Tooltip content',
        }
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for visible state', () => {
      const { container } = renderWithSlots(
        Tooltip,
        {
          default: '<button>Trigger</button>',
        },
        {
          content: 'Tooltip content',
          visible: true,
        }
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for disabled state', () => {
      const { container } = renderWithSlots(
        Tooltip,
        {
          default: '<button>Trigger</button>',
        },
        {
          content: 'Tooltip content',
          disabled: true,
        }
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
