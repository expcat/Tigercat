import { defineComponent, h, PropType, provide, inject, computed } from 'vue'
import {
  classNames,
  coerceClassValue,
  getInputGroupClasses,
  getInputGroupAddonClasses,
  TIGER_CHROME_ATTR,
  type ComponentSize
} from '@expcat/tigercat-core'

export const INPUT_GROUP_INJECTION_KEY = Symbol('TigerInputGroup')

export interface InputGroupContext {
  size?: ComponentSize
  compact?: boolean
}

export interface VueInputGroupProps {
  size?: ComponentSize
  compact?: boolean
  className?: string
}

export interface VueInputGroupAddonProps {
  className?: string
}

export const InputGroup = defineComponent({
  name: 'TigerInputGroup',
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<ComponentSize>,
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

    return () => {
      const named = Boolean(attrs['aria-label'] || attrs['aria-labelledby'])
      return h(
        'div',
        {
          ...attrs,
          class: classes.value,
          role: named ? 'group' : undefined
        },
        slots.default?.()
      )
    }
  }
})

export const InputGroupAddon = defineComponent({
  name: 'TigerInputGroupAddon',
  inheritAttrs: false,
  props: {
    className: {
      type: String,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const ctx = inject<InputGroupContext | null>(INPUT_GROUP_INJECTION_KEY, null)

    return () => {
      const size = ctx?.size ?? 'md'
      const compact = ctx?.compact ?? false

      return h(
        'span',
        {
          ...attrs,
          [TIGER_CHROME_ATTR]: '',
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
