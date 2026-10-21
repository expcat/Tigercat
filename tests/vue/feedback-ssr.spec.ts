/**
 * @vitest-environment node
 *
 * Closed Modal/Drawer/Tour must render on the server without reading browser
 * globals, and open SSR renders must not leak the process-level overlay z
 * serial or the drawer layer registry (renderToString never unmounts
 * components, so onBeforeUnmount release hooks do not run).
 */

import { afterEach, describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import {
  getDrawerLayers,
  overlayZOpenCount,
  resetDrawerLayers,
  resetOverlayZ
} from '@expcat/tigercat-core'
import { Modal } from '@expcat/tigercat-vue/Modal'
import { Drawer } from '@expcat/tigercat-vue/Drawer'
import { Tour } from '@expcat/tigercat-vue/Tour'

afterEach(() => {
  resetOverlayZ()
  resetDrawerLayers()
})

describe('Feedback overlays (SSR)', () => {
  it('renders closed Modal, Drawer, and Tour without browser globals', async () => {
    expect(typeof document).toBe('undefined')
    const html = await renderToString(
      createSSRApp({
        render: () => [
          h(Modal, { open: false }),
          h(Drawer, { open: false }),
          h(Tour, { open: false, steps: [] })
        ]
      })
    )
    expect(typeof html).toBe('string')
  })

  it('does not leak the overlay z serial or drawer layers across open renders', async () => {
    for (let i = 0; i < 2; i += 1) {
      await renderToString(
        createSSRApp({
          render: () => [h(Modal, { open: true }), h(Drawer, { open: true })]
        })
      )
    }
    expect(overlayZOpenCount()).toBe(0)
    expect(getDrawerLayers()).toHaveLength(0)
  })
})
