import { defineComponent, computed, h, PropType, ref } from 'vue';
import {
  classNames,
  getTagVariantClasses,
  defaultTagThemeColors,
  tagBaseClasses,
  tagSizeClasses,
  tagCloseButtonBaseClasses,
  tagCloseIconPath,
  type TagVariant,
  type TagSize,
} from '@tigercat/core';

export interface VueTagProps {
  variant?: TagVariant;
  size?: TagSize;
  closable?: boolean;
  closeAriaLabel?: string;
  className?: string;
  style?: Record<string, string | number>;
}

const CloseIcon = () =>
  h(
    'svg',
    {
      class: 'h-3 w-3',
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor',
      'stroke-width': '2',
      'aria-hidden': 'true',
    },
    [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: tagCloseIconPath,
      }),
    ]
  );

export const Tag = defineComponent({
  name: 'TigerTag',
  inheritAttrs: false,
  props: {
    /**
     * Tag variant style
     * @default 'default'
     */
    variant: {
      type: String as PropType<TagVariant>,
      default: 'default' as TagVariant,
    },
    /**
     * Tag size
     * @default 'md'
     */
    size: {
      type: String as PropType<TagSize>,
      default: 'md' as TagSize,
    },
    /**
     * Whether the tag can be closed
     * @default false
     */
    closable: {
      type: Boolean,
      default: false,
    },

    /**
     * Accessible label for the close button (when `closable` is true)
     * @default 'Close tag'
     */
    closeAriaLabel: {
      type: String,
      default: 'Close tag',
    },

    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined,
    },

    /**
     * Custom styles
     */
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined,
    },
  },
  emits: ['close'],
  setup(props, { slots, emit, attrs }) {
    const isVisible = ref(true);

    const tagClasses = computed(() => {
      return classNames(
        tagBaseClasses,
        getTagVariantClasses(props.variant),
        tagSizeClasses[props.size]
      );
    });

    const closeButtonClasses = computed(() => {
      const scheme = defaultTagThemeColors[props.variant];
      return classNames(
        tagCloseButtonBaseClasses,
        scheme.closeBgHover,
        scheme.text
      );
    });

    const handleClose = (event: MouseEvent) => {
      event.stopPropagation();
      emit('close', event);

      if (!event.defaultPrevented) {
        isVisible.value = false;
      }
    };

    return () => {
      if (!isVisible.value) {
        return null;
      }

      const attrsRecord = attrs as Record<string, unknown>;
      const attrsClass = attrsRecord.class;
      const attrsStyle = attrsRecord.style;

      return h(
        'span',
        {
          ...attrs,
          class: classNames(
            tagClasses.value,
            props.className,
            attrsClass as any
          ),
          style: [attrsStyle as any, props.style as any],
          role: 'status',
        },
        [
          slots.default ? h('span', {}, slots.default()) : null,
          props.closable
            ? h(
                'button',
                {
                  class: closeButtonClasses.value,
                  onClick: handleClose,
                  'aria-label': props.closeAriaLabel,
                  type: 'button',
                },
                CloseIcon()
              )
            : null,
        ]
      );
    };
  },
});

export default Tag;
