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
import type { FloatingPlacement } from '@expcat/tigercat-core'

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

  it('recomputes position when placement changes while the overlay is open', async () => {
    floatingMocks.computePosition.mockResolvedValue({
      x: 10,
      y: 20,
      placement: 'top',
      middlewareData: {}
    })

    const referenceRef = {
      current: document.createElement('button')
    } as React.RefObject<HTMLElement>
    const floatingRef = {
      current: document.createElement('div')
    } as React.RefObject<HTMLElement>

    const { rerender } = renderHook(
      ({
        enabled,
        placement,
        offset
      }: {
        enabled: boolean
        placement: FloatingPlacement
        offset: number
      }) => useFloating({ referenceRef, floatingRef, enabled, placement, offset }),
      { initialProps: { enabled: true, placement: 'bottom' as FloatingPlacement, offset: 8 } }
    )

    await waitFor(() => expect(floatingMocks.computePosition).toHaveBeenCalledTimes(1))
    expect(floatingMocks.computePosition.mock.calls[0]?.[2]).toEqual(
      expect.objectContaining({ placement: 'bottom', offset: 8 })
    )

    rerender({ enabled: true, placement: 'top', offset: 16 })

    await waitFor(() => expect(floatingMocks.computePosition).toHaveBeenCalledTimes(2))
    expect(floatingMocks.computePosition.mock.calls[1]?.[2]).toEqual(
      expect.objectContaining({ placement: 'top', offset: 16 })
    )
  })
})
