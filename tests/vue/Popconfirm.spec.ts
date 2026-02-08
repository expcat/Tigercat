/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { Popconfirm } from '@expcat/tigercat-vue'
import { renderWithSlots, expectNoA11yViolations } from '../utils'
import { h } from 'vue'

describe.sequential('Popconfirm', () => {
  it('opens on trigger click and closes on cancel/confirm', async () => {
    const user = userEvent.setup()
    const { getByText, queryByText } = render(Popconfirm, {
      props: {
        title: 'Confirm?'
      },
      slots: {
        default: () => h('button', {}, 'Action')
      }
    })

    expect(queryByText('Confirm?')).not.toBeVisible()

    await user.click(getByText('Action'))
    await waitFor(() => expect(getByText('Confirm?')).toBeVisible())

    await user.click(getByText('取消'))
    await waitFor(() => expect(queryByText('Confirm?')).not.toBeVisible())

    await user.click(getByText('Action'))
    await waitFor(() => expect(getByText('Confirm?')).toBeVisible())

    await user.click(getByText('确定'))
    await waitFor(() => expect(queryByText('Confirm?')).not.toBeVisible())
  })

  it('respects disabled (cannot open)', async () => {
    const user = userEvent.setup()
    const { getByText, queryByText } = renderWithSlots(
      Popconfirm,
      {
        default: '<button>Delete</button>'
      },
      {
        title: 'Delete?',
        disabled: true
      }
    )

    await user.click(getByText('Delete'))
    expect(queryByText('Delete?')).not.toBeVisible()
  })

  it('emits confirm/cancel', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    const { getByText } = render(Popconfirm, {
      props: {
        title: 'Confirm?',
        onConfirm,
        onCancel
      },
      slots: {
        default: () => h('button', {}, 'Action')
      }
    })

    await user.click(getByText('Action'))
    await waitFor(() => expect(getByText('确定')).toBeVisible())
    await user.click(getByText('取消'))
    expect(onCancel).toHaveBeenCalledTimes(1)

    await user.click(getByText('Action'))
    await waitFor(() => expect(getByText('确定')).toBeVisible())
    await user.click(getByText('确定'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('supports controlled mode via visible', async () => {
    const user = userEvent.setup()
    const onVisibleChange = vi.fn()
    const { getByText, rerender } = renderWithSlots(
      Popconfirm,
      {
        default: '<button>Action</button>'
      },
      {
        title: 'Confirm?',
        visible: false,
        onVisibleChange
      }
    )

    expect(getByText('Confirm?')).not.toBeVisible()

    await rerender({
      title: 'Confirm?',
      visible: true
    })

    await waitFor(() => expect(getByText('Confirm?')).toBeVisible())

    await user.keyboard('{Escape}')

    await waitFor(() => expect(onVisibleChange).toHaveBeenCalledWith(false))

    await rerender({
      title: 'Confirm?',
      visible: false,
      onVisibleChange
    })

    await waitFor(() => expect(getByText('Confirm?')).not.toBeVisible())
  })

  it('closes on Escape (uncontrolled)', async () => {
    const user = userEvent.setup()
    const { getByText, queryByText } = renderWithSlots(
      Popconfirm,
      {
        default: '<button>Action</button>'
      },
      {
        title: 'Confirm?'
      }
    )

    await user.click(getByText('Action'))
    await waitFor(() => expect(getByText('Confirm?')).toBeVisible())

    await user.keyboard('{Escape}')
    await waitFor(() => expect(queryByText('Confirm?')).not.toBeVisible())
  })

  it('uses theme vars for ok button and danger hover vars', async () => {
    const user = userEvent.setup()
    const { getByText } = renderWithSlots(
      Popconfirm,
      {
        default: '<button>Action</button>'
      },
      {
        title: 'Confirm?',
        okType: 'danger'
      }
    )

    await user.click(getByText('Action'))
    await waitFor(() => {
      expect(getByText('确定')).toHaveClass('bg-[var(--tiger-error,#ef4444)]')
      expect(getByText('确定')).toHaveClass('hover:bg-[var(--tiger-error-hover,#dc2626)]')
    })
  })

  it('applies custom className', () => {
    const { container } = renderWithSlots(
      Popconfirm,
      {
        default: '<button>Delete</button>'
      },
      {
        title: 'Delete?',
        className: 'custom-popconfirm'
      }
    )

    expect(container.querySelector('.custom-popconfirm')).toBeInTheDocument()
  })

  it('renders description text', async () => {
    const user = userEvent.setup()
    const { getByText } = render(Popconfirm, {
      props: { title: 'Confirm?', description: 'This cannot be undone.' },
      slots: { default: () => h('button', {}, 'Action') }
    })

    await user.click(getByText('Action'))
    await waitFor(() => expect(getByText('This cannot be undone.')).toBeVisible())
  })

  it('hides icon when showIcon is false', async () => {
    const user = userEvent.setup()
    const { container, getByText } = render(Popconfirm, {
      props: { title: 'Confirm?', showIcon: false },
      slots: { default: () => h('button', {}, 'Action') }
    })

    await user.click(getByText('Action'))
    await waitFor(() => expect(getByText('Confirm?')).toBeVisible())
    expect(container.querySelector('.tiger-popconfirm-icon')).not.toBeInTheDocument()
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = renderWithSlots(
        Popconfirm,
        {
          default: '<button>Delete</button>'
        },
        {
          title: 'Delete this item?',
          description: 'This action cannot be undone.'
        }
      )

      await expectNoA11yViolations(container)
    })
  })
})
