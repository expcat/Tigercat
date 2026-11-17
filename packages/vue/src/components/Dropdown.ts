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
  VNode,
  cloneVNode,
  watch,
  useId
} from 'vue'
import {
  callUnknownEventHandler,
  classNames,
  getSecureRel,
  resolveLinkHref,
  coerceClassValue,
  mergeStyleValues,
  getDropdownContainerClasses,
  getDropdownTriggerClasses,
  getDropdownChevronClasses,
  getDropdownMenuClasses,
  getDropdownSeparatorClasses,
  getDropdownItemClasses,
  getPopupMenuItemClasses,
  getPopupMenuShortcutClasses,
  popupMenuItemCloses,
  popupMenuItemHref,
  resolvePopupMenuItemType,
  nextPopupMenuCheck,
  getContextMenuSubKeys,
  getContextMenuSubPlacement,
  createTypeaheadHighlight,
  markTypeaheadMatch,
  getNavLabels,
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
import { useTigerConfig } from './tiger-config'

import type {
  DropdownProps as CoreDropdownProps,
  DropdownMenuProps as CoreDropdownMenuProps,
  DropdownItemProps as CoreDropdownItemProps,
  PopupMenuCheckChange,
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
    const attrsStyle = (attrsRecord as { style?: unknown }).style

    const mergedStyle = computed(() => mergeStyleValues(attrsStyle, props.style))

    return () => {
      const {
        class: attrsClass,
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
          class: classNames(
            getDropdownMenuClasses(),
            props.className,
            coerceClassValue(attrsClass)
          ),
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
  portal: boolean
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
    const tigerConfig = useTigerConfig()
    const attrsRecord = attrs as Record<string, unknown>
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
        emit('check', props.itemType === 'checkbox' ? !props.checked : true)
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

    const mergedStyle = computed(() => mergeStyleValues(attrsStyle, props.style))

    return () => {
      const {
        class: attrsClass,
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
          class: classNames(
            props.danger || props.itemType === 'danger'
              ? getPopupMenuItemClasses(props.disabled, true, props.divided)
              : getDropdownItemClasses(props.disabled, props.divided),
            props.className,
            coerceClassValue(attrsClass)
          ),
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
          onKeydown: (event: KeyboardEvent) => {
            handleKeyDown(event)
            callUnknownEventHandler(restAttrs.onKeydown, event)
          },
          style: mergedStyle.value
        },
        [
          slots.default?.(),
          props.shortcut
            ? h('span', { class: getPopupMenuShortcutClasses() }, props.shortcut)
            : null,
          props.danger || props.itemType === 'danger'
            ? h(
                'span',
                { class: 'sr-only' },
                `, ${getNavLabels(tigerConfig.value.locale).dangerItem}`
              )
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

function renderPopupItems(
  items: PopupMenuItem[],
  context: DropdownContext,
  emitCheck: (change: PopupMenuCheckChange) => void,
  emitSelect?: (item: PopupMenuItem) => void
): VNode[] {
  return items.map((item) => {
    const type = resolvePopupMenuItemType(item)
    if (type === 'separator') {
      return h('div', {
        key: item.key,
        role: 'separator',
        class: getDropdownSeparatorClasses()
      })
    }
    if (type === 'submenu') {
      return h(
        Dropdown,
        {
          key: item.key,
          items: item.children,
          disabled: item.disabled,
          closeOnClick: context.closeOnClick,
          portal: context.portal,
          onCheck: emitCheck,
          onSelect: (selected: PopupMenuItem) => {
            emitSelect?.(selected)
            if (context.closeOnClick && popupMenuItemCloses(resolvePopupMenuItemType(selected))) {
              context.handleItemClick()
            }
          },
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
        onCheck: (checked: boolean) =>
          emitCheck(nextPopupMenuCheck(items, item.key) ?? { key: item.key, checked }),
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
    const attrsStyle = (attrsRecord as { style?: unknown }).style
    const parentMenu = inject<DropdownContext | null>(DropdownContextKey, null)

    const menuId = `tiger-dropdown-menu-${useId()}`
    const previousActiveElement = ref<HTMLElement | null>(null)
    const internalVisible = ref(props.defaultOpen)
    const currentVisible = computed(() =>
      props.open !== undefined ? props.open : internalVisible.value
    )

    const containerRef = ref<HTMLElement | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)
    const floatingRef = ref<HTMLElement | null>(null)
    const openIntent = ref<'menu' | 'hover' | 'focus'>('menu')
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

      if (visible) return

      hoverController.cancel()
      if (!skipRestore.value) {
        skipRestore.value = true
        restoreFocus(previousActiveElement.value)
      }
      previousActiveElement.value = null
      skipRestore.value = false
    }

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
      const visible =
        !currentVisible.value || (props.trigger === 'hover' && openIntent.value === 'focus')
      openIntent.value = 'menu'
      setVisible(visible)
    }

    const handleFocus = () => {
      if (props.trigger !== 'hover' || props.disabled || skipRestore.value) return
      hoverController.cancel()
      if (currentVisible.value) return
      openIntent.value = 'focus'
      setVisible(true)
    }

    const handleTriggerKeyDown = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent
      if (keyboardEvent.defaultPrevented) return
      if (isTextEditingTarget(keyboardEvent.target)) return
      const host = keyboardEvent.currentTarget as HTMLElement | null
      const dir =
        host?.closest('[dir]')?.getAttribute('dir') ??
        (typeof document === 'undefined' ? null : document.documentElement.getAttribute('dir'))
      const action = getOverlayTriggerKeyboardAction(keyboardEvent, {
        kind: 'menu',
        open: currentVisible.value,
        disabled: props.disabled,
        submenu: parentMenu != null,
        dir
      })
      if (!action) return
      keyboardEvent.preventDefault()
      keyboardEvent.stopPropagation()
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
    }

    const typeahead = createTypeaheadHighlight()

    const handleMenuKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      if (event.key === 'Tab') {
        skipRestore.value = true
        setVisible(false)
        return
      }
      if (isTextEditingTarget(event.target)) return
      if (parentMenu) {
        const dir =
          triggerRef.value?.closest('[dir]')?.getAttribute('dir') ??
          (typeof document === 'undefined' ? null : document.documentElement.getAttribute('dir'))
        const { closeKey } = getContextMenuSubKeys(dir)
        if (event.key === closeKey || event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          skipRestore.value = false
          setVisible(false)
          return
        }
      }
      if (!floatingRef.value) return
      const nodes = Array.from(
        floatingRef.value.querySelectorAll<HTMLElement>('[role^="menuitem"]')
      )
      const highlight = typeahead.push(
        event.key,
        nodes.map((node) => node.textContent ?? ''),
        -1,
        nodes.map((node) => node.getAttribute('aria-disabled') === 'true')
      )
      if (highlight && highlight.index >= 0) {
        event.preventDefault()
        event.stopPropagation()
        markTypeaheadMatch(nodes, highlight.index)
        nodes[highlight.index]?.focus()
        return
      }
      if (handleMenuNavigation(floatingRef.value, event)) {
        event.stopPropagation()
      }
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

    watch(
      [currentVisible, overlay.positioned, focusEdge],
      ([visible, positioned, edge]) => {
        if (!visible) {
          focusEdge.value = null
          return
        }
        if (!positioned || !edge || !floatingRef.value) return
        focusEdge.value = null
        focusMenuItem(floatingRef.value, edge, true)
      },
      { flush: 'post' }
    )

    onBeforeUnmount(() => hoverController.dispose())

    const mergedStyle = computed(() => mergeStyleValues(attrsStyle, props.style))
    const triggerClasses = computed(() => getDropdownTriggerClasses(props.disabled))
    const menuWrapperClasses = computed(() =>
      classNames(overlay.floatingClasses.value, DROPDOWN_ENTER_CLASS)
    )

    const dropdownContext = reactive<DropdownContext>({
      closeOnClick: props.closeOnClick,
      handleItemClick,
      portal: props.portal
    })
    watch(
      () => [props.closeOnClick, props.portal] as const,
      ([closeOnClick, portal]) => {
        dropdownContext.closeOnClick = closeOnClick
        dropdownContext.portal = portal
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
                dropdownContext,
                (change) => emit('check', change),
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
      const triggerProps = parentMenu
        ? { ...triggerAria, role: 'menuitem', tabindex: '-1' }
        : triggerAria

      const trigger = renderOverlayTrigger({
        asChild: props.asChild,
        child: triggerNode,
        setTriggerRef: (el) => assignOverlayTriggerRef(triggerRef, el),
        className: props.asChild ? undefined : triggerClasses.value,
        disabled: props.disabled,
        extraChildren: chevronNode,
        aria: triggerProps,
        handlers: {
          onClick: handleClick,
          onFocus: handleFocus,
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
        class: attrsClass,
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
          class: classNames(
            getDropdownContainerClasses(),
            'tiger-dropdown-container',
            props.className,
            coerceClassValue(attrsClass)
          ),
          style: mergedStyle.value
        },
        [trigger, menu]
      )
    }
  }
})

export default Dropdown
