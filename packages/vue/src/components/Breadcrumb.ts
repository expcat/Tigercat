import {
  defineComponent,
  computed,
  inject,
  provide,
  reactive,
  ref,
  watch,
  PropType,
  h,
  type VNode,
  type VNodeChild
} from 'vue'
import { icon20ViewBox } from '@expcat/tigercat-core/icons/picker'
import {
  classNames,
  resolveLinkAddress,
  coerceClassValue,
  mergeStyleValues,
  breadcrumbContainerClasses,
  breadcrumbEllipsisClasses,
  breadcrumbExtraClasses,
  breadcrumbListClasses,
  getBreadcrumbItemClasses,
  getBreadcrumbLinkClasses,
  getBreadcrumbSeparatorClasses,
  getBreadcrumbSlots,
  getBreadcrumbCollapsedItems,
  breadcrumbCollapsedMenuItems,
  resolveLinkHref,
  getSeparatorKind,
  getSeparatorContent,
  resolveBreadcrumbItemCurrent,
  mergeTigerLocale,
  getBreadcrumbLabels,
  type BreadcrumbSeparator,
  type TigerLocale,
  type TigerLocaleBreadcrumb
} from '@expcat/tigercat-core'
import { chevronLeftSolidIcon20PathD } from '@expcat/tigercat-core/icons/picker'
import { flattenElementVNodes } from '../utils/flatten-vnodes'
import { useTigerConfig } from './ConfigProvider'

export const BreadcrumbContextKey = Symbol('BreadcrumbContext')

export interface BreadcrumbContext {
  separator: BreadcrumbSeparator
}

export function useBreadcrumbContext(): BreadcrumbContext | undefined {
  return inject<BreadcrumbContext>(BreadcrumbContextKey)
}

export interface VueBreadcrumbProps {
  separator?: BreadcrumbSeparator
  maxItems?: number
  className?: string
  style?: Record<string, unknown>
  extra?: VNodeChild | VNodeChild[]
}

export type BreadcrumbProps = VueBreadcrumbProps

export interface VueBreadcrumbItemProps {
  href?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
  current?: boolean
  separator?: BreadcrumbSeparator
  className?: string
  style?: Record<string, unknown>
  icon?: string | VNode
}

export type BreadcrumbItemProps = VueBreadcrumbItemProps

function renderSeparator(separator: BreadcrumbSeparator) {
  const kind = getSeparatorKind(separator)
  const classes = getBreadcrumbSeparatorClasses()
  if (kind === 'arrow' || kind === 'chevron') {
    return h('span', { class: classes, 'aria-hidden': 'true' }, [
      h(
        'svg',
        {
          class: `h-3.5 w-3.5 ${kind === 'arrow' ? '-scale-x-100 rtl:scale-x-100' : 'rtl:-scale-x-100'}`,
          viewBox: icon20ViewBox,
          fill: 'currentColor'
        },
        h('path', {
          'fill-rule': 'evenodd',
          d: chevronLeftSolidIcon20PathD,
          'clip-rule': 'evenodd'
        })
      )
    ])
  }
  return h('span', { class: classes, 'aria-hidden': 'true' }, getSeparatorContent(separator))
}

export const BreadcrumbItem = defineComponent({
  name: 'TigerBreadcrumbItem',
  inheritAttrs: false,
  props: {
    href: { type: String, default: undefined },
    target: {
      type: String as PropType<'_blank' | '_self' | '_parent' | '_top'>,
      default: undefined
    },
    current: { type: Boolean, default: undefined },
    separator: { type: String as PropType<BreadcrumbSeparator>, default: undefined },
    className: { type: String, default: undefined },
    style: { type: Object as PropType<Record<string, unknown>>, default: undefined },
    icon: { type: [String, Object] as PropType<string | VNode>, default: undefined },
    isLast: { type: Boolean, default: false }
  },
  emits: {
    click: (event: MouseEvent) => event instanceof MouseEvent
  },
  setup(props, { slots, emit, attrs }) {
    const isCurrent = computed(() => resolveBreadcrumbItemCurrent(props.current, props.isLast))
    const hasHandler = typeof (attrs as { onClick?: unknown }).onClick === 'function'

    const handleClick = (event: MouseEvent) => {
      if (!isCurrent.value) emit('click', event)
    }

    return () => {
      const children = slots.default ? slots.default() : []
      const iconElement = props.icon ? h('span', { class: 'inline-flex' }, props.icon) : null
      const contentElements = iconElement ? [iconElement, ...children] : children
      const linkClasses = getBreadcrumbLinkClasses(isCurrent.value)
      const address = resolveLinkAddress({ href: props.href, target: props.target })
      let control: VNode
      if (isCurrent.value) {
        control = h('span', { class: linkClasses, 'aria-current': 'page' }, contentElements)
      } else if (address.href) {
        control = h(
          'a',
          {
            class: linkClasses,
            href: address.href,
            target: address.target,
            rel: address.rel,
            onClick: handleClick
          },
          contentElements
        )
      } else if (hasHandler) {
        control = h(
          'button',
          { type: 'button', class: linkClasses, onClick: handleClick },
          contentElements
        )
      } else {
        control = h('span', { class: getBreadcrumbLinkClasses(true) }, contentElements)
      }

      const {
        class: attrClass,
        style: attrStyle,
        onClick: _onClick,
        ...rest
      } = attrs as Record<string, unknown>

      return h(
        'li',
        {
          ...rest,
          class: classNames(getBreadcrumbItemClasses(props.className), coerceClassValue(attrClass)),
          style: mergeStyleValues(attrStyle, props.style)
        },
        [control]
      )
    }
  }
})

