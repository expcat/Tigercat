/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'

import { collectTigerCssVars } from '../../examples/example/shared/themes'

describe('example shell theme tokens', () => {
  it('reads a tiger custom property even when it is not enumerated', () => {
    const root = document.createElement('div')
    root.style.setProperty('--tiger-primary', '#059669')
    document.body.appendChild(root)
    expect(collectTigerCssVars(root)).toContain('--tiger-primary:#059669')
    root.remove()
  })
})
