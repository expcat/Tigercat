/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { VIEWPORT_FLOATING_FAB_OFFSET } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { FloatButton, FloatButtonGroup } from '@expcat/tigercat-react/FloatButton'
import { expectNoA11yViolations } from '../utils/react'

describe('FloatButton (React)', () => {
  it('names an icon-only button from locale', () => {
    render(
      <ConfigProvider locale={zhCN}>
        <FloatButton />
      </ConfigProvider>
    )
    expect(screen.getByRole('button', { name: '添加' })).toBeInTheDocument()
  })

  it('uses zhTW locale name', () => {
    render(
      <ConfigProvider locale={zhTW}>
        <FloatButton />
      </ConfigProvider>
    )
    expect(screen.getByRole('button', { name: '新增' })).toBeInTheDocument()
  })

  it('keeps visible text as the accessible name when tooltip is set', () => {
    render(<FloatButton tooltip="Help">保存</FloatButton>)
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Help')
  })

  it('does not let rest aria-label override the computed name', () => {
    render(
      <FloatButton ariaLabel="Save" aria-label="Nope">
        保存
      </FloatButton>
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('keeps type=button even if rest tries to submit', () => {
    render(
      <FloatButton {...({ type: 'submit' } as React.ButtonHTMLAttributes<HTMLButtonElement>)} />
    )
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('places a floating button on the logical end/block axes', () => {
    render(<FloatButton floating />)
    const button = screen.getByRole('button')
    expect(button.style.insetInlineEnd).toBe(`${VIEWPORT_FLOATING_FAB_OFFSET.x}px`)
    expect(button.style.insetBlockEnd).toBe(`${VIEWPORT_FLOATING_FAB_OFFSET.y}px`)
  })

  it('does not fire click when disabled', async () => {
    const onClick = vi.fn()
    render(<FloatButton disabled onClick={onClick} />)
    await fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })
})

describe('FloatButtonGroup (React)', () => {
  it('is a disclosure: trigger expands and lists actions', async () => {
    const user = userEvent.setup()
    render(
      <FloatButtonGroup portal={false} triggerNode={<FloatButton ariaLabel="Open actions" />}>
        <FloatButton ariaLabel="Edit" />
      </FloatButtonGroup>
    )
    const trigger = screen.getByRole('button', { name: 'Open actions' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-controls')
  })

  it('opens from click when trigger is hover', async () => {
    const onOpenChange = vi.fn()
    render(
      <FloatButtonGroup
        portal={false}
        trigger="hover"
        onOpenChange={onOpenChange}
        triggerNode={<FloatButton ariaLabel="Hover" />}>
        <FloatButton ariaLabel="Child" />
      </FloatButtonGroup>
    )
    await fireEvent.click(screen.getByRole('button', { name: 'Hover' }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('button', { name: 'Child' })).toBeInTheDocument()
  })

  it('opens with Enter on the trigger', async () => {
    const user = userEvent.setup()
    render(
      <FloatButtonGroup
        portal={false}
        trigger="hover"
        triggerNode={<FloatButton ariaLabel="Hover" />}>
        <FloatButton ariaLabel="Child" />
      </FloatButtonGroup>
    )
    screen.getByRole('button', { name: 'Hover' }).focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('button', { name: 'Child' })).toBeInTheDocument()
  })

  it('closes on Escape and outside click', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <button type="button">Outside</button>
        <FloatButtonGroup portal={false} defaultOpen triggerNode={<FloatButton ariaLabel="Open" />}>
          <FloatButton ariaLabel="Child" />
        </FloatButtonGroup>
      </div>
    )
    expect(screen.getByRole('button', { name: 'Child' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('button', { name: 'Child' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByRole('button', { name: 'Child' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Outside' }))
    expect(screen.queryByRole('button', { name: 'Child' })).not.toBeInTheDocument()
  })

  it('inherits group square shape on child and trigger buttons', () => {
    render(
      <FloatButtonGroup
        portal={false}
        open
        shape="square"
        triggerNode={<FloatButton ariaLabel="Open" />}>
        <FloatButton ariaLabel="Child" />
      </FloatButtonGroup>
    )
    for (const button of screen.getAllByRole('button')) {
      expect(button.className).not.toContain('rounded-full')
    }
  })

  it('lets a child shape win over the group', () => {
    render(
      <FloatButtonGroup portal={false} open shape="square">
        <FloatButton ariaLabel="Round" shape="circle" />
      </FloatButtonGroup>
    )
    expect(screen.getByRole('button', { name: 'Round' }).className).toContain('rounded-full')
  })

  it('portals the group to document.body by default', () => {
    render(
      <FloatButtonGroup
        className="portal-default-group"
        triggerNode={<FloatButton ariaLabel="Open" />}
      />
    )
    const group = document.body.querySelector('.portal-default-group')
    expect(group).toBeTruthy()
    expect(group?.className).toContain('fixed')
  })

  it('grows downward from a top corner so the trigger stays put', () => {
    render(
      <FloatButtonGroup
        portal={false}
        open
        placement="top-left"
        className="top-group"
        triggerNode={<FloatButton ariaLabel="Open" />}>
        <FloatButton ariaLabel="Child" />
      </FloatButtonGroup>
    )
    const group = document.querySelector('.top-group') as HTMLElement
    expect(
      getComputedStyle(group).flexDirection === 'column' || group.className.includes('flex-col')
    ).toBe(true)
    expect(group.className).not.toContain('flex-col-reverse')
  })

  it('has no a11y violations when open on document.body', async () => {
    render(
      <FloatButtonGroup open triggerNode={<FloatButton ariaLabel="Open actions" />}>
        <FloatButton ariaLabel="Edit" />
      </FloatButtonGroup>
    )
    await expectNoA11yViolations(document.body)
  })
})
