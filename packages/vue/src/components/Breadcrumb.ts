import { defineComponent, computed, provide, PropType, h } from 'vue'
import { classNames, breadcrumbContainerClasses, type BreadcrumbSeparator } from '@expcat/tigercat-core'

export interface VueBreadcrumbProps {
  separator?: BreadcrumbSeparator
  className?: string
  style?: Record<string, unknown>
}

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
      default: '/' as BreadcrumbSeparator
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined
    },
    /**
     * Inline styles
     */
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    // Container classes
    const containerClasses = computed(() => {
      return classNames(breadcrumbContainerClasses, props.className)
    })

    // Provide breadcrumb context to child components
    provide<BreadcrumbContext>(BreadcrumbContextKey, {
      separator: props.separator
    })

    return () => {
      return h(
        'nav',
        {
          'aria-label': 'Breadcrumb',
          ...attrs,
          class: [containerClasses.value, attrs.class],
          style: [props.style, attrs.style]
        },
        h(
          'ol',
          {
            class: 'flex items-center flex-wrap gap-2'
          },
          slots.default?.()
        )
      )
    }
  }
})

export default Breadcrumb