export const Breadcrumb = defineComponent({
  name: 'TigerBreadcrumb',
  inheritAttrs: false,
  props: {
    separator: {
      type: String as PropType<BreadcrumbSeparator>,
      default: '/' as BreadcrumbSeparator
    },
    maxItems: { type: Number, default: undefined },
    className: { type: String, default: undefined },
    style: { type: Object as PropType<Record<string, unknown>>, default: undefined },
    extra: {
      type: null as unknown as PropType<VNodeChild | VNodeChild[]>,
      default: undefined
    },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    labels: { type: Object as PropType<Partial<TigerLocaleBreadcrumb>>, default: undefined }
  },
  setup(props, { slots, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getBreadcrumbLabels(mergedLocale.value, props.labels))
    const expanded = ref(false)
    const itemSignature = ref('')

    const extraContent = computed(() => {
      const slotValue = slots.extra?.()
      if (slotValue && slotValue.length > 0) return slotValue
      if (props.extra != null) return props.extra
      return null
    })

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

    watch(
      () => [itemSignature.value, props.maxItems] as const,
      () => {
        expanded.value = false
      }
    )

    return () => {
      const items = flattenElementVNodes(slots.default?.() as VNode[] | undefined)
      itemSignature.value = items.map((item) => String(item.key ?? '')).join('|')
      const slotsList = getBreadcrumbSlots(items.length, props.maxItems, false)
      const collapsed = getBreadcrumbCollapsedItems(items.length, props.maxItems ?? items.length).collapsed
      const nodes: VNodeChild[] = []

      slotsList.forEach((slot, index) => {
        if (slot.type === 'ellipsis') {
          nodes.push(
            h('li', { key: '__tiger-breadcrumb-ellipsis', class: getBreadcrumbItemClasses() }, [
              h(
                'button',
                {
                  type: 'button',
                  class: breadcrumbEllipsisClasses,
                  'aria-label': labels.value.expandAriaLabel,
                  'aria-expanded': expanded.value,
                  'aria-haspopup': 'menu',
                  onClick: () => {
                    expanded.value = !expanded.value
                  }
                },
                '...'
              ),
              expanded.value
                ? h(
                    'div',
                    { role: 'menu', 'data-tiger-breadcrumb-menu': '' },
                    breadcrumbCollapsedMenuItems(
                      collapsed.map((itemIndex) => {
                        const child = items[itemIndex]
                        const propsRecord = (child?.props ?? {}) as Record<string, unknown>
                        const href = typeof propsRecord.href === 'string' ? propsRecord.href : undefined
                        const rawChildren = child?.children
                        const slotFn =
                          typeof rawChildren === 'function'
                            ? rawChildren
                            : rawChildren &&
                                typeof rawChildren === 'object' &&
                                'default' in rawChildren &&
                                typeof (rawChildren as { default?: unknown }).default === 'function'
                              ? (rawChildren as { default: () => unknown }).default
                              : null
                        const rendered = slotFn ? slotFn() : rawChildren
                        const text =
                          typeof rendered === 'string'
                            ? rendered
                            : Array.isArray(rendered)
                              ? rendered.filter((part) => typeof part === 'string').join('')
                              : ''
                        return {
                          key: itemIndex,
                          label: text || String(propsRecord.label ?? href ?? itemIndex),
                          href
                        }
                      })
                    ).map((entry) =>
                      h(
                        'a',
                        {
                          role: 'menuitem',
                          href: resolveLinkHref(entry.href),
                          key: entry.key
                        },
                        entry.label
                      )
                    )
                  )
                : null
            ])
          )
        } else {
          const child = items[slot.index]
          const isLast = slot.index === items.length - 1
          const childProps = (child.props ?? {}) as Record<string, unknown>
          const childType =
            typeof child.type === 'string' || typeof child.type === 'object' ? child.type : 'li'
          nodes.push(
            h(
              childType as string,
              {
                ...childProps,
                key: child.key ?? slot.index,
                isLast
              },
              child.children as VNode[] | undefined
            )
          )
        }
        if (index !== slotsList.length - 1) {
          nodes.push(
            h(
              'li',
              { key: `sep-${index}`, class: getBreadcrumbItemClasses(), 'aria-hidden': 'true' },
              [renderSeparator(props.separator)]
            )
          )
        }
      })

      const attrsRecord = attrs as Record<string, unknown>
      const ariaLabel = (attrsRecord['aria-label'] as string | undefined) ?? labels.value.ariaLabel
      const hasExtra = Boolean(extraContent.value)
      const rootClass = classNames(
        breadcrumbContainerClasses,
        hasExtra && 'w-full',
        props.className,
        coerceClassValue(attrsRecord.class)
      )
      const nav = h(
        'nav',
        {
          'aria-label': ariaLabel,
          class: hasExtra ? undefined : rootClass,
          style: hasExtra ? undefined : mergeStyleValues(attrsRecord.style, props.style)
        },
        [
          h(
            'ol',
            {
              class: hasExtra ? breadcrumbListClasses : classNames(breadcrumbListClasses, 'w-full')
            },
            nodes
          )
        ]
      )

      if (!hasExtra) return nav
      return h(
        'div',
        { class: rootClass, style: mergeStyleValues(attrsRecord.style, props.style) },
        [nav, h('div', { class: breadcrumbExtraClasses }, extraContent.value ?? undefined)]
      )
    }
  }
})
