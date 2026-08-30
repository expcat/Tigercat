import {
  defineComponent,
  computed,
  ref,
  provide,
  inject,
  PropType,
  h,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  nextTick,
  type ComputedRef,
  type Ref
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getNavigationMenuClasses,
  getNavigationMenuListClasses,
  getNavigationMenuItemClasses,
  getNavigationMenuTriggerClasses,
  getNavigationMenuChevronClasses,
  getNavigationMenuContentClasses,
  getNavigationMenuLinkClasses,
  injectNavigationMenuStyles,
  NAVIGATION_MENU_ENTER_CLASS,
  NAVIGATION_MENU_CHEVRON_PATH,
  NAVIGATION_MENU_BAR_ITEM_ATTR,
  NAVIGATION_MENU_DEFAULT_DELAY_DURATION,
  NAVIGATION_MENU_DEFAULT_SKIP_DELAY_DURATION,
  NAVIGATION_MENU_DEFAULT_OFFSET,
  isNavigationMenuValueOpen,
  isNavigationMenuOpen,
  resolveNavigationMenuOpenValue,
  shouldSkipNavigationMenuOpenDelay,
  isNavigationMenuTriggerOpenKey,
  handleMenubarNavigation,
  handleMenuNavigation,
  initNavigationMenuRovingTabIndex,
  focusFirstMenuItem,
  captureActiveElement,
  restoreFocus,
  getSecureRel,
  type NavigationMenuValue,
  type FloatingPlacement
} from '@expcat/tigercat-core'

import type {
  NavigationMenuProps as CoreNavigationMenuProps,
  NavigationMenuItemProps as CoreNavigationMenuItemProps,
  NavigationMenuTriggerProps as CoreNavigationMenuTriggerProps,
  NavigationMenuContentProps as CoreNavigationMenuContentProps,
  NavigationMenuLinkProps as CoreNavigationMenuLinkProps
} from '@expcat/tigercat-core'
import { useVueAnchoredOverlay, renderVueOverlayTeleport } from '../utils/overlay'

let navigationMenuItemIdCounter = 0
const createNavigationMenuItemId = () =>
  `tiger-navigation-menu-item-${++navigationMenuItemIdCounter}`

export const NavigationMenuContextKey = Symbol('NavigationMenuContext')
export const NavigationMenuItemContextKey = Symbol('NavigationMenuItemContext')
export const NavigationMenuContentContextKey = Symbol('NavigationMenuContentContext')

function containsFocusTarget(
  container: HTMLElement | null | undefined,
  target: EventTarget | null
): boolean {
  return Boolean(container && target instanceof Node && container.contains(target))
}

function getOpenPanelFromMenubar(menubar: HTMLElement | null): HTMLElement | null {
  if (!menubar) return null
  const trigger = menubar.querySelector<HTMLElement>('[aria-expanded="true"][aria-controls]')
  const contentId = trigger?.getAttribute('aria-controls')
  if (!contentId) return null
  return menubar.ownerDocument.getElementById(contentId)
}

export interface NavigationMenuContext {
  value: ComputedRef<NavigationMenuValue | null>
  setValue: (next: NavigationMenuValue | null, options?: { restoreFocus?: boolean }) => void
  scheduleOpen: (itemValue: NavigationMenuValue) => void
  scheduleClose: (itemValue: NavigationMenuValue) => void
  cancelClose: () => void
  closeOnClick: boolean
  handleItemClick: () => void
  handleFocusLeave: (event: FocusEvent) => void
  portal: ComputedRef<boolean>
  disabled: boolean
  offset: number
  placement: FloatingPlacement
  showArrow: boolean
  menubarRef: Ref<HTMLElement | null>
  suppressFocusOpen: Ref<boolean>
}

export interface NavigationMenuItemContext {
  value: NavigationMenuValue
  isOpen: ComputedRef<boolean>
  disabled: boolean
  hasPanel: Ref<boolean>
  triggerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
  contentId: string
  open: (focusPanel?: boolean) => void
  close: () => void
  scheduleOpen: () => void
  scheduleClose: () => void
  cancelClose: () => void
  showArrow: boolean
}

export interface NavigationMenuContentContext {
  inPanel: true
}

