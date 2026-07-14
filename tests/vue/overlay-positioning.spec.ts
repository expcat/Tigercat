/**
 * @vitest-environment happy-dom
 */

import { render, waitFor } from '@testing-library/vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const floatingMocks = vi.hoisted(() => ({
  autoUpdate: vi.fn(),
  computePosition: vi.fn()
}))

vi.mock('@expcat/tigercat-core', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@expcat/tigercat-core')>()),
  autoUpdateFloating: floatingMocks.autoUpdate,
  computeFloatingPosition: floatingMocks.computePosition
}))

import { useVueFloating, type UseVueFloatingReturn } from '../../packages/vue/src/utils/overlay'

describe('Vue floating positioning lifecycle', () => {
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

    const enabled = ref(true)
    const referenceRef = ref<HTMLElement | null>(document.createElement('button'))
    const floatingRef = ref<HTMLElement | null>(document.createElement('div'))
    let floatingState: UseVueFloatingReturn | undefined
    const Harness = defineComponent({
      setup() {
        floatingState = useVueFloating({ referenceRef, floatingRef, enabled })
        return () => h('div')
      }
    })

    render(Harness)
    await waitFor(() => expect(floatingMocks.computePosition).toHaveBeenCalledTimes(1))
    enabled.value = false
    await nextTick()

    resolvePosition?.({ x: 91, y: 47, placement: 'bottom', middlewareData: {} })
    await Promise.resolve()
    await nextTick()

    expect(floatingState?.isPositioned.value).toBe(false)
    expect(floatingState?.x.value).toBe(0)
    expect(floatingState?.y.value).toBe(0)
  })
})
