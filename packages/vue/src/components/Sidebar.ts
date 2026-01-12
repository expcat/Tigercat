import { defineComponent, h, PropType, computed } from 'vue';
import {
  classNames,
  coerceClassValue,
  layoutSidebarClasses,
  mergeStyleValues,
} from '@tigercat/core';

export interface VueSidebarProps {
  className?: string;
  width?: string;
  collapsed?: boolean;
  style?: Record<string, string | number>;
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
      default: undefined,
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

    /**
     * Custom styles
     */
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>;

    const sidebarClasses = computed(() =>
      classNames(
        layoutSidebarClasses,
        props.className,
        coerceClassValue(attrsRecord.class)
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
          ...attrs,
          class: sidebarClasses.value,
          style: mergeStyleValues(
            attrsRecord.style,
            props.style,
            sidebarStyle.value
          ),
        },
        !props.collapsed && slots.default?.()
      );
    };
  },
});

export default Sidebar;
