/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { createRef, useState } from 'react'
import { Tour } from '@expcat/tigercat-react/Tour'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { Dropdown, DropdownItem, DropdownMenu } from '@expcat/tigercat-react/Dropdown'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import type { TourStep } from '@expcat/tigercat-core'
import { expectNoA11yViolations } from '../utils/react'

const baseSteps: TourStep[] = [
  { title: 'Step 1', description: 'First step description' },
  { title: 'Step 2', description: 'Second step description' },
  { title: 'Step 3', description: 'Last step description' }
]

function mountTarget(id = 'tour-target') {
  const target = document.createElement('div')
  target.id = id
  target.getBoundingClientRect = () =>
    ({
      top: 100,
      left: 200,
      width: 50,
      height: 30,
      right: 250,
      bottom: 130,
      x: 200,
      y: 100,
      toJSON: () => ({})
    }) as DOMRect
  document.body.appendChild(target)
  return target
}

describe('Tour', () => {
  it('should not render when open is false', () => {
    render(<Tour steps={baseSteps} open={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render the first step when open is true', async () => {
    render(<Tour steps={baseSteps} open={true} />)
    expect(await screen.findByRole('dialog', { name: 'Step 1' })).toBeInTheDocument()
    expect(screen.getByText('First step description')).toBeInTheDocument()
  })

  it('should show indicator with current/total when showIndicators is true', async () => {
    render(<Tour steps={baseSteps} open={true} />)
    expect(await screen.findByText('1 / 3')).toBeInTheDocument()
  })

  it('should hide indicator when showIndicators is false', async () => {
    render(<Tour steps={baseSteps} open={true} showIndicators={false} />)
    await screen.findByRole('dialog')
    expect(screen.queryByText('1 / 3')).not.toBeInTheDocument()
  })

  it('should advance to next step on Next click and emit onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Tour steps={baseSteps} open={true} onChange={onChange} />)

    await user.click(await screen.findByRole('button', { name: 'Next' }))

    expect(onChange).toHaveBeenCalledWith(1)
    expect(await screen.findByRole('dialog', { name: 'Step 2' })).toBeInTheDocument()
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
  })

  it('should not show Previous button on the first step', async () => {
    render(<Tour steps={baseSteps} open={true} />)
    await screen.findByRole('dialog')
    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument()
  })

  it('should go back to previous step on Previous click', async () => {
    const user = userEvent.setup()
    render(<Tour steps={baseSteps} open={true} />)

    await user.click(await screen.findByRole('button', { name: 'Next' }))
    await user.click(await screen.findByRole('button', { name: 'Previous' }))

    expect(await screen.findByRole('dialog', { name: 'Step 1' })).toBeInTheDocument()
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('emits finish then close then openChange on Finish', async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()
    const onClose = vi.fn()
    const onOpenChange = vi.fn()
    render(
      <Tour
        steps={baseSteps}
        open={true}
        current={2}
        onFinish={onFinish}
        onClose={onClose}
        onOpenChange={onOpenChange}
      />
    )

    await user.click(await screen.findByRole('button', { name: 'Finish' }))

    expect(onFinish.mock.invocationCallOrder[0]).toBeLessThan(onClose.mock.invocationCallOrder[0])
    expect(onClose.mock.invocationCallOrder[0]).toBeLessThan(
      onOpenChange.mock.invocationCallOrder[0]
    )
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should respect controlled current prop', async () => {
    render(<Tour steps={baseSteps} open={true} current={1} />)
    expect(await screen.findByRole('dialog', { name: 'Step 2' })).toBeInTheDocument()
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
  })

  it('should skip conditional steps while navigating', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Tour
        steps={[baseSteps[0], { ...baseSteps[1], skipWhen: true }, baseSteps[2]]}
        open={true}
        onChange={onChange}
      />
    )

    expect(await screen.findByText('1 / 2')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(onChange).toHaveBeenCalledWith(2)
    expect(await screen.findByRole('dialog', { name: 'Step 3' })).toBeInTheDocument()
  })

  it('re-evaluates skipWhen without reloading steps', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [skip, setSkip] = useState(true)
      return (
        <>
          <button type="button" onClick={() => setSkip(false)}>
            include
          </button>
          <Tour
            open
            steps={[baseSteps[0], { ...baseSteps[1], skipWhen: () => skip }, baseSteps[2]]}
          />
        </>
      )
    }

    render(<Harness />)
    expect(await screen.findByText('1 / 2')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'include' }))
    expect(await screen.findByText('1 / 3')).toBeInTheDocument()
  })

  it('traps Tab after loadSteps inserts the first dialog', async () => {
    const user = userEvent.setup()
    let resolveSteps: ((next: TourStep[]) => void) | undefined
    const loadSteps = () =>
      new Promise<TourStep[]>((resolve) => {
        resolveSteps = resolve
      })

    render(<Tour steps={[]} open loadSteps={loadSteps} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.body.style.overflow).not.toBe('hidden')

    resolveSteps?.([{ title: 'Loaded', description: 'Async step' }])
    const dialog = await screen.findByRole('dialog', { name: 'Loaded' })
    expect(document.body.style.overflow).toBe('hidden')

    const focusable = dialog.querySelectorAll('button')
    const last = focusable[focusable.length - 1] as HTMLElement
    last.focus()
    await user.tab()
    expect(focusable[0]).toHaveFocus()
  })

  it('traps Tab after opening from closed with existing steps', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open tour
          </button>
          <Tour steps={baseSteps} open={open} onOpenChange={setOpen} />
        </>
      )
    }

    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Open tour' }))
    const dialog = await screen.findByRole('dialog')
    const focusable = dialog.querySelectorAll('button')
    const last = focusable[focusable.length - 1] as HTMLElement
    last.focus()
    await user.tab()
    expect(focusable[0]).toHaveFocus()
  })

  it('resets uncontrolled current when closed and reopened', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [open, setOpen] = useState(true)
      return (
        <>
          <button type="button" onClick={() => setOpen((value) => !value)}>
            toggle
          </button>
          <Tour steps={baseSteps} open={open} onOpenChange={setOpen} />
        </>
      )
    }

    render(<Harness />)
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    expect(await screen.findByRole('dialog', { name: 'Step 2' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close tour' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'toggle' }))
    expect(await screen.findByRole('dialog', { name: 'Step 1' })).toBeInTheDocument()
  })

  it('should render close button by default and emit close then openChange', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onOpenChange = vi.fn()
    render(<Tour steps={baseSteps} open={true} onClose={onClose} onOpenChange={onOpenChange} />)

    await user.click(await screen.findByRole('button', { name: 'Close tour' }))
    expect(onClose.mock.invocationCallOrder[0]).toBeLessThan(
      onOpenChange.mock.invocationCallOrder[0]
    )
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('hides the close button when closable is false and focuses the dialog', async () => {
    render(<Tour steps={baseSteps} open={true} closable={false} />)
    const dialog = await screen.findByRole('dialog')
    expect(screen.queryByRole('button', { name: 'Close tour' })).not.toBeInTheDocument()
    await waitFor(() => expect(dialog).toHaveFocus())
  })

  it('does not close from Escape when keyboard is false', async () => {
    const onOpenChange = vi.fn()
    render(<Tour steps={baseSteps} open keyboard={false} onOpenChange={onOpenChange} />)
    await screen.findByRole('dialog')
    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('should support custom button labels', async () => {
    render(
      <Tour
        steps={baseSteps}
        open={true}
        current={1}
        nextText="下一步"
        prevText="上一步"
        finishText="完成"
      />
    )

    expect(await screen.findByRole('button', { name: '下一步' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '上一步' })).toBeInTheDocument()
  })

  it('reads official locale objects for chrome text', async () => {
    const { rerender } = render(
      <ConfigProvider locale={zhCN}>
        <Tour steps={baseSteps} open />
      </ConfigProvider>
    )
    expect(await screen.findByRole('button', { name: '关闭导览' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下一步' })).toBeInTheDocument()

    rerender(
      <ConfigProvider locale={zhTW}>
        <Tour steps={baseSteps} open />
      </ConfigProvider>
    )
    expect(await screen.findByRole('button', { name: '關閉導覽' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '关闭导览' })).not.toBeInTheDocument()

    rerender(
      <ConfigProvider locale={jaJP}>
        <Tour steps={baseSteps} open />
      </ConfigProvider>
    )
    expect(await screen.findByRole('button', { name: 'ツアーを閉じる' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Close tour' })).not.toBeInTheDocument()
  })

  it('names a dialog without a title', async () => {
    render(<Tour steps={[{ description: 'No title here' }]} open />)
    expect(await screen.findByRole('dialog', { name: 'Tour' })).toBeInTheDocument()
  })

  it('should close when clicking the full-screen mask (no target)', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Tour steps={[{ title: 'Solo', description: 'no target' }]} open={true} onClose={onClose} />
    )

    await screen.findByRole('dialog')
    const mask = document.querySelector('[data-tiger-tour-mask]')
    expect(mask).toBeInTheDocument()
    await user.click(mask as Element)
    expect(onClose).toHaveBeenCalled()
  })

  it('does not close from the mask when maskClosable is false', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<Tour steps={baseSteps} open maskClosable={false} onOpenChange={onOpenChange} />)
    await screen.findByRole('dialog')
    await user.click(document.querySelector('[data-tiger-tour-mask]') as Element)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('should not render mask when step.mask is false', async () => {
    render(<Tour steps={[{ title: 'No mask', description: '...', mask: false }]} open={true} />)
    await screen.findByRole('dialog')
    expect(document.querySelector('[data-tiger-tour-mask]')).not.toBeInTheDocument()
  })

  it('punches a mask hole and does not center when the loaded step has a target', async () => {
    const target = mountTarget()
    let resolveSteps: ((next: TourStep[]) => void) | undefined
    const loadSteps = () =>
      new Promise<TourStep[]>((resolve) => {
        resolveSteps = resolve
      })

    render(<Tour steps={[]} open loadSteps={loadSteps} />)
    resolveSteps?.([{ title: 'With target', target: '#tour-target' }])

    const dialog = await screen.findByRole('dialog', { name: 'With target' })
    const mask = await waitFor(() => {
      const node = document.querySelector('[data-tiger-tour-mask]') as HTMLElement | null
      expect(node?.style.clipPath).toContain('evenodd')
      expect(node?.style.clipPath).toContain('196px 96px')
      return node!
    })
    expect(mask).toBeInTheDocument()
    expect(dialog.style.top).not.toBe('50%')
    target.remove()
  })

  it('centers instead of throwing on an illegal selector', async () => {
    render(<Tour steps={[{ title: 'Broken', target: '##' }]} open />)
    const dialog = await screen.findByRole('dialog', { name: 'Broken' })
    expect(document.querySelector('[data-tiger-tour-mask]')).toBeInTheDocument()
    expect((document.querySelector('[data-tiger-tour-mask]') as HTMLElement).style.clipPath).toBe(
      ''
    )
    expect(dialog.style.top).not.toBe('')
  })

  it('should close when clicking the mask when a target exists', async () => {
    const user = userEvent.setup()
    const target = mountTarget()
    const onClose = vi.fn()
    const onOpenChange = vi.fn()
    render(
      <Tour
        steps={[{ title: 'With target', description: '...', target: '#tour-target' }]}
        open={true}
        onClose={onClose}
        onOpenChange={onOpenChange}
      />
    )

    const mask = await waitFor(() => {
      const node = document.querySelector('[data-tiger-tour-mask]') as HTMLElement | null
      expect(node?.style.clipPath).toContain('evenodd')
      return node!
    })
    await user.click(mask)
    expect(onClose).toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
    target.remove()
  })

  it('should apply custom className to the popover', async () => {
    render(<Tour steps={baseSteps} open={true} className="my-custom-tour" />)
    expect(await screen.findByRole('dialog')).toHaveClass('my-custom-tour')
  })

  it('forwards a ref to the dialog', async () => {
    const ref = createRef<HTMLDivElement>()
    render(<Tour ref={ref} steps={baseSteps} open />)
    expect(await screen.findByRole('dialog')).toBe(ref.current)
  })

  it('should render nothing if step does not exist (out-of-range current)', () => {
    render(<Tour steps={baseSteps} open={true} current={99} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  describe('Overlay lifecycle', () => {
    it('moves focus to the close button when opened', async () => {
      render(<Tour steps={baseSteps} open={true} />)
      const closeButton = await screen.findByRole('button', { name: 'Close tour' })
      await waitFor(() => expect(closeButton).toHaveFocus())
    })

    it('closes on Escape', async () => {
      const onOpenChange = vi.fn()
      const onClose = vi.fn()
      render(<Tour steps={baseSteps} open={true} onOpenChange={onOpenChange} onClose={onClose} />)
      await screen.findByRole('dialog')
      await userEvent.keyboard('{Escape}')
      expect(onClose).toHaveBeenCalled()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('owns an overlay-host so nested layers stay inside the tour', async () => {
      render(<Tour steps={baseSteps} open={true} />)
      const dialog = await screen.findByRole('dialog')
      const layer = dialog.closest('[data-tiger-overlay-layer]')
      expect(layer?.querySelector(':scope > [data-tiger-overlay-host]')).toBeInTheDocument()
    })

    it('keeps a content-slot Dropdown inside the tour overlay-host', async () => {
      render(
        <Tour
          steps={baseSteps}
          open
          content={
            <Dropdown defaultOpen>
              <button type="button">Tour menu</button>
              <DropdownMenu>
                <DropdownItem>Nested action</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          }
        />
      )
      const item = await screen.findByText('Nested action')
      const nestedLayer = item.closest('[data-tiger-overlay-layer]')
      expect(nestedLayer?.parentElement).not.toBe(document.body)
      expect(nestedLayer?.parentElement).toHaveAttribute('data-tiger-overlay-host')
    })

    it('locks body scroll while open and restores it on close', async () => {
      const { rerender } = render(<Tour steps={baseSteps} open={true} />)
      await screen.findByRole('dialog')
      expect(document.body.style.overflow).toBe('hidden')
      rerender(<Tour steps={baseSteps} open={false} />)
      await waitFor(() => expect(document.body.style.overflow).not.toBe('hidden'))
    })

    it('restores focus to the previously focused element on close', async () => {
      const trigger = document.createElement('button')
      trigger.textContent = 'Open tour'
      document.body.appendChild(trigger)
      trigger.focus()

      const { rerender } = render(<Tour steps={baseSteps} open={true} />)
      await screen.findByRole('dialog')

      rerender(<Tour steps={baseSteps} open={false} />)
      await waitFor(() => expect(trigger).toHaveFocus())
      trigger.remove()
    })

    it('restores focus when the instance unmounts', async () => {
      const trigger = document.createElement('button')
      trigger.textContent = 'Open tour'
      document.body.appendChild(trigger)
      trigger.focus()

      const { unmount } = render(<Tour steps={baseSteps} open={true} />)
      await screen.findByRole('dialog')
      unmount()
      await waitFor(() => expect(trigger).toHaveFocus())
      trigger.remove()
    })
  })

  describe('Accessibility', () => {
    it('passes axe for titled, untitled, unclosable, and loaded dialogs', async () => {
      const { rerender } = render(<Tour steps={baseSteps} open />)
      await expectNoA11yViolations(await screen.findByRole('dialog'))

      rerender(<Tour steps={[{ description: 'No title' }]} open />)
      await expectNoA11yViolations(await screen.findByRole('dialog', { name: 'Tour' }))

      rerender(<Tour steps={baseSteps} open closable={false} />)
      await expectNoA11yViolations(await screen.findByRole('dialog'))

      const loadSteps = vi.fn().mockResolvedValue([{ title: 'Loaded' }])
      rerender(<Tour steps={[]} open loadSteps={loadSteps} />)
      await expectNoA11yViolations(await screen.findByRole('dialog', { name: 'Loaded' }))
    })
  })
})
