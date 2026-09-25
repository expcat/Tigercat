/**
 * @vitest-environment happy-dom
 */

import { defineComponent, h, nextTick, ref } from 'vue'
import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { Dropdown, DropdownItem, DropdownMenu } from '@expcat/tigercat-vue/Dropdown'
import { renderVueOverlayTeleport } from '../../packages/vue/src/utils/overlay'

describe('Vue portaled overlay teardown', () => {
  it('removes a teleported layer when the host unmounts', async () => {
    const open = ref(true)
    const Host = defineComponent({
      setup() {
        return () =>
          open.value
            ? h('div', { 'data-host': '' }, [
                renderVueOverlayTeleport(h('div', { 'data-panel': '' }, 'menu'), document.body)
              ])
            : h('div', { 'data-host': '' })
      }
    })

    const view = render(Host)
    await nextTick()
    expect(document.querySelector('[data-panel]')).not.toBeNull()

    open.value = false
    await nextTick()
    expect(document.querySelector('[data-panel]')).toBeNull()
    view.unmount()
  })

  it('removes an open dropdown when the owner window is discarded', async () => {
    const view = render(Dropdown, {
      props: { trigger: 'click' },
      slots: {
        default: () => [
          h('button', null, 'Trigger'),
          h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
        ]
      }
    })
    document.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(document.querySelector('[data-tiger-dropdown-menu]')).not.toBeNull()

    window.dispatchEvent(new Event('pagehide'))
    expect(document.querySelector('[data-tiger-dropdown-menu]')).toBeNull()
    view.unmount()
  })
})
