import {
  defineComponent,
  computed,
  ref,
  provide,
  inject,
  reactive,
  PropType,
  h,
  onBeforeUnmount,
  nextTick,
  VNode,
  cloneVNode,
  watch,
  useId
} from 'vue'
import {
  classNames,
  getSecureRel,
  resolveLinkHref,
  coerceClassValue,
  mergeStyleValues,
  getDropdownContainerClasses,
  getDropdownTriggerClasses,
  getDropdownChevronClasses,
  getDropdownMenuClasses,
  getDropdownItemClasses,
  getPopupMenuItemClasses,
  getPopupMenuShortcutClasses,
  popupMenuAccessibleName,
  popupMenuItemCloses,
  popupMenuItemHref,
  popupMenuItemRole,
  resolvePopupMenuItemType,
  nextPopupMenuCheck,
  getContextMenuSubPlacement,
  createTypeaheadHighlight,
  markTypeaheadMatch,
  TYPEAHEAD_MATCH_ATTR,
  POPUP_MENU_TYPEAHEAD_MATCH_CLASS,
  navLabels,
  DROPDOWN_CHEVRON_PATH,
  DROPDOWN_ENTER_CLASS,
  handleMenuNavigation,
  focusMenuItem,
  isTextEditingTarget,
  restoreFocus,
  createFloatingHoverDelayController,
  DEFAULT_DROPDOWN_TRIGGER,
  getOverlayTriggerAria,
  getOverlayTriggerKeyboardAction,
  devWarn,
  type DropdownTrigger,
  type FloatingPlacement
} from '@expcat/tigercat-core'

import type {
  DropdownProps as CoreDropdownProps,
  DropdownMenuProps as CoreDropdownMenuProps,
  DropdownItemProps as CoreDropdownItemProps,
  PopupMenuItem
} from '@expcat/tigercat-core'
import { renderVueOverlayTeleport, useVueAnchoredOverlay } from '../utils/overlay'
import { assignOverlayTriggerRef, renderOverlayTrigger } from '../utils/overlay-trigger'

export interface VueDropdownMenuProps extends CoreDropdownMenuProps {}

export const DropdownMenu = defineComponent({
  name: 'TigerDropdownMenu',
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
    const attrsClass = (attrsRecord as { class?: unknown }).class
    const attrsStyle = (attrsRecord as { style?: unknown }).style

    const menuClasses = computed(() =>
      classNames(getDropdownMenuClasses(), props.className, coerceClassValue(attrsClass))
    )

    const mergedStyle = computed(() => mergeStyleValues(attrsStyle, props.style))

    return () => {
      const {
        class: _class,
        style: _style,
        ...restAttrs
      } = attrsRecord as {
        class?: unknown
        style?: unknown
      } & Record<string, unknown>

      return h(
        'div',
        {
          ...restAttrs,
          class: menuClasses.value,
          role: 'menu',
          'data-tiger-dropdown-menu': '',
          style: mergedStyle.value
        },
        slots.default?.()
      )
    }
  }
})

export const DropdownContextKey = Symbol('DropdownContext')

export interface DropdownContext {
  closeOnClick: boolean
  handleItemClick: () => void
}

export type VueDropdownItemProps = CoreDropdownItemProps

