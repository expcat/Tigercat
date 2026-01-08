import { defineComponent, h, PropType, computed } from 'vue';
import { classNames } from '@tigercat/core';

export const Sidebar = defineComponent({
  name: 'TigerSidebar',
  props: {
    /**
     * Additional CSS classes
     */
    className: {
      type: String as PropType<string>,
      default: '',
    },
    /**
     * Sidebar width (CSS value)
     * @default '256px'
     */
    width: {
      type: String as PropType<string>,
      default: '256px',
    },
    /**
     * Whether the sidebar is collapsed
     * @default false
     */
    collapsed: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  setup(props, { slots }) {
    const sidebarClasses = computed(() =>
      classNames(
        'tiger-sidebar',
        'bg-white border-r border-gray-200 transition-all duration-300',
        props.className
      )
    );

    const sidebarStyle = computed(() => ({
      width: props.collapsed ? '0px' : props.width,
      minWidth: props.collapsed ? '0px' : props.width,
      overflow: 'hidden',
    }));

    return () => {
      return h(
        'aside',
        {
          class: sidebarClasses.value,
          style: sidebarStyle.value,
        },
        !props.collapsed && slots.default?.()
      );
    };
  },
});

export default Sidebar;
