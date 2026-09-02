/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import { resolveAlertRole } from '@expcat/tigercat-core'

describe('Alert live role', () => {
  it('is alert only for error content, never for an empty shell', () => {
    expect(resolveAlertRole('error', true)).toBe('alert')
    expect(resolveAlertRole('error', false)).toBeUndefined()
    expect(resolveAlertRole('info', true)).toBeUndefined()
    expect(resolveAlertRole('success', true)).toBeUndefined()
    expect(resolveAlertRole('warning', true)).toBeUndefined()
  })
})
