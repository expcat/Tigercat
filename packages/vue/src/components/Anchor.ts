import {
  defineComponent,
  h,
  ref,
  computed,
  provide,
  inject,
  onMounted,
  onBeforeUnmount,
  onUpdated,
  watch,
  nextTick,
  PropType,
  reactive
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  mergeTigerLocale,
  getAnchorLabels,
  getAnchorWrapperClasses,
  getAnchorInkContainerClasses,
  getAnchorInkActiveClasses,
  getAnchorLinkClasses,
  getAnchorLinkListClasses,
  anchorNestedListClasses,
  createAnchorObserver,
  createProgrammaticScrollLock,
  findAnchorLinkElement,
  getAnchorInkStyle,
  getAnchorTargetElement,
  replaceAnchorHash,
  resolveActiveAnchorHref,
  resolveAnchorScrollContainer,
  resolveScrollRoot,
  scrollToAnchor,
  shouldHandleAnchorClick,
  sortAnchorHrefsByDocumentOrder,
  type AnchorDirection,
  type ScrollRootInput,
  type TigerLocale,
  type TigerLocaleAnchor
} from '@expcat/tigercat-core'
import { Affix } from './Affix'
import { useTigerConfig } from './ConfigProvider'

export const AnchorContextKey = Symbol('AnchorContext')

export interface AnchorContext {
  activeLink: string
  direction: AnchorDirection
  registerLink: (href: string, node: Element) => void
  unregisterLink: (href: string, node: Element) => void
  handleLinkClick: (href: string, event: Event, targetAttr?: string) => void
  scrollTo: (href: string) => void
}

export interface VueAnchorProps {
  affix?: boolean
  bounds?: number
  offsetTop?: number
  showInkInFixed?: boolean
  targetOffset?: number
  getCurrentAnchor?: (activeLink: string) => string
  getContainer?: ScrollRootInput
  direction?: AnchorDirection
  className?: string
  style?: Record<string, unknown>
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleAnchor>
}

export type AnchorProps = VueAnchorProps

export interface VueAnchorLinkProps {
  href: string
  title?: string
  target?: string
  className?: string
}

export type AnchorLinkProps = VueAnchorLinkProps

export const AnchorLink = defineComponent({
  name: 'TigerAnchorLink',
  inheritAttrs: false,
  props: {
    href: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: undefined
    },
    target: {
      type: String,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const anchorContext = inject<AnchorContext | null>(AnchorContextKey, null)
    const linkRef = ref<HTMLElement | null>(null)

    const register = () => {
      if (linkRef.value) anchorContext?.registerLink(props.href, linkRef.value)
    }

    onMounted(() => {
      register()
    })

    watch(
      () => props.href,
      (_next, prev) => {
        if (linkRef.value && prev) anchorContext?.unregisterLink(prev, linkRef.value)
        register()
      }
    )

    onBeforeUnmount(() => {
      if (linkRef.value) anchorContext?.unregisterLink(props.href, linkRef.value)
    })

    const handleClick = (event: Event) => {
      const userClick = (attrs as { onClick?: (event: Event) => void }).onClick
      userClick?.(event)
      if (!anchorContext) return
      anchorContext.handleLinkClick(props.href, event, props.target)
    }

    const linkClasses = computed(() => {
      const isActive = anchorContext?.activeLink === props.href
      return classNames(
        getAnchorLinkClasses(Boolean(isActive), props.className),
        coerceClassValue(attrs.class)
      )
    })

    return () => {
      const slotContent = slots.default?.()
      const nested = props.title != null && Boolean(slotContent?.length)
      const isActive = anchorContext?.activeLink === props.href
      const link = h(
        'a',
        {
          ...attrs,
          ref: linkRef,
          href: props.href,
          target: props.target,
          class: linkClasses.value,
          'data-anchor-href': props.href,
          'aria-current': isActive ? 'location' : undefined,
          onClick: handleClick
        },
        nested ? props.title : (slotContent ?? props.title)
      )

      if (!anchorContext) return link

      return h('li', [
        link,
        nested ? h('ul', { class: anchorNestedListClasses }, slotContent) : null
      ])
    }
  }
})

