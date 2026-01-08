import { defineComponent, computed, h, PropType } from 'vue';
import {
  classNames,
  getSpaceGapSize,
  getSpaceAlignClass,
  getSpaceDirectionClass,
  type SpaceDirection,
  type SpaceSize,
  type SpaceAlign,
} from '@tigercat/core';

const baseClasses = 'inline-flex';

export const Space = defineComponent({
  name: 'TigerSpace',
  props: {
    /**
     * Layout direction
     * @default 'horizontal'
     */
    direction: {
      type: String as PropType<SpaceDirection>,
      default: 'horizontal' as SpaceDirection,
    },
    /**
     * Gap size between items
     * @default 'md'
     */
    size: {
      type: [String, Number] as PropType<SpaceSize>,
      default: 'md' as SpaceSize,
    },
    /**
     * Alignment of items
     * @default 'start'
     */
    align: {
      type: String as PropType<SpaceAlign>,
      default: 'start' as SpaceAlign,
    },
    /**
     * Whether to wrap items
     * @default false
     */
    wrap: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots, attrs }) {
    const gapSize = computed(() => getSpaceGapSize(props.size));

    const spaceClasses = computed(() => {
      return classNames(
        baseClasses,
        getSpaceDirectionClass(props.direction),
        getSpaceAlignClass(props.align),
        gapSize.value.class,
        props.wrap && 'flex-wrap'
      );
    });

    const spaceStyle = computed(() => {
      if (gapSize.value.style) {
        return { gap: gapSize.value.style };
      }
      return undefined;
    });

    const mergedClass = computed(() => [spaceClasses.value, attrs.class]);
    const mergedStyle = computed(() => [spaceStyle.value, attrs.style]);

    return () => {
      return h(
        'div',
        {
          ...attrs,
          class: mergedClass.value,
          style: mergedStyle.value,
        },
        slots.default?.()
      );
    };
  },
});

export default Space;
