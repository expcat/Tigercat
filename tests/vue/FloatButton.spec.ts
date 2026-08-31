/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import { VIEWPORT_FLOATING_FAB_OFFSET } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { FloatButton, FloatButtonGroup } from '@expcat/tigercat-vue/FloatButton'
import { expectNoA11yViolations } from '../utils'

describe('FloatButton (Vue)', () => {
  it('names an icon-only button from locale', () => {
    render({
      setup: () => () => h(ConfigProvider, { locale: zhCN }, () => h(FloatButton))
    })
    expect(screen.getByRole('button', { name: '添加' })).toBeInTheDocument()
  })

  it('uses zhTW locale name', () => {
    render({
      setup: () => () => h(ConfigProvider, { locale: zhTW }, () => h(FloatButton))
    })
    expect(screen.getByRole('button', { name: '新增' })).toBeInTheDocument()
  })

  it('keeps visible text as the accessible name when tooltip is set', () => {
    render(FloatButton, { props: { tooltip: 'Help' }, slots: { default: '保存' } })
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Help')
  })

  it('places a floating button on the logical end/block axes', () => {
    render(FloatButton, { props: { floating: true } })
    const button = screen.getByRole('button')
    expect(button.style.insetInlineEnd).toBe(`${VIEWPORT_FLOATING_FAB_OFFSET.x}px`)
    expect(button.style.insetBlockEnd).toBe(`${VIEWPORT_FLOATING_FAB_OFFSET.y}px`)
  })

  it('does not fire click when disabled', async () => {
    const onClick = vi.fn()
    render(FloatButton, { props: { disabled: true }, attrs: { onClick } })
    await fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })
})

describe('FloatButtonGroup (Vue)', () => {
  it('is a disclosure: trigger expands and lists actions', async () => {
    render({
      setup: () => () =>
        h(
          FloatButtonGroup,
          { portal: false },
          {
            trigger: () => h(FloatButton, { ariaLabel: 'Open actions' }),
            default: () => h(FloatButton, { ariaLabel: 'Edit' })
          }
        )
    })
    const trigger = screen.getByRole('button', { name: 'Open actions' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()

    await fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-controls')
  })

  it('opens from click when trigger is hover', async () => {
    const onOpenChange = vi.fn()
    render({
      setup: () => () =>
        h(
          FloatButtonGroup,
          { portal: false, trigger: 'hover', onOpenChange, 'onOpen-change': onOpenChange },
          {
            trigger: () => h(FloatButton, { ariaLabel: 'Hover' }),
            default: () => h(FloatButton, { ariaLabel: 'Child' })
          }
        )
    })
    await fireEvent.click(screen.getByRole('button', { name: 'Hover' }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('button', { name: 'Child' })).toBeInTheDocument()
  })

  it('closes on Escape when defaultOpen', async () => {
    render({
      setup: () => () =>
        h(
          FloatButtonGroup,
          { portal: false, defaultOpen: true },
          {
            trigger: () => h(FloatButton, { ariaLabel: 'Open' }),
            default: () => h(FloatButton, { ariaLabel: 'Child' })
          }
        )
    })
    expect(screen.getByRole('button', { name: 'Child' })).toBeInTheDocument()
    await fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('button', { name: 'Child' })).not.toBeInTheDocument()
  })

  it('inherits group square shape on child buttons', () => {
    render({
      setup: () => () =>
        h(
          FloatButtonGroup,
          { portal: false, open: true, shape: 'square' },
          {
            trigger: () => h(FloatButton, { ariaLabel: 'Open' }),
            default: () => h(FloatButton, { ariaLabel: 'Child' })
          }
        )
    })
    for (const button of screen.getAllByRole('button')) {
      expect(button.className).not.toContain('rounded-full')
    }
  })

  it('portals the group to document.body by default', () => {
    render({
      setup: () => () =>
        h(
          FloatButtonGroup,
          { className: 'portal-default-group' },
          {
            trigger: () => h(FloatButton, { ariaLabel: 'Open' })
          }
        )
    })
    const group = document.body.querySelector('.portal-default-group')
    expect(group).toBeTruthy()
    expect(group?.className).toContain('fixed')
  })

  it('has no a11y violations when open on document.body', async () => {
    render({
      setup: () => () =>
        h(
          FloatButtonGroup,
          { open: true },
          {
            trigger: () => h(FloatButton, { ariaLabel: 'Open actions' }),
            default: () => h(FloatButton, { ariaLabel: 'Edit' })
          }
        )
    })
    await expectNoA11yViolations(document.body)
  })
})
