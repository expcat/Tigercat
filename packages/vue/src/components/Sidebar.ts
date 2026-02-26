import { defineComponent, h, PropType, computed } from 'vue'
import {
  classNames,
  coerceClassValue,
  layoutSidebarClasses,
  layoutSidebarCollapsedClasses,
  getSidebarStyle,
  mergeStyleValues
} from '@expcat/tigercat-core'

export interface VueSidebarProps {
  className?: string
  width?: string
  collapsedWidth?: string
  collapsed?: boolean
  style?: Record<string, string | number>
}

export const Sidebar = defineComponent({
  name: 'TigerSidebar',
  inheritAttrs: false,
  props: {
    /**
     * Additional CSS classes
     */
    className: {
      type: String as PropType<string>,
      default: undefined
    },
    /**
     * Sidebar width (CSS value)
     * @default '256px'
     */
    width: {
      type: String as PropType<string>,
      default: '256px'
    },
    /**
     * Width when collapsed (mini mode).
     * Set to '0px' to fully hide the sidebar when collapsed.
     * @default '64px'
     */
    collapsedWidth: {
      type: String as PropType<string>,
      default: '64px'
    },
    /**
     * Whether the sidebar is collapsed
     * @default false
     */
    collapsed: {
      type: Boolean as PropType<boolean>,
      default: false
    },

    /**
     * Custom styles
     */
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const sidebarClasses = computed(() =>
      classNames(
        layoutSidebarClasses,
        props.collapsed && layoutSidebarCollapsedClasses,
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    const sidebarStyle = computed(() =>
      getSidebarStyle(props.collapsed, props.width, props.collapsedWidth)
    )

    return () =>
      h(
        'aside',
        {
          ...attrs,
          class: sidebarClasses.value,
          style: mergeStyleValues(props.style, sidebarStyle.value)
        },
        slots.default?.()
      )
  }
})

export default Sidebar
