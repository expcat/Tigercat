/**
 * Renders open layers after the provider's children so server HTML and the
 * hydrated tree share one mount point.
 */
import {
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  provide,
  shallowRef,
  Teleport,
  type InjectionKey,
  type VNodeChild
} from 'vue'
import { createRenderOutlet, isBrowser, type RenderOutlet } from '@expcat/tigercat-core'
import { trackVuePortaledNode } from './overlay'

export const OverlayOutletKey: InjectionKey<RenderOutlet<VNodeChild>> =
  Symbol('tiger-overlay-outlet')

let nextOutletId = 0

const OverlayOutletSlot = defineComponent({
  name: 'TigerOverlayOutletSlot',
  props: {
    store: { type: Object as () => RenderOutlet<VNodeChild>, required: true }
  },
  setup(props) {
    const items = shallowRef(props.store.getSnapshot())
    const stop = props.store.subscribe(() => {
      items.value = props.store.getSnapshot()
    })
    onBeforeUnmount(stop)
    return () =>
      h(
        'div',
        { class: 'contents', 'data-tiger-overlay-root': '', 'data-tiger-overlay-host': '' },
        items.value.map((item) => h('div', { key: item.id, class: 'contents' }, item.node as never))
      )
  }
})

export const OverlayOutletProvider = defineComponent({
  name: 'TigerOverlayOutlet',
  setup(_props, { slots }) {
    const store = createRenderOutlet<VNodeChild>()
    provide(OverlayOutletKey, store)
    return () => [slots.default?.(), h(OverlayOutletSlot, { store })]
  }
})

export function useVueOverlayOutlet(): RenderOutlet<VNodeChild> | null {
  return inject(OverlayOutletKey, null)
}

/** Returns an anchor when the layer was moved into the outlet, otherwise the layer itself. */
export function renderVueOverlayOutlet(
  id: string,
  layer: VNodeChild | null,
  target?: HTMLElement | null,
  disabled = false
): VNodeChild {
  const outlet = inject(OverlayOutletKey, null)
  if (!outlet) {
    if (disabled || layer == null || typeof layer === 'boolean') return null
    if (!isBrowser()) return layer
    return h(Teleport as never, { to: target ?? 'body' }, [trackVuePortaledNode(layer)])
  }
  if (disabled || layer == null || typeof layer === 'boolean') {
    outlet.remove(id)
    return null
  }
  outlet.upsert(id, layer)
  return h('span', { class: 'contents', 'data-tiger-overlay-anchor': '' })
}

export function createOverlayOutletId(prefix: string): string {
  nextOutletId += 1
  return `${prefix}-${nextOutletId}`
}
