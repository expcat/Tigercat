import { defineComponent, computed, h, PropType } from 'vue'
import {
  getTextClasses,
  resolveTextTag,
  type TextProps,
  type TextTag,
  type TextSize,
  type TextWeight,
  type TextAlign,
  type TextColor
} from '@expcat/tigercat-core'

export type VueTextProps = TextProps

export const Text = defineComponent({
  name: 'TigerText',
  inheritAttrs: false,
  props: {
    /**
     * HTML tag to render. Only the TextTag whitelist is allowed.
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
     * Logical text alignment (`start` / `center` / `end` / `justify`)
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
    const textClasses = computed(() => getTextClasses(props))
    const resolvedTag = computed(() => resolveTextTag(props.tag))

    return () =>
      h(resolvedTag.value, { ...attrs, class: [textClasses.value, attrs.class] }, slots.default?.())
  }
})

export default Text
