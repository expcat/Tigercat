import { defineComponent, h, PropType, computed, inject, onBeforeUnmount, ref } from 'vue'
import {
  classNames,
  coerceClassValue,
  getLayoutContentClasses,
  injectLayoutGridStyles
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
      default: 'main'
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
    injectLayoutGridStyles()
    const layout = inject(LayoutContextKey, null)
    const rootRef = ref<HTMLElement | null>(null)

    onBeforeUnmount(() => layout?.setContentEl(null))

    const contentClasses = computed(() =>
      classNames(
        getLayoutContentClasses(props.padding),
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    return () =>
      h(
        props.as || 'main',
        {
          ...attrs,
          ref: (el: unknown) => {
            const node = el as HTMLElement | null
            rootRef.value = node
            layout?.setContentEl(node)
          },
          class: contentClasses.value,
          style: props.style
        },
        slots.default?.()
      )
  }
})

export default Content
