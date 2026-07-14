/**
 * @vitest-environment happy-dom
 */

import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type React from 'react'

const floatingMocks = vi.hoisted(() => ({
  autoUpdate: vi.fn(),
  computePosition: vi.fn()
}))

vi.mock('@expcat/tigercat-core', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@expcat/tigercat-core')>()),
  autoUpdateFloating: floatingMocks.autoUpdate,
  computeFloatingPosition: floatingMocks.computePosition
}))

import { useFloating } from '../../packages/react/src/utils/overlay'

describe('React floating positioning lifecycle', () => {
  beforeEach(() => {
    floatingMocks.autoUpdate.mockReset().mockReturnValue(vi.fn())
    floatingMocks.computePosition.mockReset()
  })

  it('ignores a positioning result that resolves after the overlay closes', async () => {
    let resolvePosition: ((value: unknown) => void) | undefined
    floatingMocks.computePosition.mockReturnValue(
      new Promise((resolve) => {
        resolvePosition = resolve
      })
    )

    const referenceRef = {
      current: document.createElement('button')
    } as React.RefObject<HTMLElement>
    const floatingRef = {
      current: document.createElement('div')
    } as React.RefObject<HTMLElement>

    const { result, rerender } = renderHook(
      ({ enabled }) => useFloating({ referenceRef, floatingRef, enabled }),
      { initialProps: { enabled: true } }
    )

    await waitFor(() => expect(floatingMocks.computePosition).toHaveBeenCalledTimes(1))
    rerender({ enabled: false })

    await act(async () => {
      resolvePosition?.({ x: 91, y: 47, placement: 'bottom', middlewareData: {} })
      await Promise.resolve()
    })

    expect(result.current.isPositioned).toBe(false)
    expect(result.current.x).toBe(0)
    expect(result.current.y).toBe(0)
  })
})
