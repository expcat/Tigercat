import {
  defineComponent,
  computed,
  inject,
  provide,
  reactive,
  ref,
  watch,
  Fragment,
  PropType,
  h,
  type VNode,
  type VNodeChild
} from 'vue'
import {
  classNames,
  breadcrumbContainerClasses,
  breadcrumbEllipsisClasses,
  getBreadcrumbItemClasses,
  getBreadcrumbLinkClasses,
  getBreadcrumbSeparatorClasses,
  getSeparatorContent,
  getBreadcrumbCollapsedItems,
  type BreadcrumbSeparator
} from '@expcat/tigercat-core'

export interface VueBreadcrumbProps {
  separator?: BreadcrumbSeparator
  maxItems?: number
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

export interface VueBreadcrumbItemProps {
  href?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
  current?: boolean
  separator?: BreadcrumbSeparator
  className?: string
  style?: Record<string, unknown>
  icon?: string | VNode
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
      type: [String, Object] as PropType<string | VNode>,
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
    const breadcrumbContext = inject<BreadcrumbContext>(BreadcrumbContextKey, {
      separator: '/'
    })

    const itemClasses = computed(() => {
      return getBreadcrumbItemClasses(props.className)
    })

    const linkClasses = computed(() => {
      return getBreadcrumbLinkClasses(props.current)
    })

    const separatorClasses = computed(() => {
      return getBreadcrumbSeparatorClasses()
    })

    const separatorContent = computed(() => {
      const separator =
        props.separator !== undefined ? props.separator : breadcrumbContext.separator
      return getSeparatorContent(separator)
    })

    const handleClick = (event: MouseEvent) => {
      if (!props.current) {
        emit('click', event)
      }
    }

    const computedRel = computed(() => {
      if (props.target === '_blank') {
        return 'noopener noreferrer'
      }
      return undefined
    })

    return () => {
      const children = slots.default ? slots.default() : []
      const iconElement = props.icon ? h('span', { class: 'inline-flex' }, props.icon) : null
      const contentElements = iconElement ? [iconElement, ...children] : children

      const linkElement =
        props.href && !props.current
          ? h(
              'a',
              {
                class: linkClasses.value,
                href: props.href,
                target: props.target,
                rel: computedRel.value,
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
     * Maximum number of visible items before collapsing the middle into '...'.
     * Shows the first item, the last `maxItems - 1` items, and a clickable
     * ellipsis for the rest. Ignored when `maxItems <= 0` or `>=` item count.
     */
    maxItems: {
      type: Number,
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
     * Extra content aligned to the end of the breadcrumb
     */
    extra: {
      type: null as unknown as PropType<VNodeChild | VNodeChild[]>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const expanded = ref(false)

    const extraContent = computed(() => {
      const slotValue = slots.extra?.()
      if (slotValue && slotValue.length > 0) return slotValue
      if (props.extra != null) return props.extra
      return null
    })

    // Container classes
    const containerClasses = computed(() => {
      return classNames(breadcrumbContainerClasses, extraContent.value && 'w-full', props.className)
    })

    // Provide a reactive context so child items follow dynamic `separator` changes
    const breadcrumbContext = reactive<BreadcrumbContext>({
      separator: props.separator
    })
    watch(
      () => props.separator,
      (separator) => {
        breadcrumbContext.separator = separator
      }
    )
    provide(BreadcrumbContextKey, breadcrumbContext)

    const renderItems = (): VNodeChild[] => {
      const rawChildren = (slots.default?.() || []) as VNode[]

      // Flatten Fragment VNodes (produced by v-for) into a flat list
      const items: VNode[] = []
      const flatten = (vnodes: VNode[]) => {
        for (const vnode of vnodes) {
          if (vnode.type === Fragment && Array.isArray(vnode.children)) {
            flatten(vnode.children as VNode[])
          } else {
            items.push(vnode)
          }
        }
      }
      flatten(rawChildren)

      const maxItems = props.maxItems
      if (expanded.value || maxItems === undefined || maxItems <= 0 || maxItems >= items.length) {
        return items
      }

      const { collapsed } = getBreadcrumbCollapsedItems(items.length, maxItems)
      if (collapsed.length === 0) return items

      const collapsedSet = new Set(collapsed)
      const result: VNodeChild[] = []
      let ellipsisInserted = false
      items.forEach((item, index) => {
        if (collapsedSet.has(index)) {
          if (!ellipsisInserted) {
            ellipsisInserted = true
            result.push(
              h('li', { key: '__tiger-breadcrumb-ellipsis', class: getBreadcrumbItemClasses() }, [
                h(
                  'button',
                  {
                    type: 'button',
                    class: breadcrumbEllipsisClasses,
                    'aria-label': 'Show collapsed breadcrumb items',
                    onClick: () => {
                      expanded.value = true
                    }
                  },
                  '...'
                ),
                h(
                  'span',
                  { class: getBreadcrumbSeparatorClasses(), 'aria-hidden': 'true' },
                  getSeparatorContent(props.separator)
                )
              ])
            )
          }
          return
        }
        result.push(item)
      })
      return result
    }

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
            renderItems()
          ),
          extraContent.value
            ? h(
                'div',
                {
                  class: 'ml-auto flex items-center'
                },
                extraContent.value
              )
            : null
        ]
      )
    }
  }
})

export default Breadcrumb
