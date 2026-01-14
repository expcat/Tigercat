import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  textSizeClasses,
  textWeightClasses,
  textAlignClasses,
  textColorClasses,
  textDecorationClasses,
  type TextTag,
  type TextSize,
  type TextWeight,
  type TextAlign,
  type TextColor
} from '@tigercat/core'

export interface VueTextProps {
  tag?: TextTag
  size?: TextSize
  weight?: TextWeight
  align?: TextAlign
  color?: TextColor
  truncate?: boolean
  italic?: boolean
  underline?: boolean
  lineThrough?: boolean
}

export const Text = defineComponent({
  name: 'TigerText',
  props: {
    /**
     * HTML tag to render
     * @default 'p'
     */
    tag: {
      type: String as PropType<TextTag>,
      default: 'p' as TextTag
    },
    /**
     * Text size
     * @default 'base'
     */
    size: {
      type: String as PropType<TextSize>,
      default: 'base' as TextSize
    },
    /**
     * Font weight
     * @default 'normal'
     */
    weight: {
      type: String as PropType<TextWeight>,
      default: 'normal' as TextWeight
    },
    /**
     * Text alignment
     */
    align: {
      type: String as PropType<TextAlign>
    },
    /**
     * Text color
     * @default 'default'
     */
    color: {
      type: String as PropType<TextColor>,
      default: 'default' as TextColor
    },
    /**
     * Truncate text with ellipsis
     * @default false
     */
    truncate: {
      type: Boolean,
      default: false
    },
    /**
     * Italic text style
     * @default false
     */
    italic: {
      type: Boolean,
      default: false
    },
    /**
     * Underline text decoration
     * @default false
     */
    underline: {
      type: Boolean,
      default: false
    },
    /**
     * Line-through text decoration
     * @default false
     */
    lineThrough: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots, attrs }) {
    const textClasses = computed(() => {
      return classNames(
        textSizeClasses[props.size],
        textWeightClasses[props.weight],
        props.align && textAlignClasses[props.align],
        textColorClasses[props.color],
        props.truncate && textDecorationClasses.truncate,
        props.italic && textDecorationClasses.italic,
        props.underline && textDecorationClasses.underline,
        props.lineThrough && textDecorationClasses.lineThrough
      )
    })

    return () => {
      return h(
        props.tag,
        {
          ...attrs,
          class: [textClasses.value, attrs.class],
          style: attrs.style
        },
        slots.default?.()
      )
    }
  }
})

export default Text
