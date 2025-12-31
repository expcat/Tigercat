import { defineComponent, computed, provide, PropType, h } from 'vue'
import {
  classNames,
  breadcrumbContainerClasses,
  type BreadcrumbSeparator,
} from '@tigercat/core'

// Breadcrumb context key
export const BreadcrumbContextKey = Symbol('BreadcrumbContext')

// Breadcrumb context interface
export interface BreadcrumbContext {
  separator: BreadcrumbSeparator
}

export const Breadcrumb = defineComponent({
  name: 'TigerBreadcrumb',
  props: {
    /**
     * Custom separator between breadcrumb items
     * @default '/'
     */
    separator: {
      type: String as PropType<BreadcrumbSeparator>,
      default: '/' as BreadcrumbSeparator,
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    // Container classes
    const containerClasses = computed(() => {
      return classNames(
        breadcrumbContainerClasses,
        props.className
      )
    })

    // Provide breadcrumb context to child components
    provide<BreadcrumbContext>(BreadcrumbContextKey, {
      separator: props.separator,
    })

    return () => {
      return h(
        'nav',
        {
          class: containerClasses.value,
          'aria-label': 'Breadcrumb',
          ...attrs,
        },
        h(
          'ol',
          {
            class: 'flex items-center flex-wrap gap-2',
          },
          slots.default?.()
        )
      )
    }
  },
})

export default Breadcrumb
