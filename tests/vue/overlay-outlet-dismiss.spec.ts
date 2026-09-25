/**
 * @vitest-environment happy-dom
 */
import { defineComponent, h, nextTick, ref } from 'vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { ContextMenu, ContextMenuItem, ContextMenuMenu } from '@expcat/tigercat-vue/ContextMenu'
import { Input } from '@expcat/tigercat-vue/Input'
import { Modal } from '@expcat/tigercat-vue/Modal'
import { NumberKeyboard } from '@expcat/tigercat-vue/NumberKeyboard'
import { Spotlight } from '@expcat/tigercat-vue/Spotlight'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { flushOverlayOutsideDismiss } from '../utils/frame-scheduler'

const confirmName = enUS.common!.okText!

describe('overlay dismiss inside ConfigProvider', () => {
  it('number keyboard stays closed after confirm when focus opens it', async () => {
    const Demo = defineComponent({
      setup() {
        const value = ref('4558')
        const open = ref(false)
        return () =>
          h(ConfigProvider, null, () => [
            h(Input, {
              modelValue: value.value,
              'onUpdate:modelValue': (next: string) => {
                value.value = next
              },
              onFocus: () => {
                open.value = true
              }
            }),
            h(NumberKeyboard, {
              modelValue: value.value,
              open: open.value,
              mode: 'amount',
              'onUpdate:modelValue': (next: string) => {
                value.value = next
              },
              'onUpdate:open': (next: boolean) => {
                open.value = next
              },
              onConfirm: () => {
                open.value = false
              }
            })
          ])
      }
    })
    render(Demo)
    const input = document.querySelector('input') as HTMLInputElement
    input.focus()
    await nextTick()
    expect(screen.queryByRole('dialog')).toBeTruthy()
    await fireEvent.click(screen.getByRole('button', { name: confirmName }))
    await flushOverlayOutsideDismiss()
    expect(screen.queryByRole('dialog')).toBeNull()

    input.focus()
    await nextTick()
    expect(screen.queryByRole('dialog')).toBeTruthy()
    const scrim = document.querySelector('.fixed.inset-0')
    expect(scrim).toBeTruthy()
    await fireEvent.click(scrim!)
    await flushOverlayOutsideDismiss()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('context menu closes on escape inside ConfigProvider', async () => {
    const Demo = defineComponent({
      setup() {
        return () =>
          h(ConfigProvider, null, () =>
            h(ContextMenu, null, () => [
              h('div', 'Surface'),
              h(ContextMenuMenu, null, () => [h(ContextMenuItem, null, () => 'Copy')])
            ])
          )
      }
    })
    render(Demo)
    const trigger = document.querySelector('[data-tiger-context-menu-trigger]') as HTMLElement
    await fireEvent.contextMenu(trigger, { clientX: 20, clientY: 20 })
    await nextTick()
    expect(document.querySelector('[data-tiger-context-menu]')).toBeTruthy()
    await fireEvent.keyDown(document, { key: 'Escape' })
    await flushOverlayOutsideDismiss()
    expect(document.querySelector('[data-tiger-context-menu]')).toBeNull()

    await fireEvent.contextMenu(trigger, { clientX: 24, clientY: 24 })
    await flushOverlayOutsideDismiss()
    expect(document.querySelector('[data-tiger-context-menu]')).toBeTruthy()
    const outside = document.createElement('button')
    outside.type = 'button'
    document.body.appendChild(outside)
    await fireEvent.click(outside)
    outside.remove()
    await flushOverlayOutsideDismiss()
    expect(document.querySelector('[data-tiger-context-menu]')).toBeNull()
  })

  it('spotlight closes on escape and mask inside ConfigProvider', async () => {
    const open = ref(true)
    const Demo = defineComponent({
      setup() {
        return () =>
          h(ConfigProvider, null, () =>
            h(Spotlight, {
              open: open.value,
              items: [{ key: 'a', label: 'Alpha' }],
              'onUpdate:open': (next: boolean) => {
                open.value = next
              }
            })
          )
      }
    })
    render(Demo)
    expect(document.querySelector('[role="dialog"]')).toBeTruthy()
    await fireEvent.keyDown(document.querySelector('input')!, { key: 'Escape' })
    await flushOverlayOutsideDismiss()
    expect(document.querySelector('[role="dialog"]')).toBeNull()

    open.value = true
    await flushOverlayOutsideDismiss()
    const mask = document.querySelector('[data-tiger-spotlight-root] .absolute.inset-0')
    expect(mask).toBeTruthy()
    await fireEvent.click(mask!)
    await flushOverlayOutsideDismiss()
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  it('nested modal confirm does not leave the page inert', async () => {
    const Demo = defineComponent({
      setup() {
        const outerOpen = ref(true)
        const innerOpen = ref(false)
        return () =>
          h(ConfigProvider, null, () =>
            h(
              Modal,
              {
                open: outerOpen.value,
                title: 'Outer',
                'onUpdate:open': (next: boolean) => {
                  outerOpen.value = next
                }
              },
              {
                default: () => [
                  h(
                    'button',
                    {
                      type: 'button',
                      onClick: () => {
                        innerOpen.value = true
                      }
                    },
                    'Continue'
                  ),
                  h(
                    Modal,
                    {
                      open: innerOpen.value,
                      title: 'Inner',
                      showDefaultFooter: true,
                      'onUpdate:open': (next: boolean) => {
                        innerOpen.value = next
                      }
                    },
                    { default: () => 'Nested' }
                  )
                ],
                footer: () =>
                  h(
                    'button',
                    {
                      type: 'button',
                      onClick: () => {
                        outerOpen.value = false
                      }
                    },
                    'Close outer'
                  )
              }
            )
          )
      }
    })
    render(Demo)
    await screen.findByRole('dialog', { name: 'Outer' })
    await fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    const inner = await screen.findByRole('dialog', { name: 'Inner' })
    const outer = screen.getByRole('dialog', { name: 'Outer' })
    expect(inner.closest('[inert]')).toBeNull()
    expect(inner.closest('[data-tiger-overlay-host]')?.id).toBe(outer.getAttribute('aria-owns'))
    await fireEvent.click(screen.getByRole('button', { name: enUS.common!.okText! }))
    await flushOverlayOutsideDismiss()
    expect(screen.queryByRole('dialog', { name: 'Inner' })).toBeNull()
    const closeOuter = screen.getByRole('button', { name: 'Close outer' })
    expect(closeOuter.closest('[inert]')).toBeNull()
    await fireEvent.click(closeOuter)
    await flushOverlayOutsideDismiss()
    expect(screen.queryByRole('dialog', { name: 'Outer' })).toBeNull()
  })
})
