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
  nextTick,
  watch,
  useId,
  Fragment,
  isVNode,
  type ComputedRef,
  type Ref,
  type VNode
} from 'vue'
import {
  applyNavigationMenuPanelKey,
  classNames,
  coerceClassValue,
  mergeStyleValues,
  createNavigationMenuHoverSession,
  getNavigationMenuBarItems,
  getNavigationMenuClasses,
  getNavigationMenuListClasses,
  getNavigationMenuItemClasses,
  getNavigationMenuTriggerClasses,
  getNavigationMenuChevronClasses,
  getNavigationMenuContentClasses,
  getNavigationMenuLinkClasses,
  getNavigationMenuItemValue,
  getNavigationMenuRovingTabIndex,
  getNavigationMenuTabExitTarget,
  injectNavigationMenuStyles,
  NAVIGATION_MENU_ENTER_CLASS,
  NAVIGATION_MENU_CHEVRON_PATH,
  NAVIGATION_MENU_BAR_ITEM_ATTR,
  NAVIGATION_MENU_ITEM_VALUE_ATTR,
  NAVIGATION_MENU_DEFAULT_DELAY_DURATION,
  NAVIGATION_MENU_DEFAULT_SKIP_DELAY_DURATION,
  NAVIGATION_MENU_DEFAULT_OFFSET,
  isNavigationMenuValueOpen,
  isNavigationMenuOpen,
  resolveNavigationMenuOpenValue,
  resolveNavigationMenuTabStopValue,
  resolveElementDir,
  isNavigationMenuTriggerOpenKey,
  handleMenubarNavigation,
  focusFirstMenuItem,
  captureActiveElement,
  restoreFocus,
  getSecureRel,
  isFocusInsideNavigationMenu,
  warnNavigationMenuOpenWithoutValue,
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

export const NavigationMenuContextKey = Symbol('NavigationMenuContext')
export const NavigationMenuItemContextKey = Symbol('NavigationMenuItemContext')
export const NavigationMenuContentContextKey = Symbol('NavigationMenuContentContext')

export interface NavigationMenuContext {
  value: ComputedRef<NavigationMenuValue | null>
  tabStopValue: Ref<NavigationMenuValue | null>
  setTabStopValue: (next: NavigationMenuValue | null) => void
  setValue: (next: NavigationMenuValue | null, options?: { restoreFocus?: boolean }) => void
  scheduleOpen: (itemValue: NavigationMenuValue) => void
  scheduleClose: (itemValue: NavigationMenuValue) => void
  cancelClose: () => void
  closeOnClick: boolean
  openOnHover: boolean
  handleItemClick: () => void
  handleFocusLeave: (event: FocusEvent) => void
  portal: ComputedRef<boolean>
  disabled: boolean
  offset: number
  placement: FloatingPlacement
  showArrow: boolean
  rootRef: Ref<HTMLElement | null>
  menubarRef: Ref<HTMLElement | null>
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
  close: (options?: { restoreFocus?: boolean }) => void
  scheduleOpen: () => void
  scheduleClose: () => void
  cancelClose: () => void
  showArrow: boolean
}

export interface NavigationMenuContentContext {
  inPanel: true
}

export function useNavigationMenuContext(): NavigationMenuContext | null {
  return inject(NavigationMenuContextKey, null)
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

function nodesHaveList(nodes: unknown[]): boolean {
  for (const node of nodes) {
    if (!isVNode(node)) continue
    if (node.type === NavigationMenuList) return true
    if (node.type === Fragment && Array.isArray(node.children)) {
      if (nodesHaveList(node.children as unknown[])) return true
    }
  }
  return false
}

function commitMenubarKey(root: NavigationMenuContext | null, event: KeyboardEvent): boolean {
  if (!root?.menubarRef.value) return false
  const next = handleMenubarNavigation(root.menubarRef.value, event)
  if (!next) return false
  const value = getNavigationMenuItemValue(next)
  if (value != null) root.setTabStopValue(value)
  return true
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
    const disabled = computed(
      () => props.disabled || Boolean(item?.disabled) || Boolean(!inPanel && root?.disabled)
    )

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
      if (item) root?.setTabStopValue(item.value)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (inPanel) return
      commitMenubarKey(root, event)
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
      const isDisabled = disabled.value
      const isAnchor = Boolean(props.href) && !isDisabled
      const rel = isAnchor
        ? getSecureRel(
            props.target as '_blank' | '_self' | '_parent' | '_top' | undefined,
            props.rel
          )
        : undefined
      const tabIndex = inPanel
        ? -1
        : getNavigationMenuRovingTabIndex(item?.value ?? '', root?.tabStopValue.value)

      const tag = isAnchor ? 'a' : props.href ? 'span' : 'button'

      return h(
        tag,
        {
          ...restAttrs,
          href: isAnchor ? props.href : undefined,
          target: isAnchor ? props.target : undefined,
          rel,
          type: tag === 'button' ? 'button' : undefined,
          class: linkClasses.value,
          style: mergedStyle.value,
          role: 'menuitem',
          tabindex: tabIndex,
          [NAVIGATION_MENU_BAR_ITEM_ATTR]: inPanel || isDisabled ? undefined : '',
          [NAVIGATION_MENU_ITEM_VALUE_ATTR]: inPanel ? undefined : String(item?.value ?? ''),
          'aria-disabled': isDisabled || undefined,
          'aria-current': props.active ? 'page' : undefined,
          disabled: tag === 'button' ? isDisabled : undefined,
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
      if (disabled.value || !root?.openOnHover) return
      item?.scheduleOpen()
    }

    const handleMouseLeave = () => {
      if (!root?.openOnHover) return
      item?.scheduleClose()
    }

    const handleClick = (event: MouseEvent) => {
      if (disabled.value) {
        event.preventDefault()
        return
      }
      if (item?.isOpen.value) item.close({ restoreFocus: false })
      else item?.open()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled.value || !item) return

      if (commitMenubarKey(root, event)) return

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
          tabindex: getNavigationMenuRovingTabIndex(item.value, root?.tabStopValue.value),
          [NAVIGATION_MENU_BAR_ITEM_ATTR]: disabled.value ? undefined : '',
          [NAVIGATION_MENU_ITEM_VALUE_ATTR]: String(item.value),
          'aria-haspopup': 'menu',
          'aria-expanded': item.isOpen.value,
          'aria-controls': item.contentId,
          'aria-disabled': disabled.value || undefined,
          disabled: disabled.value,
          'data-state': item.isOpen.value ? 'open' : 'closed',
          'data-tiger-navigation-menu-trigger': '',
          onMouseenter: handleMouseEnter,
          onMouseleave: handleMouseLeave,
          onFocus: () => root?.setTabStopValue(item.value),
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
      onDismiss: () => item?.close({ restoreFocus: false })
    })

    const handleMouseEnter = () => {
      item?.cancelClose()
    }

    const handleMouseLeave = () => {
      if (!root?.openOnHover) return
      item?.scheduleClose()
    }

    const handleFocusOut = (event: FocusEvent) => {
      root?.handleFocusLeave(event)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const panel = item?.contentRef.value
      if (!panel || !item || !root) return
      if (!panel.contains(event.target as Node | null)) return
      const dir = resolveElementDir(root.rootRef.value ?? root.menubarRef.value)
      const action = applyNavigationMenuPanelKey({ event, panel, dir })
      if (!action || action === 'menu-nav') return

      event.stopPropagation()

      if (action === 'close-to-trigger') {
        item.close()
        item.triggerRef.value?.focus()
        return
      }

      if (action === 'move-menubar-next' && root.menubarRef.value) {
        item.close({ restoreFocus: false })
        item.triggerRef.value?.focus()
        const next = handleMenubarNavigation(root.menubarRef.value, event)
        const value = getNavigationMenuItemValue(next)
        if (value != null) root.setTabStopValue(value)
        return
      }

      if (action === 'tab-exit' || action === 'shift-tab-exit') {
        const nav = root.rootRef.value
        const target = nav
          ? getNavigationMenuTabExitTarget(nav, panel, action === 'shift-tab-exit')
          : null
        item.close({ restoreFocus: false })
        target?.focus()
      }
    }

    watch(
      () => item?.contentRef.value,
      (panel, _previous, onCleanup) => {
        if (!panel) return
        panel.addEventListener('keydown', handleKeyDown)
        onCleanup(() => panel.removeEventListener('keydown', handleKeyDown))
      },
      { flush: 'post' }
    )

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
      mergeStyleValues(
        (attrsRecord as { style?: unknown }).style,
        props.mega ? { minWidth: '28rem', ...props.style } : props.style
      )
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
              role: 'menu'
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

    const autoValue = `tiger-navigation-menu-item-${useId()}`
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
      root.setTabStopValue(itemValue.value)
      if (!focusPanel) return
      nextTick(() => {
        requestAnimationFrame(() => {
          const panel = contentRef.value ?? document.getElementById(contentId)
          if (panel) focusFirstMenuItem(panel)
        })
      })
    }

    const close = (options?: { restoreFocus?: boolean }) => {
      if (!root) return
      if (isOpen.value) root.setValue(null, options)
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
      const children = slots.default?.() ?? []
      hasPanel.value = children.some((node: VNode) => node.type === NavigationMenuContent)
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
        children
      )
    }
  }
})

