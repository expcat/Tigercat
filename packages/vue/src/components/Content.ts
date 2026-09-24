import { defineComponent, h, PropType, computed, inject } from 'vue'
import {
  classNames,
  coerceClassValue,
  getLayoutContentClasses,
  resolveLayoutSectionTag
} from '@expcat/tigercat-core'
import { LayoutContextKey } from '../utils/layout-context'

export interface VueContentProps {
  className?: string
  as?: string
  padding?: boolean | string
  style?: Record<string, string | number>
}

export const Content = defineComponent({
  name: 'TigerContent',
  inheritAttrs: false,
  props: {
    className: {
      type: String as PropType<string>,
      default: undefined
    },
    as: {
      type: String as PropType<string>,
      default: undefined
    },
    padding: {
      type: [Boolean, String] as PropType<boolean | string>,
      default: true
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const layout = inject(LayoutContextKey, null)

    const contentClasses = computed(() =>
      classNames(
        getLayoutContentClasses(props.padding),
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    return () =>
      h(
        resolveLayoutSectionTag({
          kind: 'content',
          nested: Boolean(layout?.nested.value),
          explicit: props.as
        }),
        {
          ...attrs,
          class: contentClasses.value,
          style: props.style
        },
        slots.default?.()
      )
  }
})

export default Content
