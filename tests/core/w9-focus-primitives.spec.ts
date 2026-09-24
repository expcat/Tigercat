/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRovingFocus } from '../../packages/core/src/utils/roving-focus'
import { createDismissLayer } from '../../packages/core/src/utils/dismiss-layer'

describe('roving focus', () => {
  it('moves with arrows, skips disabled items, and honors Home and End', () => {
    const active = vi.fn()
    const roving = createRovingFocus([{ id: 'a' }, { id: 'b', disabled: true }, { id: 'c' }], {
      orientation: 'horizontal',
      loop: true,
      onActive: active
    })

    expect(roving.getActive()).toBe('a')
    const preventDefault = () => undefined
    roving.onKeyDown({ key: 'ArrowRight', preventDefault })
    expect(roving.getActive()).toBe('c')
    roving.onKeyDown({ key: 'End', preventDefault })
    expect(roving.getActive()).toBe('c')
    roving.onKeyDown({ key: 'Home', preventDefault })
    expect(roving.getActive()).toBe('a')
    roving.onKeyDown({ key: 'ArrowLeft', preventDefault })
    expect(roving.getActive()).toBe('c')
    expect(active).toHaveBeenCalled()
  })
})

describe('dismiss layer', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it('lets only the top layer receive Escape and dismisses outside pointers', () => {
    const outer = document.createElement('div')
    const inner = document.createElement('div')
    const outside = document.createElement('button')
    outer.append(inner)
    document.body.append(outer, outside)

    const onOuter = vi.fn()
    const onInner = vi.fn()
    const outerLayer = createDismissLayer(outer, { onDismiss: onOuter })
    const innerLayer = createDismissLayer(inner, { onDismiss: onInner })
    outerLayer.bind()
    innerLayer.bind()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(onInner).toHaveBeenCalledTimes(1)
    expect(onOuter).not.toHaveBeenCalled()

    innerLayer.unbind()
    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    expect(onOuter).toHaveBeenCalledTimes(1)
    outerLayer.unbind()
  })
})