export interface VueNavigationMenuListProps {
  className?: string
  style?: Record<string, unknown>
}

export type NavigationMenuListProps = VueNavigationMenuListProps

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

    const syncTabStop = () => {
      if (root) root.menubarRef.value = listRef.value
      if (!listRef.value || !root) return
      const next = resolveNavigationMenuTabStopValue({
        items: getNavigationMenuBarItems(listRef.value),
        tabStopValue: root.tabStopValue.value
      })
      if (next != null && next !== String(root.tabStopValue.value ?? '')) {
        root.setTabStopValue(next)
      }
    }

    onMounted(syncTabStop)

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
      nextTick(syncTabStop)
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

export interface VueNavigationMenuProps extends CoreNavigationMenuProps {}

export type NavigationMenuProps = VueNavigationMenuProps

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
    openOnHover: {
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
    const tabStopValue = ref<NavigationMenuValue | null>(null)
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

    const setValue = (next: NavigationMenuValue | null, options?: { restoreFocus?: boolean }) => {
      if (props.disabled && next != null) return

      hover.clear()

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
      emit('update:open', willOpen)
      emit('open-change', willOpen)

      if (!willOpen && options?.restoreFocus !== false) {
        restoreFocus(previousActiveElement.value)
        previousActiveElement.value = null
      }
    }

    const hover = createNavigationMenuHoverSession({
      getDelayDuration: () => props.delayDuration,
      getSkipDelayDuration: () => props.skipDelayDuration,
      getValue: () => currentValue.value,
      setValue,
      isDisabled: () => props.disabled
    })

    const handleItemClick = () => {
      if (props.closeOnClick) setValue(null, { restoreFocus: false })
    }

    const handleFocusLeave = (event: FocusEvent) => {
      if (isFocusInsideNavigationMenu(rootRef.value, menubarRef.value, event.relatedTarget)) {
        return
      }
      if (!isNavigationMenuOpen(currentValue.value)) return
      setValue(null, { restoreFocus: false })
    }

    onBeforeUnmount(hover.clear)

    onMounted(() => {
      warnNavigationMenuOpenWithoutValue(
        props.open,
        isNavigationMenuOpen(props.value ?? props.defaultValue ?? internalValue.value)
      )
    })

    const portalEnabled = computed(() => props.portal)

    const navigationMenuContext: NavigationMenuContext = {
      value: currentValue,
      tabStopValue,
      setTabStopValue: (next) => {
        tabStopValue.value = next
      },
      setValue,
      scheduleOpen: hover.scheduleOpen,
      scheduleClose: hover.scheduleClose,
      cancelClose: hover.cancelClose,
      get closeOnClick() {
        return props.closeOnClick
      },
      get openOnHover() {
        return props.openOnHover
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
      rootRef,
      menubarRef
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
      const hasList = nodesHaveList(defaultSlot)
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
