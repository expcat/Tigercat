/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  createToastQueue,
  getToastItemRole,
  resolveImperativeMountTarget
} from '@expcat/tigercat-core'

describe('imperative host / toast queue (node)', () => {
  it('does not resolve a mount target outside the browser', () => {
    expect(resolveImperativeMountTarget()).toBeNull()
    expect(resolveImperativeMountTarget('#host')).toBeNull()
  })

  it('does not push toasts across two SSR requests', () => {
    const first = createToastQueue()
    const second = createToastQueue()

    expect(first.add({ duration: 1000 })).toBeNull()
    expect(second.add({ duration: 1000 })).toBeNull()
    expect(first.getSnapshot()).toHaveLength(0)
    expect(second.getSnapshot()).toHaveLength(0)
  })

  it('maps error toasts to alert and others to status', () => {
    expect(getToastItemRole('error')).toBe('alert')
    expect(getToastItemRole('info')).toBe('status')
    expect(getToastItemRole('loading')).toBe('status')
  })
})
