import { defineComponent, computed, inject, PropType, h } from 'vue'
import {
  getBreadcrumbItemClasses,
  getBreadcrumbLinkClasses,
  getBreadcrumbSeparatorClasses,
  getSeparatorContent,
  type BreadcrumbSeparator
} from '@tigercat/core'
import { BreadcrumbContextKey, type BreadcrumbContext } from './Breadcrumb'

export interface VueBreadcrumbItemProps {
  href?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
  current?: boolean
  separator?: BreadcrumbSeparator
  className?: string
  style?: Record<string, unknown>
  icon?: unknown
}

export const BreadcrumbItem = defineComponent({
  name: 'TigerBreadcrumbItem',
  props: {
    /**
     * Navigation link URL
     */
    href: {
      type: String,
      default: undefined
    },
    /**
     * Link target attribute
     */
    target: {
      type: String as PropType<'_blank' | '_self' | '_parent' | '_top'>,
      default: undefined
    },
    /**
     * Whether this is the current/last item
     * @default false
     */
    current: {
      type: Boolean,
      default: false
    },
    /**
     * Custom separator for this item (overrides global separator)
     */
    separator: {
      type: String as PropType<BreadcrumbSeparator>,
      default: undefined
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
     * Icon to display before the item content
     */
    icon: {
      type: [String, Object] as PropType<unknown>,
      default: undefined
    }
  },
  emits: {
    /**
     * Emitted when breadcrumb item is clicked
     */
    click: (event: MouseEvent) => event instanceof MouseEvent
  },
  setup(props, { slots, emit, attrs }) {
    // Inject breadcrumb context
    const breadcrumbContext = inject<BreadcrumbContext>(BreadcrumbContextKey, {
      separator: '/'
    })

    // Item classes
    const itemClasses = computed(() => {
      return getBreadcrumbItemClasses(props.current, props.className)
    })

    // Link classes
    const linkClasses = computed(() => {
      return getBreadcrumbLinkClasses(props.current)
    })

    // Separator classes
    const separatorClasses = computed(() => {
      return getBreadcrumbSeparatorClasses()
    })

    // Get separator content
    const separatorContent = computed(() => {
      const sep = props.separator !== undefined ? props.separator : breadcrumbContext.separator
      return getSeparatorContent(sep)
    })

    // Handle click
    const handleClick = (event: MouseEvent) => {
      if (!props.current) {
        emit('click', event)
      }
    }

    // Compute rel attribute for external links
    const computedRel = computed(() => {
      if (props.target === '_blank') {
        return 'noopener noreferrer'
      }
      return undefined
    })

    return () => {
      const children = slots.default ? slots.default() : []

      // Icon rendering (if provided)
      const iconElement = props.icon ? h('span', { class: 'inline-flex' }, props.icon) : null

      // Content wrapper
      const contentElements = iconElement ? [iconElement, ...children] : children

      // Link or span element
      const linkElement =
        props.href && !props.current
          ? h(
              'a',
              {
                class: linkClasses.value,
                href: props.href,
                target: props.target,
                rel: computedRel.value,
                'aria-current': props.current ? 'page' : undefined,
                onClick: handleClick
              },
              contentElements
            )
          : h(
              'span',
              {
                class: linkClasses.value,
                'aria-current': props.current ? 'page' : undefined
              },
              contentElements
            )

      // Separator element (not rendered for current/last item)
      const separatorElement = !props.current
        ? h(
            'span',
            {
              class: separatorClasses.value,
              'aria-hidden': 'true'
            },
            separatorContent.value
          )
        : null

      return h(
        'li',
        {
          ...attrs,
          class: [itemClasses.value, attrs.class],
          style: [props.style, attrs.style]
        },
        [linkElement, separatorElement]
      )
    }
  }
})

export default BreadcrumbItem
