/**
 * Renders open layers after the provider's children so server HTML and the
 * hydrated tree share one mount point.
 */
import {
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  onBeforeUnmount,
  provide,
  shallowRef,
  Teleport,
  type ComponentInternalInstance,
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

const OverlayOutletAnchor = defineComponent({
  name: 'TigerOverlayOutletAnchor',
  props: {
    layerId: { type: String, required: true }
  },
  setup(props) {
    const outlet = inject(OverlayOutletKey, null)
    onBeforeUnmount(() => outlet?.remove(props.layerId))
    return () => h('span', { class: 'contents', 'data-tiger-overlay-anchor': '' })
  }
})

function isInsideOverlayOutlet(instance: ComponentInternalInstance | null): boolean {
  let current = instance?.parent
  while (current) {
    if (current.type === OverlayOutletSlot) return true
    current = current.parent
  }
  return false
}

/** Parent overlay-host. The root outlet host is not a nesting target. */
function isNestedOverlayTarget(target: HTMLElement | null | undefined): boolean {
  if (!target?.hasAttribute('data-tiger-overlay-host')) return false
  if (target.hasAttribute('data-tiger-overlay-root')) return false
  return Boolean(target.closest('[data-tiger-overlay-layer]'))
}

function renderDomPortal(layer: VNodeChild, target?: HTMLElement | null): VNodeChild {
  if (layer == null || typeof layer === 'boolean') return null
  if (!isBrowser()) return layer
  const resolved = target ?? document.body
  return h(Teleport as never, { to: resolved }, [trackVuePortaledNode(layer)])
}

/**
 * Move `layer` into the outlet. A layer already rendered from inside the outlet
 * (nested Modal / menu) is teleported to its host instead, so it does not
 * upsert during the outlet render and restack forever.
 * The anchor removes the entry when the caller stops rendering it.
 */
export function renderVueOverlayOutlet(
  id: string,
  layer: VNodeChild | null,
  target?: HTMLElement | null,
  disabled = false
): VNodeChild {
  const outlet = inject(OverlayOutletKey, null)
  const nestInHost = isInsideOverlayOutlet(getCurrentInstance()) || isNestedOverlayTarget(target)
  if (!outlet || nestInHost) {
    if (nestInHost) outlet?.remove(id)
    if (disabled || layer == null || typeof layer === 'boolean') return null
    return renderDomPortal(layer, target)
  }
  if (disabled || layer == null || typeof layer === 'boolean') {
    outlet.remove(id)
    return null
  }
  outlet.upsert(id, layer)
  return h(OverlayOutletAnchor, { layerId: id })
}

export function createOverlayOutletId(prefix: string): string {
  nextOutletId += 1
  return `${prefix}-${nextOutletId}`
}
