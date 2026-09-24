import { defineComponent, h, PropType, computed, provide } from 'vue'
import {
  classNames,
  coerceClassValue,
  getLayoutSidebarClasses,
  getSidebarAriaLabel,
  getSidebarStyle,
  isSidebarFullyHidden,
  mergeStyleValues,
  resolveSidebarAriaProps,
  type LayoutSiderSide,
  type SidebarLandmark
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { SidebarContextKey } from '../utils/layout-context'

export interface VueSidebarProps {
  className?: string
  width?: string
  collapsedWidth?: string
  collapsed?: boolean
  side?: LayoutSiderSide
  landmark?: SidebarLandmark
  style?: Record<string, string | number>
}

export const Sidebar = defineComponent({
  name: 'TigerSidebar',
  inheritAttrs: false,
  props: {
    className: {
      type: String as PropType<string>,
      default: undefined
    },
    width: {
      type: String as PropType<string>,
      default: undefined
    },
    collapsedWidth: {
      type: String as PropType<string>,
      default: '64px'
    },
    collapsed: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    side: {
      type: String as PropType<LayoutSiderSide>,
      default: 'start'
    },
    landmark: {
      type: String as PropType<SidebarLandmark>,
      default: 'default'
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const config = useTigerConfig()
    const fallbackName = computed(() => getSidebarAriaLabel(config.value.locale))
    const collapsedRef = computed(() => props.collapsed)

    provide(SidebarContextKey, { collapsed: collapsedRef })

    const fullyHidden = computed(() => isSidebarFullyHidden(props.collapsed, props.collapsedWidth))

    const sidebarClasses = computed(() =>
      classNames(
        getLayoutSidebarClasses({
          collapsed: props.collapsed,
          side: props.side,
          widthProvided: props.width !== undefined
        }),
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    const sidebarStyle = computed(() =>
      getSidebarStyle(props.collapsed, props.width, props.collapsedWidth)
    )

    return () => {
      const restAttrs = { ...attrs } as Record<string, unknown>
      const ariaLabel = restAttrs['aria-label']
      const ariaLabelledby = restAttrs['aria-labelledby']
      delete restAttrs['aria-label']
      delete restAttrs['aria-labelledby']
      const aria =
        props.landmark === 'plain'
          ? {}
          : resolveSidebarAriaProps({
              ariaLabel,
              ariaLabelledby,
              fallback: props.landmark === 'default' ? fallbackName.value : ''
            })

      return h(
        props.landmark === 'plain' ? 'div' : 'aside',
        {
          ...restAttrs,
          class: sidebarClasses.value,
          style: mergeStyleValues(props.style, sidebarStyle.value),
          inert: fullyHidden.value ? true : undefined,
          'aria-hidden': fullyHidden.value ? true : undefined,
          ...aria
        },
        slots.default?.()
      )
    }
  }
})

export default Sidebar
