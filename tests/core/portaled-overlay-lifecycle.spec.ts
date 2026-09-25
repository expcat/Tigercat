/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it } from 'vitest'
import { retainPortaledOverlay } from '@expcat/tigercat-core'

describe('portaled overlay lifecycle', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it('removes a parent-document layer when the owner frame is discarded', async () => {
    const iframe = document.createElement('iframe')
    document.body.appendChild(iframe)
    const childWindow = iframe.contentWindow
    const childDocument = iframe.contentDocument
    if (!childWindow || !childDocument?.body) return
    Object.defineProperty(childWindow, 'frameElement', {
      configurable: true,
      get: () => iframe
    })

    const layer = document.createElement('div')
    layer.setAttribute('data-tiger-overlay-layer', '')
    layer.textContent = 'stale menu'
    document.body.appendChild(layer)

    const release = retainPortaledOverlay(layer, childWindow)
    iframe.remove()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(document.body.contains(layer)).toBe(false)
    release()
  })

  it('removes a parent-document layer when the owner window fires pagehide', () => {
    const layer = document.createElement('div')
    layer.textContent = 'stale panel'
    document.body.appendChild(layer)

    const owner = document.createElement('iframe')
    document.body.appendChild(owner)
    const childWindow = owner.contentWindow
    if (!childWindow) return

    const release = retainPortaledOverlay(layer, childWindow)
    childWindow.dispatchEvent(new Event('pagehide'))

    expect(document.body.contains(layer)).toBe(false)
    release()
    owner.remove()
  })

  it('leaves the layer for the framework to remove on a normal unmount', () => {
    const layer = document.createElement('div')
    document.body.appendChild(layer)
    const release = retainPortaledOverlay(layer)
    release()
    expect(document.body.contains(layer)).toBe(true)
    layer.remove()
  })
})
