/**
 * @vitest-environment happy-dom
 */

import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type React from 'react'
import { installFrameScheduler } from '../utils/frame-scheduler'

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
  afterEach(() => vi.unstubAllGlobals())

  beforeEach(() => {
    floatingMocks.autoUpdate.mockReset().mockReturnValue(vi.fn())
    floatingMocks.computePosition.mockReset()
  })

  it('waits for a delayed outlet mount and cancels pending work on unmount', async () => {
    const frames = installFrameScheduler()
    floatingMocks.computePosition.mockResolvedValue({
      x: 12,
      y: 24,
      placement: 'bottom',
      referenceHidden: false,
      middlewareData: {}
    })
    const referenceRef = { current: document.createElement('button') }
    const floatingRef: React.RefObject<HTMLElement | null> = { current: null }
    const { result, rerender, unmount } = renderHook(
      ({ enabled }) => useFloating({ referenceRef, floatingRef, enabled }),
      { initialProps: { enabled: true } }
    )
    for (let frame = 0; frame < 10; frame += 1) {
      await act(async () => frames.flush())
    }
    expect(floatingMocks.computePosition).not.toHaveBeenCalled()
    floatingRef.current = document.createElement('div')
    await act(async () => frames.flush())
    expect(result.current.isPositioned).toBe(true)
    expect(result.current.x).toBe(12)
    expect(floatingMocks.autoUpdate).toHaveBeenCalledTimes(1)

    rerender({ enabled: false })
    floatingRef.current = null
    rerender({ enabled: true })
    expect(frames.pendingCount()).toBe(1)
    unmount()
    expect(frames.pendingCount()).toBe(0)
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
