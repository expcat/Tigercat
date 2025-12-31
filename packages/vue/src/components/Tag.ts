import { defineComponent, computed, h, PropType } from 'vue'
import { 
  classNames, 
  getTagVariantClasses, 
  defaultTagThemeColors, 
  tagBaseClasses,
  tagSizeClasses,
  tagCloseButtonBaseClasses,
  tagCloseIconPath,
  type TagVariant, 
  type TagSize 
} from '@tigercat/core'

const CloseIcon = h(
  'svg',
  {
    class: 'h-3 w-3',
    xmlns: 'http://www.w3.org/2000/svg',
    fill: 'none',
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    'stroke-width': '2',
  },
  [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: tagCloseIconPath,
    }),
  ]
)

export const Tag = defineComponent({
  name: 'TigerTag',
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
  },
  emits: ['close'],
  setup(props, { slots, emit }) {
    const tagClasses = computed(() => {
      return classNames(
        tagBaseClasses,
        getTagVariantClasses(props.variant),
        tagSizeClasses[props.size]
      )
    })

    const closeButtonClasses = computed(() => {
      const scheme = defaultTagThemeColors[props.variant]
      return classNames(
        tagCloseButtonBaseClasses,
        scheme.closeBgHover,
        scheme.text
      )
    })

    const handleClose = (event: MouseEvent) => {
      event.stopPropagation()
      emit('close', event)
    }

    return () => {
      const children = []
      
      // Add tag content
      if (slots.default) {
        children.push(h('span', {}, slots.default()))
      }

      // Add close button if closable
      if (props.closable) {
        children.push(
          h(
            'button',
            {
              class: closeButtonClasses.value,
              onClick: handleClose,
              'aria-label': 'Close tag',
              type: 'button',
            },
            CloseIcon
          )
        )
      }

      return h(
        'span',
        {
          class: tagClasses.value,
          role: 'status',
        },
        children
      )
    }
  },
})

export default Tag
