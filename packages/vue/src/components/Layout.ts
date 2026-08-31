import { defineComponent, h, PropType, computed, inject, provide, ref } from 'vue'
import type { VNode } from 'vue'
import {
  classNames,
  coerceClassValue,
  getLayoutRootClasses,
  injectLayoutGridStyles,
  isLayoutSiderTypeName,
  resolveLayoutHasSider,
  type LayoutDirection
} from '@expcat/tigercat-core'
import { flattenSlotVNodes } from '../utils/flatten-vnodes'
import { LayoutContextKey, type LayoutContextValue } from '../utils/layout-context'

export interface VueLayoutProps {
  className?: string
  direction?: LayoutDirection
  hasSider?: boolean
  fullHeight?: boolean
  style?: Record<string, string | number>
}

function vnodeIsSider(vnode: VNode): boolean {
  const type = vnode.type as { name?: string } | string
  if (typeof type === 'object' && type?.name) return isLayoutSiderTypeName(type.name)
  return false
}

export const Layout = defineComponent({
  name: 'TigerLayout',
  inheritAttrs: false,
  props: {
    className: {
      type: String as PropType<string>,
      default: undefined
    },
    direction: {
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
    injectLayoutGridStyles()
    const parent = inject(LayoutContextKey, null)
    const nested = computed(() => parent != null)
    const siderCollapsed = ref(false)
    const contentEl = ref<HTMLElement | null>(null)

    const childIsSider = computed(() =>
      flattenSlotVNodes(slots.default?.() as VNode[] | undefined).some(vnodeIsSider)
    )
    const hasSider = computed(() =>
      resolveLayoutHasSider({
        hasSider: props.hasSider,
        direction: props.direction,
        childIsSider: childIsSider.value
      })
    )

    const context: LayoutContextValue = {
      nested,
      hasSider,
      siderCollapsed,
      setSiderCollapsed: (collapsed: boolean) => {
        siderCollapsed.value = collapsed
      },
      contentEl,
      setContentEl: (el: HTMLElement | null) => {
        contentEl.value = el
      }
    }
    provide(LayoutContextKey, context)

    const layoutClasses = computed(() =>
      classNames(
        getLayoutRootClasses({
          hasSider: hasSider.value,
          nested: nested.value,
          fullHeight: props.fullHeight
        }),
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    return () =>
      h('div', { ...attrs, class: layoutClasses.value, style: props.style }, slots.default?.())
  }
})

export default Layout
