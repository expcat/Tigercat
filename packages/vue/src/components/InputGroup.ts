import { defineComponent, h, PropType, provide, inject, computed } from 'vue'
import {
  classNames,
  coerceClassValue,
  getInputGroupClasses,
  getInputGroupAddonClasses,
  type InputGroupSize
} from '@expcat/tigercat-core'

export const INPUT_GROUP_INJECTION_KEY = Symbol('TigerInputGroup')

export interface InputGroupContext {
  size?: InputGroupSize
  compact?: boolean
}

export interface VueInputGroupProps {
  size?: InputGroupSize
  compact?: boolean
  className?: string
}

export interface VueInputGroupAddonProps {
  type?: 'text' | 'icon'
  className?: string
}

export const InputGroup = defineComponent({
  name: 'TigerInputGroup',
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<InputGroupSize>,
      default: 'md'
    },
    compact: {
      type: Boolean,
      default: false
    },
    className: {
      type: String,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    provide<InputGroupContext>(INPUT_GROUP_INJECTION_KEY, {
      get size() {
        return props.size
      },
      get compact() {
        return props.compact
      }
    })

    const classes = computed(() =>
      classNames(
        getInputGroupClasses(props.compact, props.className),
        coerceClassValue(attrs.class)
      )
    )

    return () =>
      h(
        'div',
        {
          ...attrs,
          class: classes.value,
          role: 'group'
        },
        slots.default?.()
      )
  }
})

export const InputGroupAddon = defineComponent({
  name: 'TigerInputGroupAddon',
  inheritAttrs: false,
  props: {
    type: {
      type: String as PropType<'text' | 'icon'>,
      default: 'text'
    },
    className: {
      type: String,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const ctx = inject<InputGroupContext | null>(INPUT_GROUP_INJECTION_KEY, null)

    return () => {
      const size = ctx?.size ?? 'md'
      const compact = ctx?.compact ?? true

      return h(
        'span',
        {
          ...attrs,
          class: classNames(
            getInputGroupAddonClasses(size, compact, props.className),
            coerceClassValue(attrs.class)
          )
        },
        slots.default?.()
      )
    }
  }
})

export default InputGroup