export const DropdownItem = defineComponent({
  name: 'TigerDropdownItem',
  inheritAttrs: false,
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    divided: {
      type: Boolean,
      default: false
    },
    closeOnClick: {
      type: Boolean,
      default: undefined
    },
    href: {
      type: String,
      default: undefined
    },
    danger: { type: Boolean, default: false },
    shortcut: { type: String, default: undefined },
    checked: { type: Boolean, default: undefined },
    itemType: { type: String, default: 'item' },
    itemKey: {
      type: [String, Number],
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
  emits: ['click', 'check'],
  setup(props, { slots, emit, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>
    const attrsClass = (attrsRecord as { class?: unknown }).class
    const attrsStyle = (attrsRecord as { style?: unknown }).style

    const context = inject<DropdownContext | null>(DropdownContextKey, null)
    if (context == null) {
      devWarn('DropdownItem.orphan', 'DropdownItem must be used inside Dropdown.')
    }

    const handleClick = (event: MouseEvent) => {
      if (props.disabled) {
        event.preventDefault()
        return
      }

      emit('click', event)
      if (props.itemType === 'checkbox' || props.itemType === 'radio') {
        emit('check', !props.checked)
        return
      }

      const shouldClose = props.closeOnClick ?? context?.closeOnClick ?? true
      if (shouldClose && popupMenuItemCloses(props.itemType === 'danger' ? 'danger' : 'item')) {
        context?.handleItemClick()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Spacebar') return
      if (props.itemType !== 'checkbox' && props.itemType !== 'radio') return
      event.preventDefault()
      emit('check', props.itemType === 'checkbox' ? !props.checked : true)
    }

    const itemClasses = computed(() => {
      return classNames(
        props.danger || props.itemType === 'danger'
          ? getPopupMenuItemClasses(props.disabled, true, props.divided)
          : getDropdownItemClasses(props.disabled, props.divided),
        props.className,
        coerceClassValue(attrsClass)
      )
    })

    const mergedStyle = computed(() => mergeStyleValues(attrsStyle, props.style))

    return () => {
      const {
        class: _class,
        style: _style,
        ...restAttrs
      } = attrsRecord as {
        class?: unknown
        style?: unknown
      } & Record<string, unknown>

      const safeHref = resolveLinkHref(props.href, { disabled: props.disabled })
      const isLink = Boolean(safeHref)
      const target = restAttrs.target as string | undefined
      const rel = restAttrs.rel as string | undefined
      return h(
        isLink ? 'a' : 'button',
        {
          ...restAttrs,
          ...(isLink
            ? { href: safeHref, rel: getSecureRel(target, rel) }
            : { type: 'button', href: undefined, rel: undefined }),
          class: itemClasses.value,
          role:
            props.itemType === 'checkbox'
              ? 'menuitemcheckbox'
              : props.itemType === 'radio'
                ? 'menuitemradio'
                : 'menuitem',
          'aria-checked':
            props.itemType === 'checkbox' || props.itemType === 'radio'
              ? Boolean(props.checked)
              : undefined,
          tabindex: -1,
          'aria-disabled': props.disabled || undefined,
          disabled: isLink ? undefined : props.disabled,
          onClick: handleClick,
          onKeydown: handleKeyDown,
          style: mergedStyle.value
        },
        [
          slots.default?.(),
          props.shortcut
            ? h('span', { class: getPopupMenuShortcutClasses() }, props.shortcut)
            : null,
          props.danger || props.itemType === 'danger'
            ? h('span', { class: 'sr-only' }, `, ${navLabels.dangerItem}`)
            : null
        ]
      )
    }
  }
})

export interface VueDropdownProps extends CoreDropdownProps {
  placement?: FloatingPlacement
  offset?: number
  items?: PopupMenuItem[]
}

function itemLabels(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[role^="menuitem"]')).map(
    (node) => node.textContent ?? ''
  )
}

function renderPopupItems(
  items: PopupMenuItem[],
  emitCheck: (key: string | number, checked: boolean) => void,
  emitSelect?: (item: PopupMenuItem) => void
): VNode[] {
  return items.map((item) => {
    const type = resolvePopupMenuItemType(item)
    if (type === 'separator') {
      return h('div', {
        key: item.key,
        role: 'separator',
        class: 'my-1 h-px bg-[var(--tiger-border)]'
      })
    }
    if (type === 'submenu') {
      return h(
        Dropdown,
        {
          key: item.key,
          items: item.children,
          trigger: 'hover',
          placement: getContextMenuSubPlacement(
            typeof document === 'undefined' ? 'ltr' : document.documentElement.dir
          )
        },
        { default: () => item.label }
      )
    }
    const href = popupMenuItemHref(item)
    return h(
      DropdownItem,
      {
        key: item.key,
        itemKey: item.key,
        disabled: item.disabled,
        danger: type === 'danger',
        itemType: type,
        href,
        shortcut: item.shortcut,
        checked: item.checked,
        closeOnClick: popupMenuItemCloses(type),
        onCheck: (checked: boolean) => emitCheck(item.key, checked),
        onClick: () => emitSelect?.(item)
      },
      () => item.label
    )
  })
}

export type DropdownProps = VueDropdownProps

export const Dropdown = defineComponent({
  name: 'TigerDropdown',
  inheritAttrs: false,
  props: {
    trigger: {
      type: String as PropType<DropdownTrigger>,
      default: DEFAULT_DROPDOWN_TRIGGER
    },
    placement: {
      type: String as PropType<FloatingPlacement>,
      default: 'bottom-start' as FloatingPlacement
    },
    offset: {
      type: Number,
      default: 4
    },
    disabled: {
      type: Boolean,
      default: false
    },
    open: {
      type: Boolean,
      default: undefined
    },
    defaultOpen: {
      type: Boolean,
      default: false
    },
    closeOnClick: {
      type: Boolean,
      default: true
    },
    showArrow: {
      type: Boolean,
      default: true
    },
    items: { type: Array as PropType<PopupMenuItem[]>, default: undefined },
    portal: {
      type: Boolean,
      default: true
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    },
    asChild: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:open', 'open-change', 'check', 'select'],
  setup(props, { slots, emit, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>
    const attrsClass = (attrsRecord as { class?: unknown }).class
    const attrsStyle = (attrsRecord as { style?: unknown }).style

    const menuId = `tiger-dropdown-menu-${useId()}`
    const previousActiveElement = ref<HTMLElement | null>(null)
    const internalVisible = ref(props.defaultOpen)
    const currentVisible = computed(() =>
      props.open !== undefined ? props.open : internalVisible.value
    )

    const containerRef = ref<HTMLElement | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)
    const floatingRef = ref<HTMLElement | null>(null)
    const openIntent = ref<'menu' | 'hover'>('menu')
    const focusEdge = ref<'first' | 'last' | null>(null)
    const skipRestore = ref(false)

    const hoverController = createFloatingHoverDelayController({
      showDelay: 0,
      show: () => {
        openIntent.value = 'hover'
        setVisible(true)
      },
      hide: () => {
        skipRestore.value = true
        setVisible(false)
      }
    })

    const setVisible = (visible: boolean) => {
      if (props.disabled && visible) return

      if (visible && !currentVisible.value) {
        previousActiveElement.value = triggerRef.value
      }

      if (props.open === undefined) {
        internalVisible.value = visible
      }
      emit('update:open', visible)
      emit('open-change', visible)

      if (visible) {
        const edge = focusEdge.value
        focusEdge.value = null
        if (!edge) return
        nextTick(() => {
          if (floatingRef.value) focusMenuItem(floatingRef.value, edge)
        })
        return
      }

      hoverController.cancel()
      if (!skipRestore.value) {
        restoreFocus(previousActiveElement.value)
      }
      previousActiveElement.value = null
      skipRestore.value = false
    }

    watch(currentVisible, (visible) => {
      if (!visible) return
      const edge = focusEdge.value
      if (!edge) return
      focusEdge.value = null
      nextTick(() => {
        if (floatingRef.value) focusMenuItem(floatingRef.value, edge)
      })
    })

    const handleItemClick = () => {
      skipRestore.value = false
      setVisible(false)
    }

    const handleMouseEnter = () => {
      if (props.trigger !== 'hover' || props.disabled) return
      hoverController.enter()
    }

    const handleMouseLeave = () => {
      if (props.trigger !== 'hover') return
      hoverController.leave()
    }

    const handleClick = () => {
      if (props.disabled) return
      if (triggerRef.value?.getAttribute('aria-disabled') === 'true') return
      if (props.trigger === 'hover') hoverController.cancel()
      openIntent.value = 'menu'
      setVisible(!currentVisible.value)
    }

    const handleTriggerKeyDown = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent
      if (isTextEditingTarget(keyboardEvent.target)) return
      const action = getOverlayTriggerKeyboardAction(keyboardEvent, {
        kind: 'menu',
        open: currentVisible.value,
        disabled: props.disabled
      })
      if (!action) return
      keyboardEvent.preventDefault()
      hoverController.cancel()
      if (action === 'close') {
        setVisible(false)
        return
      }
      const edge = action === 'open-last' ? 'last' : 'first'
      focusEdge.value = edge
      openIntent.value = 'menu'
      if (!currentVisible.value) {
        setVisible(true)
        return
      }
      if (floatingRef.value) focusMenuItem(floatingRef.value, edge)
    }

    const typeahead = createTypeaheadHighlight()

    const handleMenuKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        skipRestore.value = true
        setVisible(false)
        return
      }
      if (isTextEditingTarget(event.target)) return
      if (!floatingRef.value) return
      const highlight = typeahead.push(event.key, itemLabels(floatingRef.value), -1)
      if (highlight && highlight.index >= 0) {
        event.preventDefault()
        const nodes = Array.from(
          floatingRef.value.querySelectorAll<HTMLElement>('[role^="menuitem"]')
        )
        markTypeaheadMatch(nodes, highlight.index)
        nodes[highlight.index]?.focus()
        return
      }
      handleMenuNavigation(floatingRef.value, event)
    }

    const portalEnabled = computed(() => props.portal)
    const overlay = useVueAnchoredOverlay({
      referenceRef: triggerRef,
      floatingRef,
      enabled: currentVisible,
      placement: () => props.placement,
      offset: () => props.offset,
      portal: portalEnabled,
      containerRef,
      dismissOnOutside: true,
      dismissOnEscape: true,
      onDismiss: () => {
        skipRestore.value = false
        setVisible(false)
      }
    })

    onBeforeUnmount(() => hoverController.dispose())

    const containerClasses = computed(() =>
      classNames(
        getDropdownContainerClasses(),
        'tiger-dropdown-container',
        props.className,
        coerceClassValue(attrsClass)
      )
    )

    const mergedStyle = computed(() => mergeStyleValues(attrsStyle, props.style))
    const triggerClasses = computed(() => getDropdownTriggerClasses(props.disabled))
    const menuWrapperClasses = computed(() =>
      classNames(overlay.floatingClasses.value, DROPDOWN_ENTER_CLASS)
    )

    const dropdownContext = reactive<DropdownContext>({
      closeOnClick: props.closeOnClick,
      handleItemClick
    })
    watch(
      () => props.closeOnClick,
      (closeOnClick) => {
        dropdownContext.closeOnClick = closeOnClick
      }
    )
    provide(DropdownContextKey, dropdownContext)

    return () => {
      const defaultSlot = slots.default?.() ?? []
      const triggerSlot = slots.trigger?.({ open: currentVisible.value })

      let triggerNode: VNode | string | number | VNode[] | null = null
      let menuNode: VNode | null = null
      let sawTrigger = false

      if (triggerSlot && triggerSlot.length > 0) {
        triggerNode = triggerSlot.length === 1 ? triggerSlot[0] : triggerSlot
        sawTrigger = true
      }

      if (props.items && props.items.length > 0) {
        menuNode = h(
          DropdownMenu,
          {},
          {
            default: () =>
              renderPopupItems(
                props.items ?? [],
                (key, checked) => {
                  const change = nextPopupMenuCheck(props.items ?? [], key)
                  emit('check', change ?? { key, checked })
                },
                (item) => emit('select', item)
              )
          }
        )
      }

      defaultSlot.forEach((node: VNode) => {
        if (node.type === DropdownMenu) {
          menuNode = node
          return
        }
        if (sawTrigger) {
          if (!slots.trigger) {
            devWarn(
              'Dropdown.extraTrigger',
              'Dropdown only uses the first non-menu child as the trigger.'
            )
          }
          return
        }
        triggerNode = node
        sawTrigger = true
      })

      const chevronNode =
        props.showArrow && !props.asChild
          ? h(
              'svg',
              {
                class: getDropdownChevronClasses(currentVisible.value),
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'aria-hidden': 'true'
              },
              [h('path', { d: DROPDOWN_CHEVRON_PATH })]
            )
          : null

      const triggerAria = getOverlayTriggerAria({
        kind: 'menu',
        open: currentVisible.value,
        controlsId: menuId,
        disabled: props.disabled
      })

      const trigger = renderOverlayTrigger({
        asChild: props.asChild,
        child: triggerNode,
        setTriggerRef: (el) => assignOverlayTriggerRef(triggerRef, el),
        className: props.asChild ? undefined : triggerClasses.value,
        disabled: props.disabled,
        extraChildren: chevronNode,
        aria: triggerAria,
        handlers: {
          onClick: handleClick,
          onKeydown: handleTriggerKeyDown,
          onMouseenter: handleMouseEnter,
          onMouseleave: handleMouseLeave
        }
      })

      const menuWrapper =
        menuNode && currentVisible.value
          ? h(
              'div',
              {
                ref: floatingRef,
                class: menuWrapperClasses.value,
                style: overlay.floatingStyles.value,
                'data-positioned': overlay.positioned.value,
                'data-tiger-dropdown-menu': '',
                onMouseenter: handleMouseEnter,
                onMouseleave: handleMouseLeave,
                onKeydown: handleMenuKeyDown
              },
              [cloneVNode(menuNode as VNode, { id: menuId })]
            )
          : null

      const menu = !menuWrapper
        ? null
        : props.portal
          ? renderVueOverlayTeleport(menuWrapper, overlay.target.value)
          : menuWrapper

      const {
        class: _class,
        style: _style,
        ...restAttrs
      } = attrsRecord as {
        class?: unknown
        style?: unknown
      } & Record<string, unknown>

      return h(
        'div',
        {
          ...restAttrs,
          ref: containerRef,
          class: containerClasses.value,
          style: mergedStyle.value
        },
        [trigger, menu]
      )
    }
  }
})

export default Dropdown
