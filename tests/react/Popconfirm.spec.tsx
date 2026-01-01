/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Popconfirm } from '@tigercat/react'
import {
  renderWithProps,
  renderWithChildren,
  expectNoA11yViolations,
} from '../utils/render-helpers-react'
import React from 'react'

const iconTypes = ['warning', 'info', 'error', 'success', 'question'] as const

describe('Popconfirm', () => {
  describe('Rendering', () => {
    it('should render trigger element', () => {
      const { getByText } = renderWithChildren(
        Popconfirm,
        <button>Delete</button>,
        {
          title: 'Are you sure?',
        }
      )
      
      expect(getByText('Delete')).toBeInTheDocument()
    })

    it('should not show popconfirm content initially', () => {
      const { queryByText } = renderWithChildren(
        Popconfirm,
        <button>Delete</button>,
        {
          title: 'Are you sure?',
        }
      )
      
      // Content should be hidden initially
      expect(queryByText('Are you sure?')).not.toBeVisible()
    })

    it('should show popconfirm content when trigger is clicked', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithChildren(
        Popconfirm,
        <button>Delete</button>,
        {
          title: 'Are you sure?',
        }
      )
      
      const trigger = getByText('Delete')
      await user.click(trigger)
      
      await waitFor(() => {
        expect(getByText('Are you sure?')).toBeVisible()
      })
    })

    it('should render with custom title', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithChildren(
        Popconfirm,
        <button>Submit</button>,
        {
          title: 'Confirm submission?',
        }
      )
      
      await user.click(getByText('Submit'))
      
      await waitFor(() => {
        expect(getByText('Confirm submission?')).toBeVisible()
      })
    })

    it('should render with description', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithChildren(
        Popconfirm,
        <button>Delete</button>,
        {
          title: 'Delete this item?',
          description: 'This action cannot be undone.',
        }
      )
      
      await user.click(getByText('Delete'))
      
      await waitFor(() => {
        expect(getByText('Delete this item?')).toBeVisible()
        expect(getByText('This action cannot be undone.')).toBeVisible()
      })
    })

    it('should render default buttons', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithChildren(
        Popconfirm,
        <button>Action</button>,
        {
          title: 'Confirm?',
        }
      )
      
      await user.click(getByText('Action'))
      
      await waitFor(() => {
        expect(getByText('确定')).toBeInTheDocument()
        expect(getByText('取消')).toBeInTheDocument()
      })
    })

    it('should render custom button text', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithChildren(
        Popconfirm,
        <button>Submit</button>,
        {
          title: 'Submit form?',
          okText: 'Yes, Submit',
          cancelText: 'No, Cancel',
        }
      )
      
      await user.click(getByText('Submit'))
      
      await waitFor(() => {
        expect(getByText('Yes, Submit')).toBeInTheDocument()
        expect(getByText('No, Cancel')).toBeInTheDocument()
      })
    })

    it('should render with icon by default', async () => {
      const user = userEvent.setup()
      const { container, getByText } = renderWithChildren(
        Popconfirm,
        <button>Delete</button>,
        {
          title: 'Delete?',
        }
      )
      
      await user.click(getByText('Delete'))
      
      await waitFor(() => {
        const icon = container.querySelector('.tiger-popconfirm-icon')
        expect(icon).toBeInTheDocument()
      })
    })

    it('should hide icon when showIcon is false', async () => {
      const user = userEvent.setup()
      const { container, getByText } = renderWithChildren(
        Popconfirm,
        <button>Delete</button>,
        {
          title: 'Delete?',
          showIcon: false,
        }
      )
      
      await user.click(getByText('Delete'))
      
      await waitFor(() => {
        const icon = container.querySelector('.tiger-popconfirm-icon')
        expect(icon).not.toBeInTheDocument()
      })
    })

    it('should render custom title content', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithChildren(
        Popconfirm,
        <button>Delete</button>,
        {
          titleContent: <strong>Custom Title</strong>,
        }
      )
      
      await user.click(getByText('Delete'))
      
      await waitFor(() => {
        expect(getByText('Custom Title')).toBeInTheDocument()
      })
    })

    it('should render custom description content', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithChildren(
        Popconfirm,
        <button>Delete</button>,
        {
          title: 'Delete?',
          descriptionContent: <em>Custom description</em>,
        }
      )
      
      await user.click(getByText('Delete'))
      
      await waitFor(() => {
        expect(getByText('Custom description')).toBeInTheDocument()
      })
    })
  })

  describe('Props', () => {
    it.each(iconTypes)('should render with icon type: %s', async (iconType) => {
      const user = userEvent.setup()
      const { container, getByText } = renderWithChildren(
        Popconfirm,
        <button>Action</button>,
        {
          title: 'Confirm?',
          icon: iconType,
        }
      )
      
      await user.click(getByText('Action'))
      
      await waitFor(() => {
        const icon = container.querySelector('.tiger-popconfirm-icon')
        expect(icon).toBeInTheDocument()
      })
    })

    it('should apply custom className', () => {
      const { container } = renderWithChildren(
        Popconfirm,
        <button>Delete</button>,
        {
          title: 'Delete?',
          className: 'custom-popconfirm',
        }
      )
      
      expect(container.querySelector('.custom-popconfirm')).toBeInTheDocument()
    })

    it('should disable trigger when disabled is true', async () => {
      const user = userEvent.setup()
      const { getByText, queryByText } = renderWithChildren(
        Popconfirm,
        <button>Delete</button>,
        {
          title: 'Delete?',
          disabled: true,
        }
      )
      
      const trigger = getByText('Delete')
      await user.click(trigger)
      
      // Popconfirm should not open when disabled
      expect(queryByText('Delete?')).not.toBeVisible()
    })

    it('should render with danger ok button type', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithChildren(
        Popconfirm,
        <button>Delete</button>,
        {
          title: 'Delete permanently?',
          okType: 'danger',
        }
      )
      
      await user.click(getByText('Delete'))
      
      await waitFor(() => {
        const okButton = getByText('确定')
        expect(okButton).toHaveClass('bg-red-600')
      })
    })
  })

  describe('Events', () => {
    it('should call onConfirm when ok button is clicked', async () => {
      const user = userEvent.setup()
      const handleConfirm = vi.fn()
      
      const { getByText } = render(
        <Popconfirm title="Confirm?" onConfirm={handleConfirm}>
          <button>Action</button>
        </Popconfirm>
      )
      
      await user.click(getByText('Action'))
      
      await waitFor(() => {
        expect(getByText('确定')).toBeVisible()
      })
      
      await user.click(getByText('确定'))
      
      expect(handleConfirm).toHaveBeenCalledTimes(1)
    })

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      const handleCancel = vi.fn()
      
      const { getByText } = render(
        <Popconfirm title="Confirm?" onCancel={handleCancel}>
          <button>Action</button>
        </Popconfirm>
      )
      
      await user.click(getByText('Action'))
      
      await waitFor(() => {
        expect(getByText('取消')).toBeVisible()
      })
      
      await user.click(getByText('取消'))
      
      expect(handleCancel).toHaveBeenCalledTimes(1)
    })

    it('should close popconfirm after confirm', async () => {
      const user = userEvent.setup()
      const { getByText, queryByText } = renderWithChildren(
        Popconfirm,
        <button>Action</button>,
        {
          title: 'Confirm?',
        }
      )
      
      await user.click(getByText('Action'))
      
      await waitFor(() => {
        expect(getByText('Confirm?')).toBeVisible()
      })
      
      await user.click(getByText('确定'))
      
      await waitFor(() => {
        expect(queryByText('Confirm?')).not.toBeVisible()
      })
    })

    it('should close popconfirm after cancel', async () => {
      const user = userEvent.setup()
      const { getByText, queryByText } = renderWithChildren(
        Popconfirm,
        <button>Action</button>,
        {
          title: 'Confirm?',
        }
      )
      
      await user.click(getByText('Action'))
      
      await waitFor(() => {
        expect(getByText('Confirm?')).toBeVisible()
      })
      
      await user.click(getByText('取消'))
      
      await waitFor(() => {
        expect(queryByText('Confirm?')).not.toBeVisible()
      })
    })

    it('should call onVisibleChange when visibility changes', async () => {
      const user = userEvent.setup()
      const handleVisibleChange = vi.fn()
      
      const { getByText } = render(
        <Popconfirm title="Confirm?" onVisibleChange={handleVisibleChange}>
          <button>Action</button>
        </Popconfirm>
      )
      
      await user.click(getByText('Action'))
      
      await waitFor(() => {
        expect(handleVisibleChange).toHaveBeenCalledWith(true)
      })
    })
  })

  describe('States', () => {
    it('should support controlled mode with visible prop', async () => {
      const TestComponent = () => {
        const [visible, setVisible] = React.useState(false)
        
        return (
          <>
            <button onClick={() => setVisible(true)}>Show</button>
            <Popconfirm
              title="Confirm?"
              visible={visible}
              onVisibleChange={setVisible}
            >
              <button>Action</button>
            </Popconfirm>
          </>
        )
      }
      
      const { getByText, queryByText } = render(<TestComponent />)
      
      // Initially hidden
      expect(queryByText('Confirm?')).not.toBeVisible()
      
      // Click show button
      await userEvent.click(getByText('Show'))
      
      await waitFor(() => {
        expect(getByText('Confirm?')).toBeVisible()
      })
    })

    it('should support uncontrolled mode with defaultVisible', async () => {
      const { getByText } = renderWithChildren(
        Popconfirm,
        <button>Action</button>,
        {
          title: 'Confirm?',
          defaultVisible: true,
        }
      )
      
      await waitFor(() => {
        expect(getByText('Confirm?')).toBeVisible()
      })
    })
  })

  describe('Theme Support', () => {
    it('should use primary color for ok button by default', async () => {
      const user = userEvent.setup()
      const { getByText } = renderWithChildren(
        Popconfirm,
        <button>Action</button>,
        {
          title: 'Confirm?',
        }
      )
      
      await user.click(getByText('Action'))
      
      await waitFor(() => {
        const okButton = getByText('确定')
        expect(okButton).toHaveClass('bg-[var(--tiger-primary,#2563eb)]')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithChildren(
        Popconfirm,
        <button>Delete</button>,
        {
          title: 'Delete this item?',
        }
      )
      
      await expectNoA11yViolations(container)
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      const handleConfirm = vi.fn()
      
      const { getByText } = render(
        <Popconfirm title="Confirm?" onConfirm={handleConfirm}>
          <button>Action</button>
        </Popconfirm>
      )
      
      // Tab to trigger button
      await user.tab()
      
      // Press Enter to open popconfirm
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        expect(getByText('Confirm?')).toBeVisible()
      })
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for basic popconfirm', () => {
      const { container } = renderWithChildren(
        Popconfirm,
        <button>Delete</button>,
        {
          title: 'Delete this item?',
        }
      )
      
      expect(container).toMatchSnapshot()
    })

    it('should match snapshot for popconfirm with description', () => {
      const { container } = renderWithChildren(
        Popconfirm,
        <button>Delete</button>,
        {
          title: 'Delete this item?',
          description: 'This action cannot be undone.',
        }
      )
      
      expect(container).toMatchSnapshot()
    })

    it('should match snapshot for danger popconfirm', () => {
      const { container } = renderWithChildren(
        Popconfirm,
        <button>Delete</button>,
        {
          title: 'Delete permanently?',
          icon: 'error',
          okType: 'danger',
        }
      )
      
      expect(container).toMatchSnapshot()
    })
  })
})
