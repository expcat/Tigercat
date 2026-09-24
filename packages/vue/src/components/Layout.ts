import { defineComponent, h, PropType, computed, inject, provide, ref, cloneVNode } from 'vue'
import type { VNode } from 'vue'
import {
  classNames,
  coerceClassValue,
  getLayoutRootClasses,
  isLayoutSiderTypeName,
  resolveLayoutHasSider,
  resolveSidebarLandmark,
  warnIfLayoutSiderMissed,
  type LayoutDirection,
  type SidebarLandmark
} from '@expcat/tigercat-core'
import { flattenSlotVNodes } from '../utils/flatten-vnodes'
import { LayoutContextKey, type LayoutContextValue } from '../utils/layout-context'

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

      return h('div', { ...attrs, class: layoutClasses, style: props.style }, rendered)
    }
  }
})

export default Layout