export const Anchor = defineComponent({
  name: 'TigerAnchor',
  inheritAttrs: false,
  props: {
    affix: {
      type: Boolean,
      default: true
    },
    bounds: {
      type: Number,
      default: 5
    },
    offsetTop: {
      type: Number,
      default: 0
    },
    showInkInFixed: {
      type: Boolean,
      default: true
    },
    targetOffset: {
      type: Number,
      default: undefined
    },
    getCurrentAnchor: {
      type: Function as PropType<(activeLink: string) => string>,
      default: undefined
    },
    getContainer: {
      type: [String, Object, Function] as PropType<ScrollRootInput>,
      default: undefined
    },
    direction: {
      type: String as PropType<AnchorDirection>,
      default: 'vertical'
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    labels: {
      type: Object as PropType<Partial<TigerLocaleAnchor>>,
      default: undefined
    }
  },
  emits: ['click', 'change'],
  setup(props, { slots, emit, attrs, expose }) {
    const activeLink = ref('')
    const linkEntries = ref<Array<{ href: string; node: Element }>>([])
    const anchorRef = ref<HTMLElement | null>(null)
    const inkRef = ref<HTMLElement | null>(null)
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labelSet = computed(() => getAnchorLabels(mergedLocale.value, props.labels))

    const scrollLock = createProgrammaticScrollLock(() =>
      resolveAnchorScrollContainer(props.getContainer)
    )
    const scrollOffset = computed(() => props.targetOffset ?? props.offsetTop)
    const links = computed(() => sortAnchorHrefsByDocumentOrder(linkEntries.value))

    const registerLink = (href: string, node: Element) => {
      const existing = linkEntries.value.find((entry) => entry.node === node)
      if (existing) {
        existing.href = href
        linkEntries.value = [...linkEntries.value]
        return
      }
      linkEntries.value = [...linkEntries.value, { href, node }]
    }

    const unregisterLink = (href: string, node: Element) => {
      linkEntries.value = linkEntries.value.filter(
        (entry) => entry.node !== node || entry.href !== href
      )
    }

    const applyActive = (href: string): string => {
      const finalHref = resolveActiveAnchorHref(href, props.getCurrentAnchor)
      if (finalHref !== activeLink.value) {
        activeLink.value = finalHref
        emit('change', finalHref)
      }
      return finalHref
    }

    let stopObserver: (() => void) | null = null

    const setupObserver = () => {
      stopObserver?.()
      const container = resolveAnchorScrollContainer(props.getContainer)
      const root = container === window ? null : (container as Element)
      stopObserver = createAnchorObserver(links.value, {
        offsetTop: scrollOffset.value,
        bounds: props.bounds,
        root,
        onChange: (newActiveLink) => {
          if (scrollLock.isLocked()) return
          applyActive(newActiveLink)
        }
      })
    }

    const scrollTo = (href: string) => {
      scrollToAnchor(href, resolveAnchorScrollContainer(props.getContainer), scrollOffset.value)
    }

    const handleLinkClick = (href: string, event: Event, targetAttr?: string) => {
      const hasTargetElement = Boolean(getAnchorTargetElement(href))
      if (
        !shouldHandleAnchorClick(event as MouseEvent, {
          target: targetAttr,
          hasTargetElement
        })
      ) {
        emit('click', event, href)
        return
      }
      event.preventDefault()
      emit('click', event, href)
      const finalHref = applyActive(href)
      scrollLock.lock()
      scrollTo(finalHref)
      replaceAnchorHash(finalHref)
    }

    const updateInkPosition = () => {
      if (!inkRef.value || !anchorRef.value || !activeLink.value) return
      const activeLinkElement = findAnchorLinkElement(anchorRef.value, activeLink.value)
      if (!activeLinkElement) return
      const next = getAnchorInkStyle(
        props.direction,
        activeLinkElement.getBoundingClientRect(),
        anchorRef.value.getBoundingClientRect()
      )
      inkRef.value.style.top = next.top
      inkRef.value.style.height = next.height
      inkRef.value.style.insetInlineStart = next.insetInlineStart
      inkRef.value.style.width = next.width
    }

    const resolvedKey = computed(() => {
      const resolved = resolveScrollRoot(props.getContainer)
      return resolved.isWindow ? 'window' : resolved.target
    })

    watch(activeLink, () => {
      nextTick(updateInkPosition)
    })
    watch(() => props.direction, updateInkPosition)
    watch([links, scrollOffset, resolvedKey, () => props.bounds], () => {
      nextTick(() => setupObserver())
    })

    onMounted(() => {
      nextTick(() => {
        setupObserver()
        updateInkPosition()
      })
    })

    onUpdated(() => {
      updateInkPosition()
    })

    onBeforeUnmount(() => {
      stopObserver?.()
      scrollLock.dispose()
    })

    const wrapperClasses = computed(() =>
      classNames(getAnchorWrapperClasses(props.className), coerceClassValue(attrs.class))
    )
    const showInk = computed(() => !props.affix || props.showInkInFixed)

    const contextValue = reactive<AnchorContext>({
      activeLink: '',
      direction: props.direction,
      registerLink,
      unregisterLink,
      handleLinkClick,
      scrollTo
    })

    watch([activeLink, () => props.direction], ([newActive, newDir]) => {
      contextValue.activeLink = newActive
      contextValue.direction = newDir
    })

    provide(AnchorContextKey, contextValue)

    expose({
      scrollTo
    })

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const navLabel =
        (typeof attrsRecord['aria-label'] === 'string' && attrsRecord['aria-label']) ||
        labelSet.value.ariaLabel

      const inkIndicator = showInk.value
        ? [
            h('div', { class: getAnchorInkContainerClasses(props.direction) }, [
              h('div', {
                ref: inkRef,
                class: getAnchorInkActiveClasses(props.direction)
              })
            ])
          ]
        : []

      const nav = h(
        'nav',
        {
          ...attrs,
          ref: anchorRef,
          class: wrapperClasses.value,
          style: mergeStyleValues(attrs.style, props.style),
          'aria-label': navLabel
        },
        [
          ...inkIndicator,
          h('ul', { class: getAnchorLinkListClasses(props.direction) }, slots.default?.())
        ]
      )

      if (props.affix) {
        return h(Affix, { offsetTop: props.offsetTop }, { default: () => nav })
      }
      return nav
    }
  }
})

export default Anchor
