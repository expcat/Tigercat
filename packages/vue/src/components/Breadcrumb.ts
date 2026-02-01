import { defineComponent, computed, provide, PropType, h, type VNodeChild } from 'vue'
import {
  classNames,
  breadcrumbContainerClasses,
  type BreadcrumbSeparator
} from '@expcat/tigercat-core'

export interface VueBreadcrumbProps {
  separator?: BreadcrumbSeparator
  className?: string
  style?: Record<string, unknown>
  extra?: VNodeChild | VNodeChild[]
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
    },
    /**
     * Extra content aligned to the end of the breadcrumb
     */
    extra: {
      type: null as unknown as PropType<VNodeChild | VNodeChild[]>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const extraContent = computed<VNodeChild | VNodeChild[] | undefined>(() => {
      const slotValue = slots.extra?.()
      if (slotValue && slotValue.length > 0) {
        return slotValue
      }

      if (props.extra !== undefined && props.extra !== null) {
        return props.extra
      }

      return undefined
    })
    const extraChildren = computed(() => {
      const value = extraContent.value
      if (!value) return []

      if (Array.isArray(value)) {
        return value.filter((node) => node !== null && node !== undefined)
      }

      return [value]
    })
    const hasExtra = computed(() => extraChildren.value.length > 0)

    // Container classes
    const containerClasses = computed(() => {
      return classNames(breadcrumbContainerClasses, hasExtra.value && 'w-full', props.className)
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
        [
          h(
            'ol',
            {
              class: 'flex items-center flex-wrap gap-2'
            },
            slots.default?.()
          ),
          hasExtra.value
            ? h(
                'div',
                {
                  class: 'ml-auto flex items-center'
                },
                extraChildren.value
              )
            : null
        ]
      )
    }
  }
})

export default Breadcrumb
