import { defineComponent, h, PropType, computed } from 'vue'
import { classNames } from '@tigercat/core'

export const Sidebar = defineComponent({
  name: 'TigerSidebar',
  props: {
    className: {
      type: String as PropType<string>,
      default: '',
    },
    width: {
      type: String as PropType<string>,
      default: '256px',
    },
    collapsed: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  setup(props, { slots }) {
    const sidebarClasses = computed(() => classNames(
      'tiger-sidebar',
      'bg-white border-r border-gray-200 transition-all duration-300',
      props.className
    ))

    const sidebarStyle = computed(() => ({
      width: props.collapsed ? '0' : props.width,
      minWidth: props.collapsed ? '0' : props.width,
      overflow: 'hidden',
    }))

    return () => {
      return h(
        'aside',
        {
          class: sidebarClasses.value,
          style: sidebarStyle.value,
        },
        !props.collapsed && slots.default?.()
      )
    }
  },
})

export default Sidebar
