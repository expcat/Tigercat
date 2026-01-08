import { defineComponent, computed, h, PropType } from 'vue';
import {
  classNames,
  getDividerSpacingClasses,
  getDividerLineStyleClasses,
  getDividerOrientationClasses,
  type DividerOrientation,
  type DividerLineStyle,
  type DividerSpacing,
} from '@tigercat/core';

export const Divider = defineComponent({
  name: 'TigerDivider',
  props: {
    /**
     * Divider orientation
     * @default 'horizontal'
     */
    orientation: {
      type: String as PropType<DividerOrientation>,
      default: 'horizontal' as DividerOrientation,
    },
    /**
     * Line style (solid, dashed, dotted)
     * @default 'solid'
     */
    lineStyle: {
      type: String as PropType<DividerLineStyle>,
      default: 'solid' as DividerLineStyle,
    },
    /**
     * Spacing around the divider
     * @default 'md'
     */
    spacing: {
      type: String as PropType<DividerSpacing>,
      default: 'md' as DividerSpacing,
    },
    /**
     * Custom border color (CSS color value)
     */
    color: {
      type: String,
    },
    /**
     * Custom border thickness (CSS size value)
     */
    thickness: {
      type: String,
    },
  },
  setup(props, { attrs }) {
    const dividerClasses = computed(() => {
      return classNames(
        getDividerOrientationClasses(props.orientation),
        getDividerLineStyleClasses(props.lineStyle),
        getDividerSpacingClasses(props.spacing, props.orientation)
      );
    });

    const dividerStyle = computed(() => {
      const style: Record<string, string> = {};

      if (props.color) {
        style.borderColor = props.color;
      }

      if (props.thickness) {
        if (props.orientation === 'horizontal') {
          style.borderTopWidth = props.thickness;
        } else {
          style.borderLeftWidth = props.thickness;
        }
      }

      return style;
    });

    return () => {
      return h('div', {
        ...attrs,
        class: [dividerClasses.value, attrs.class],
        style: [dividerStyle.value, attrs.style],
        role: 'separator',
        'aria-orientation': props.orientation,
      });
    };
  },
});

export default Divider;
