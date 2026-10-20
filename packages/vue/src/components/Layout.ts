import { defineComponent, h, PropType, computed, inject, provide, ref, cloneVNode } from 'vue'
import type { VNode } from 'vue'
import {
  classNames,
  coerceClassValue,
  getLayoutRootClasses,
  getLayoutSkipLinkClasses,
  getSkipToContentLabel,
  isLayoutSiderTypeName,
  resolveContentMainId,
  resolveLayoutHasSider,
  resolveSidebarLandmark,
  warnIfLayoutSiderMissed,
  type LayoutDirection,
  type SidebarLandmark
} from '@expcat/tigercat-core'
import { flattenSlotVNodes } from '../utils/flatten-vnodes'
import { LayoutContextKey, type LayoutContextValue } from '../utils/layout-context'
import { useTigerConfig } from './tiger-config'

export interface VueLayoutProps {
  className?: string
  mode?: LayoutDirection
  hasSider?: boolean
  fullHeight?: boolean
  style?: Record<string, string | number>
}

function vnodeTypeName(vnode: VNode): string | undefined {
  const type = vnode.type as { name?: string } | string
  if (typeof type === 'object' && type?.name) return type.name
  return undefined
}

function vnodeIsSider(vnode: VNode): boolean {
  return isLayoutSiderTypeName(vnodeTypeName(vnode))
}

/**
 * Skip link target: the id of the first Content that renders a `main`.
 * Statically known nested Layout subtrees are resolved with nested
 * semantics (their Content defaults to `div` unless `as="main"`).
 * Without a target no link is emitted.
 */
function resolveSkipTargetId(vnodes: VNode[], nested: boolean): string | null {
  for (const vnode of vnodes) {
    const name = vnodeTypeName(vnode)
    if (name === 'TigerContent') {
      const vnodeProps = (vnode.props ?? {}) as { as?: unknown; id?: unknown }
      const mainId = resolveContentMainId({
        nested,
        explicit: typeof vnodeProps.as === 'string' ? vnodeProps.as : undefined,
        id: typeof vnodeProps.id === 'string' ? vnodeProps.id : undefined
      })
      if (mainId) return mainId
      continue
    }
    if (name === 'TigerLayout') {
      const slots = (vnode.children ?? {}) as { default?: () => VNode[] | VNode }
      if (typeof slots.default !== 'function') continue
      const inner = slots.default()
      const mainId = resolveSkipTargetId(
        flattenSlotVNodes(Array.isArray(inner) ? inner : [inner]),
        true
      )
      if (mainId) return mainId
    }
  }
  return null
}

function vnodeHasOwnSidebarName(vnode: VNode): boolean {
  const props = (vnode.props ?? {}) as { 'aria-label'?: unknown; 'aria-labelledby'?: unknown }
  const label = typeof props['aria-label'] === 'string' ? props['aria-label'].trim() : ''
  const labelledby =
    typeof props['aria-labelledby'] === 'string' ? props['aria-labelledby'].trim() : ''
  return Boolean(label || labelledby)
}

export const Layout = defineComponent({
  name: 'TigerLayout',
  inheritAttrs: false,
  props: {
    className: {
      type: String as PropType<string>,
      default: undefined
    },
    mode: {
      type: String as PropType<LayoutDirection>,
      default: undefined
    },
    hasSider: {
      type: Boolean as PropType<boolean>,
      default: undefined
    },
    fullHeight: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const parent = inject(LayoutContextKey, null)
    const config = useTigerConfig()
    const nested = computed(() => parent != null)
    const shellFullHeight = computed(() => props.fullHeight && !nested.value)
    const hasSider = ref(false)
    const namedSidebarClaimed = ref(Boolean(parent?.namedSidebarClaimed.value))

    const context: LayoutContextValue = {
      nested,
      hasSider: computed(() => hasSider.value),
      fullHeight: shellFullHeight,
      namedSidebarClaimed: computed(() => namedSidebarClaimed.value)
    }
    provide(LayoutContextKey, context)

    return () => {
      const vnodes = flattenSlotVNodes(slots.default?.() as VNode[] | undefined)
      const names = vnodes.map(vnodeTypeName)
      const childIsSider = names.some((name) => name === 'TigerSidebar')
      warnIfLayoutSiderMissed({ hasSider: props.hasSider, childNames: names })
      hasSider.value = resolveLayoutHasSider({
        hasSider: props.hasSider,
        mode: props.mode,
        childIsSider
      })

      let claimed = Boolean(parent?.namedSidebarClaimed.value)
      const rendered = vnodes.map((vnode) => {
        if (!vnodeIsSider(vnode)) return vnode
        const landmark: SidebarLandmark = resolveSidebarLandmark({
          hasOwnName: vnodeHasOwnSidebarName(vnode),
          namedSidebarClaimed: claimed
        })
        if (landmark === 'default') claimed = true
        return cloneVNode(vnode, { landmark })
      })
      namedSidebarClaimed.value = claimed

      const layoutClasses = classNames(
        getLayoutRootClasses({
          hasSider: hasSider.value,
          nested: nested.value,
          fullHeight: props.fullHeight
        }),
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )

      const skipTarget = nested.value ? null : resolveSkipTargetId(vnodes, false)
      const skip = skipTarget
        ? h(
            'a',
            {
              class: getLayoutSkipLinkClasses(),
              href: `#${skipTarget}`
            },
            getSkipToContentLabel(config.value.locale)
          )
        : null

      return h('div', { ...attrs, class: layoutClasses, style: props.style }, [skip, ...rendered])
    }
  }
})

export default Layout