function splitClassStyleAttrs(attrs: Record<string, unknown>): {
  restAttrs: Record<string, unknown>
  attrsClass: unknown
  attrsStyle: unknown
} {
  const {
    class: attrsClass,
    style: attrsStyle,
    ...restAttrs
  } = attrs as {
    class?: unknown
    style?: unknown
  } & Record<string, unknown>
  return { restAttrs, attrsClass, attrsStyle }
}

export type VueNavigationMenuLinkProps = CoreNavigationMenuLinkProps

export const NavigationMenuLink = defineComponent({
  name: 'TigerNavigationMenuLink',
  inheritAttrs: false,
  props: {
    href: {
      type: String,
      default: undefined
    },
    target: {
      type: String,
      default: undefined
    },
    rel: {
      type: String,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: false
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  emits: ['click'],
  setup(props, { slots, emit, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>
    const root = inject<NavigationMenuContext | null>(NavigationMenuContextKey, null)
    const item = inject<NavigationMenuItemContext | null>(NavigationMenuItemContextKey, null)
    const content = inject<NavigationMenuContentContext | null>(
      NavigationMenuContentContextKey,
      null
    )

    const inPanel = Boolean(content)
    const disabled = computed(() => props.disabled || Boolean(item?.disabled))

    const handleClick = (event: MouseEvent) => {
      if (disabled.value) {
        event.preventDefault()
        event.stopPropagation()
        return
      }

      emit('click', event)
      root?.handleItemClick()
    }

    const handleFocus = () => {
      if (inPanel) return
      if (!item || !item.hasPanel.value) {
        root?.setValue(null, { restoreFocus: false })
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (inPanel) return
      if (root?.menubarRef.value) {
        handleMenubarNavigation(root.menubarRef.value, event)
      }
    }

    const linkClasses = computed(() =>
      classNames(
        getNavigationMenuLinkClasses(disabled.value, inPanel, props.active),
        props.className,
        coerceClassValue((attrsRecord as { class?: unknown }).class)
      )
    )

    const mergedStyle = computed(() =>
      mergeStyleValues((attrsRecord as { style?: unknown }).style, props.style)
    )

    return () => {
      const { restAttrs } = splitClassStyleAttrs(attrsRecord)
      const isAnchor = Boolean(props.href)
      const rel = isAnchor
        ? getSecureRel(
            props.target as '_blank' | '_self' | '_parent' | '_top' | undefined,
            props.rel
          )
        : undefined

      return h(
        isAnchor ? 'a' : 'button',
        {
          ...restAttrs,
          href: isAnchor ? props.href : undefined,
          target: isAnchor ? props.target : undefined,
          rel,
          type: isAnchor ? undefined : 'button',
          class: linkClasses.value,
          style: mergedStyle.value,
          role: 'menuitem',
          tabindex: inPanel ? -1 : -1,
          [NAVIGATION_MENU_BAR_ITEM_ATTR]: inPanel ? undefined : '',
          'aria-disabled': disabled.value || undefined,
          'aria-current': props.active ? 'page' : undefined,
          disabled: isAnchor ? undefined : disabled.value,
          'data-tiger-navigation-menu-link': '',
          'data-active': props.active ? 'true' : undefined,
          onClick: handleClick,
          onFocus: handleFocus,
          onKeydown: handleKeyDown
        },
        slots.default?.()
      )
    }
  }
})

export interface VueNavigationMenuTriggerProps extends CoreNavigationMenuTriggerProps {}

export const NavigationMenuTrigger = defineComponent({
  name: 'TigerNavigationMenuTrigger',
  inheritAttrs: false,
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    showArrow: {
      type: Boolean,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>
    const root = inject<NavigationMenuContext | null>(NavigationMenuContextKey, null)
    const item = inject<NavigationMenuItemContext | null>(NavigationMenuItemContextKey, null)

    const disabled = computed(
      () => props.disabled || Boolean(item?.disabled) || Boolean(root?.disabled)
    )
    const showArrow = computed(() =>
      props.showArrow !== undefined ? props.showArrow : (item?.showArrow ?? true)
    )

    const handleMouseEnter = () => {
      if (disabled.value) return
      item?.scheduleOpen()
    }

    const handleMouseLeave = () => {
      item?.scheduleClose()
    }

    const handleFocus = () => {
      if (disabled.value || root?.suppressFocusOpen.value) return
      item?.open()
    }

    const handleClick = (event: MouseEvent) => {
      if (disabled.value) {
        event.preventDefault()
        return
      }
      item?.open()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled.value || !item) return

      if (root?.menubarRef.value && handleMenubarNavigation(root.menubarRef.value, event)) {
        return
      }

      if (isNavigationMenuTriggerOpenKey(event.key) && item.hasPanel.value) {
        event.preventDefault()
        item.open(true)
        return
      }

      if (event.key === 'Escape' && item.isOpen.value) {
        event.preventDefault()
        item.close()
        item.triggerRef.value?.focus()
      }
    }

    const triggerClasses = computed(() =>
      classNames(
        getNavigationMenuTriggerClasses(disabled.value, Boolean(item?.isOpen.value)),
        props.className,
        coerceClassValue((attrsRecord as { class?: unknown }).class)
      )
    )

    const mergedStyle = computed(() =>
      mergeStyleValues((attrsRecord as { style?: unknown }).style, props.style)
    )

    return () => {
      if (!item) return null

      const { restAttrs } = splitClassStyleAttrs(attrsRecord)
      const chevron = showArrow.value
        ? h(
            'svg',
            {
              class: getNavigationMenuChevronClasses(item.isOpen.value),
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              'aria-hidden': 'true'
            },
            [h('path', { d: NAVIGATION_MENU_CHEVRON_PATH })]
          )
        : null

      return h(
        'button',
        {
          ...restAttrs,
          ref: item.triggerRef,
          type: 'button',
          class: triggerClasses.value,
          style: mergedStyle.value,
          role: 'menuitem',
          tabindex: -1,
          [NAVIGATION_MENU_BAR_ITEM_ATTR]: '',
          'aria-haspopup': 'menu',
          'aria-expanded': item.isOpen.value,
          'aria-controls': item.isOpen.value ? item.contentId : undefined,
          'aria-disabled': disabled.value || undefined,
          disabled: disabled.value,
          'data-state': item.isOpen.value ? 'open' : 'closed',
          'data-tiger-navigation-menu-trigger': '',
          onMouseenter: handleMouseEnter,
          onMouseleave: handleMouseLeave,
          onFocus: handleFocus,
          onClick: handleClick,
          onKeydown: handleKeyDown
        },
        [slots.default?.(), chevron]
      )
    }
  }
})

export interface VueNavigationMenuContentProps extends CoreNavigationMenuContentProps {}

export const NavigationMenuContent = defineComponent({
  name: 'TigerNavigationMenuContent',
  inheritAttrs: false,
  props: {
    mega: {
      type: Boolean,
      default: false
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>
    const root = inject<NavigationMenuContext | null>(NavigationMenuContextKey, null)
    const item = inject<NavigationMenuItemContext | null>(NavigationMenuItemContextKey, null)

    const panelContext: NavigationMenuContentContext = { inPanel: true }
    provide(NavigationMenuContentContextKey, panelContext)

    const portalEnabled = computed(() => Boolean(root?.portal.value))
    const overlayEnabled = computed(
      () => Boolean(item) && Boolean(item?.isOpen.value) && !item?.disabled
    )

    const overlay = useVueAnchoredOverlay({
      referenceRef: item?.triggerRef ?? ref(null),
      floatingRef: item?.contentRef ?? ref(null),
      enabled: overlayEnabled,
      placement: () => root?.placement ?? 'bottom-start',
      offset: () => root?.offset ?? NAVIGATION_MENU_DEFAULT_OFFSET,
      portal: portalEnabled,
      dismissOnOutside: true,
      dismissOnEscape: true,
      onDismiss: () => item?.close()
    })

    if (item) item.hasPanel.value = true

    onBeforeUnmount(() => {
      if (item) item.hasPanel.value = false
    })

    const handleMouseEnter = () => {
      item?.cancelClose()
    }

    const handleMouseLeave = () => {
      item?.scheduleClose()
    }

    const handleFocusOut = (event: FocusEvent) => {
      root?.handleFocusLeave(event)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (item?.contentRef.value) {
        handleMenuNavigation(item.contentRef.value, event)
      }

      if (event.key === 'Escape' || event.key === 'ArrowLeft') {
        event.preventDefault()
        event.stopPropagation()
        item?.close()
        item?.triggerRef.value?.focus()
        return
      }

      if (
        (event.key === 'ArrowRight' || event.key === 'ArrowLeft') &&
        root?.menubarRef.value &&
        item?.triggerRef.value
      ) {
        item.triggerRef.value.focus()
        handleMenubarNavigation(root.menubarRef.value, event)
      }
    }

    const panelClasses = computed(() =>
      classNames(overlay.floatingClasses.value, NAVIGATION_MENU_ENTER_CLASS)
    )

    const innerClasses = computed(() =>
      classNames(
        getNavigationMenuContentClasses(props.mega),
        props.className,
        coerceClassValue((attrsRecord as { class?: unknown }).class)
      )
    )

    const mergedStyle = computed(() =>
      mergeStyleValues((attrsRecord as { style?: unknown }).style, props.style)
    )

    return () => {
      if (!item || !root) return null

      const { restAttrs } = splitClassStyleAttrs(attrsRecord)
      const isOpen = item.isOpen.value

      const popup = h(
        'div',
        {
          ref: item.contentRef,
          class: panelClasses.value,
          style: overlay.floatingStyles.value,
          'data-positioned': overlay.positioned.value,
          'data-tiger-navigation-menu-content': '',
          hidden: !isOpen,
          onMouseenter: handleMouseEnter,
          onMouseleave: handleMouseLeave,
          onFocusout: handleFocusOut,
          onKeydown: handleKeyDown
        },
        [
          h(
            'div',
            {
              ...restAttrs,
              id: item.contentId,
              class: innerClasses.value,
              style: mergedStyle.value,
              role: props.mega ? 'group' : 'menu'
            },
            slots.default?.()
          )
        ]
      )

      return renderVueOverlayTeleport(popup, overlay.target.value, !portalEnabled.value)
    }
  }
})

export interface VueNavigationMenuItemProps extends CoreNavigationMenuItemProps {}

export const NavigationMenuItem = defineComponent({
  name: 'TigerNavigationMenuItem',
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number] as PropType<NavigationMenuValue>,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>
    const root = inject<NavigationMenuContext | null>(NavigationMenuContextKey, null)

    const autoValue = createNavigationMenuItemId()
    const itemValue = computed(() => props.value ?? autoValue)
    const triggerRef = ref<HTMLElement | null>(null)
    const contentRef = ref<HTMLElement | null>(null)
    const hasPanel = ref(false)

    const isOpen = computed(
      () =>
        Boolean(root) &&
        !props.disabled &&
        isNavigationMenuValueOpen(itemValue.value, root?.value.value)
    )

    const contentId = `${autoValue}-content`

    const open = (focusPanel = false) => {
      if (props.disabled || !root) return
      root.cancelClose()
      root.setValue(itemValue.value)
      if (!focusPanel) return
      nextTick(() => {
        requestAnimationFrame(() => {
          const panel = contentRef.value ?? document.getElementById(contentId)
          if (panel) focusFirstMenuItem(panel)
        })
      })
    }

    const close = () => {
      if (!root) return
      if (isOpen.value) root.setValue(null)
    }

    const scheduleOpen = () => {
      if (props.disabled || !root) return
      root.scheduleOpen(itemValue.value)
    }

    const scheduleClose = () => {
      if (!root) return
      root.scheduleClose(itemValue.value)
    }

    const cancelClose = () => {
      root?.cancelClose()
    }

    const itemContext: NavigationMenuItemContext = {
      get value() {
        return itemValue.value
      },
      isOpen,
      get disabled() {
        return props.disabled
      },
      hasPanel,
      triggerRef,
      contentRef,
      contentId,
      open,
      close,
      scheduleOpen,
      scheduleClose,
      cancelClose,
      get showArrow() {
        return root?.showArrow ?? true
      }
    }
    provide(NavigationMenuItemContextKey, itemContext)

    const itemClasses = computed(() =>
      classNames(
        getNavigationMenuItemClasses(),
        props.className,
        coerceClassValue((attrsRecord as { class?: unknown }).class)
      )
    )

    const mergedStyle = computed(() =>
      mergeStyleValues((attrsRecord as { style?: unknown }).style, props.style)
    )

    return () => {
      const { restAttrs } = splitClassStyleAttrs(attrsRecord)
      return h(
        'li',
        {
          ...restAttrs,
          class: itemClasses.value,
          style: mergedStyle.value,
          role: 'none',
          'data-tiger-navigation-menu-item': '',
          'data-state': isOpen.value ? 'open' : 'closed'
        },
        slots.default?.()
      )
    }
  }
})

export interface VueNavigationMenuListProps {
  className?: string
  style?: Record<string, unknown>
}

export const NavigationMenuList = defineComponent({
  name: 'TigerNavigationMenuList',
  inheritAttrs: false,
  props: {
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>
    const root = inject<NavigationMenuContext | null>(NavigationMenuContextKey, null)
    const listRef = ref<HTMLElement | null>(null)

    const syncRoving = () => {
      if (root) root.menubarRef.value = listRef.value
      if (listRef.value) initNavigationMenuRovingTabIndex(listRef.value)
    }

    onMounted(syncRoving)
    onUpdated(syncRoving)

    const listClasses = computed(() =>
      classNames(
        getNavigationMenuListClasses(),
        props.className,
        coerceClassValue((attrsRecord as { class?: unknown }).class)
      )
    )

    const mergedStyle = computed(() =>
      mergeStyleValues((attrsRecord as { style?: unknown }).style, props.style)
    )

    return () => {
      const { restAttrs } = splitClassStyleAttrs(attrsRecord)
      return h(
        'ul',
        {
          ...restAttrs,
          ref: listRef,
          class: listClasses.value,
          style: mergedStyle.value,
          role: 'menubar',
          'data-tiger-navigation-menu-list': ''
        },
        slots.default?.()
      )
    }
  }
})

export interface VueNavigationMenuProps extends CoreNavigationMenuProps {
  /**
   * Panel placement relative to the trigger
   * @default 'bottom-start'
   */
  placement?: FloatingPlacement
}

export const NavigationMenu = defineComponent({
  name: 'TigerNavigationMenu',
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number] as PropType<NavigationMenuValue | null>,
      default: undefined
    },
    defaultValue: {
      type: [String, Number] as PropType<NavigationMenuValue | null>,
      default: undefined
    },
    open: {
      type: Boolean,
      default: undefined
    },
    defaultOpen: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    closeOnClick: {
      type: Boolean,
      default: true
    },
    delayDuration: {
      type: Number,
      default: NAVIGATION_MENU_DEFAULT_DELAY_DURATION
    },
    skipDelayDuration: {
      type: Number,
      default: NAVIGATION_MENU_DEFAULT_SKIP_DELAY_DURATION
    },
    showArrow: {
      type: Boolean,
      default: true
    },
    portal: {
      type: Boolean,
      default: true
    },
    offset: {
      type: Number,
      default: NAVIGATION_MENU_DEFAULT_OFFSET
    },
    placement: {
      type: String as PropType<FloatingPlacement>,
      default: 'bottom-start' as FloatingPlacement
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  emits: ['update:value', 'value-change', 'update:open', 'open-change'],
  setup(props, { slots, emit, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>

    onMounted(() => injectNavigationMenuStyles())

    const previousActiveElement = ref<HTMLElement | null>(null)
    const rootRef = ref<HTMLElement | null>(null)
    const menubarRef = ref<HTMLElement | null>(null)
    const suppressFocusOpen = ref(false)
    const initialValue = props.defaultValue ?? (props.defaultOpen ? (props.value ?? null) : null)
    const internalValue = ref<NavigationMenuValue | null>(
      isNavigationMenuOpen(initialValue) ? (initialValue as NavigationMenuValue) : null
    )

    const currentValue = computed(() =>
      resolveNavigationMenuOpenValue({
        value: props.value,
        internalValue: internalValue.value,
        open: props.open
      })
    )

    const currentOpen = computed(() => isNavigationMenuOpen(currentValue.value))

    let openTimer: ReturnType<typeof setTimeout> | null = null
    let closeTimer: ReturnType<typeof setTimeout> | null = null
    let lastOpenAt = 0

    const clearTimers = () => {
      if (openTimer) {
        clearTimeout(openTimer)
        openTimer = null
      }
      if (closeTimer) {
        clearTimeout(closeTimer)
        closeTimer = null
      }
    }

    const setValue = (next: NavigationMenuValue | null, options?: { restoreFocus?: boolean }) => {
      if (props.disabled && next != null) return

      clearTimers()

      const resolvedNext = isNavigationMenuOpen(next) ? next : null
      const wasOpen = isNavigationMenuOpen(currentValue.value)
      const willOpen = resolvedNext != null

      if (willOpen && !wasOpen) {
        const active = captureActiveElement()
        if (active && menubarRef.value?.contains(active)) {
          previousActiveElement.value = active
        }
      }

      if (props.value === undefined) {
        internalValue.value = resolvedNext
      }

      emit('update:value', resolvedNext)
      emit('value-change', resolvedNext)

      const open = willOpen
      emit('update:open', open)
      emit('open-change', open)

      if (!willOpen) {
        suppressFocusOpen.value = true
        if (options?.restoreFocus !== false) {
          restoreFocus(previousActiveElement.value)
        }
        previousActiveElement.value = null
        nextTick(() => {
          suppressFocusOpen.value = false
        })
      }
    }

    const scheduleOpen = (itemValue: NavigationMenuValue) => {
      if (props.disabled) return
      if (closeTimer) {
        clearTimeout(closeTimer)
        closeTimer = null
      }

      const skip = shouldSkipNavigationMenuOpenDelay(
        lastOpenAt,
        Date.now(),
        props.skipDelayDuration
      )
      const delay = skip ? 0 : props.delayDuration

      const apply = () => {
        lastOpenAt = Date.now()
        setValue(itemValue)
        openTimer = null
      }

      if (delay <= 0) {
        apply()
        return
      }

      if (openTimer) clearTimeout(openTimer)
      openTimer = setTimeout(apply, delay)
    }

    const scheduleClose = (itemValue: NavigationMenuValue) => {
      if (openTimer) {
        clearTimeout(openTimer)
        openTimer = null
      }

      const close = () => {
        if (currentValue.value === itemValue) setValue(null)
        closeTimer = null
      }

      if (props.skipDelayDuration <= 0) {
        close()
        return
      }

      if (closeTimer) clearTimeout(closeTimer)
      closeTimer = setTimeout(close, props.skipDelayDuration)
    }

    const cancelClose = () => {
      if (closeTimer) {
        clearTimeout(closeTimer)
        closeTimer = null
      }
    }

    const handleItemClick = () => {
      if (props.closeOnClick) setValue(null)
    }

    const handleFocusLeave = (event: FocusEvent) => {
      const next = event.relatedTarget
      if (containsFocusTarget(rootRef.value, next)) return
      if (containsFocusTarget(getOpenPanelFromMenubar(menubarRef.value), next)) return
      if (!isNavigationMenuOpen(currentValue.value)) return
      setValue(null, { restoreFocus: false })
    }

    onBeforeUnmount(clearTimers)

    const portalEnabled = computed(() => props.portal)

    const navigationMenuContext: NavigationMenuContext = {
      value: currentValue,
      setValue,
      scheduleOpen,
      scheduleClose,
      cancelClose,
      get closeOnClick() {
        return props.closeOnClick
      },
      handleItemClick,
      handleFocusLeave,
      portal: portalEnabled,
      get disabled() {
        return props.disabled
      },
      get offset() {
        return props.offset
      },
      get placement() {
        return props.placement
      },
      get showArrow() {
        return props.showArrow
      },
      menubarRef,
      suppressFocusOpen
    }
    provide(NavigationMenuContextKey, navigationMenuContext)

    const containerClasses = computed(() =>
      classNames(
        getNavigationMenuClasses(),
        props.className,
        coerceClassValue((attrsRecord as { class?: unknown }).class)
      )
    )

    const mergedStyle = computed(() =>
      mergeStyleValues((attrsRecord as { style?: unknown }).style, props.style)
    )

    return () => {
      const defaultSlot = slots.default?.() ?? []
      const hasList = defaultSlot.some((node) => node.type === NavigationMenuList)
      const children = hasList
        ? defaultSlot
        : [h(NavigationMenuList, null, { default: () => defaultSlot })]

      const { restAttrs } = splitClassStyleAttrs(attrsRecord)

      return h(
        'nav',
        {
          ...restAttrs,
          ref: rootRef,
          class: containerClasses.value,
          style: mergedStyle.value,
          'aria-label': (restAttrs['aria-label'] as string | undefined) ?? 'Main',
          'data-tiger-navigation-menu': '',
          'data-state': currentOpen.value ? 'open' : 'closed',
          onFocusout: handleFocusLeave
        },
        children
      )
    }
  }
})

export default NavigationMenu
