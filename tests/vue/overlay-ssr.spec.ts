/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import { effectScope, ref } from 'vue'
import {
  useVueClickOutside,
  useVueEscapeKey,
  useVueFloating
} from '../../packages/vue/src/utils/overlay'

describe('Vue overlay hooks outside the browser', () => {
  it('returns no-op cleanups and does not throw', () => {
    const scope = effectScope()
    expect(() => {
      scope.run(() => {
        useVueClickOutside({
          enabled: ref(true),
          refs: [ref(null)],
          onOutsideClick: () => undefined
        })()
        useVueEscapeKey({
          enabled: ref(true),
          onEscape: () => undefined
        })()
        useVueFloating({
          referenceRef: ref(null),
          floatingRef: ref(null),
          enabled: ref(true)
        })
      })
    }).not.toThrow()
    scope.stop()
  })
})
