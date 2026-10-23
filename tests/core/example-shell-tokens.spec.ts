/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'

import { collectTigerCssVars, observeDemoTheme } from '../../examples/example/shared/themes'

describe('example shell theme tokens', () => {
  it('reads a tiger custom property even when it is not enumerated', () => {
    const root = document.createElement('div')
    root.style.setProperty('--tiger-primary', '#059669')
    document.body.appendChild(root)
    expect(collectTigerCssVars(root)).toContain('--tiger-primary:#059669')
    root.remove()
  })

  it('keeps sandboxes mounted during scroll locks and notifies actual theme changes', async () => {
    const root = document.documentElement
    const previous = root.getAttribute('style')
    const onChange = vi.fn()
    const stop = observeDemoTheme(onChange)
    try {
      const flushed = new Promise<void>((resolve) => {
        const observer = new MutationObserver(() => {
          observer.disconnect()
          resolve()
        })
        observer.observe(root, { attributes: true })
      })
      root.style.overflow = 'hidden'
      await flushed
      expect(onChange).not.toHaveBeenCalled()
      root.style.setProperty('--tiger-primary', '#059669')
      await vi.waitFor(() => expect(onChange).toHaveBeenCalledOnce())
    } finally {
      stop()
      if (previous === null) root.removeAttribute('style')
      else root.setAttribute('style', previous)
    }
  })
})
