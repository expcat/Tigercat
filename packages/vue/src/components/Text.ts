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
  type TextColor,
} from '@tigercat/core'

export const Text = defineComponent({
  name: 'TigerText',
  props: {
    tag: {
      type: String as PropType<TextTag>,
      default: 'p',
    },
    size: {
      type: String as PropType<TextSize>,
      default: 'base',
    },
    weight: {
      type: String as PropType<TextWeight>,
      default: 'normal',
    },
    align: {
      type: String as PropType<TextAlign>,
      default: undefined,
    },
    color: {
      type: String as PropType<TextColor>,
      default: 'default',
    },
    truncate: {
      type: Boolean,
      default: false,
    },
    italic: {
      type: Boolean,
      default: false,
    },
    underline: {
      type: Boolean,
      default: false,
    },
    lineThrough: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
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
          class: textClasses.value,
        },
        slots.default?.()
      )
    }
  },
})

export default Text
