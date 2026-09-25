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
  VNode,
  cloneVNode,
  watch,
  useId,
  type ComputedRef
} from 'vue'
import {
  classNames,
  getSecureRel,
  resolveLinkHref,
  coerceClassValue,
  mergeStyleValues,
  getContextMenuContainerClasses,
  getContextMenuTriggerClasses,
  getContextMenuMenuClasses,
  getDropdownSeparatorClasses,
  getContextMenuItemClasses,
  getContextMenuSubTriggerClasses,
  getContextMenuSubChevronClasses,
  createContextMenuVirtualReference,
  getContextMenuOpenPoint,
  getContextMenuSubKeys,
  getContextMenuSubPlacement,
  getOverlayTriggerAria,
  type ContextMenuVirtualReference,
  CONTEXT_MENU_ENTER_CLASS,
  CONTEXT_MENU_SUB_HIDE_DELAY_MS,
  CONTEXT_MENU_SUB_CHEVRON_PATH,
  isContextMenuKeyboardEvent,
  resolvePopupMenuItemType,
  popupMenuItemHref,
  popupMenuItemCloses,
  popupMenuItemRole,
  popupMenuAccessibleName,
  getPopupMenuItemClasses,
  getPopupMenuShortcutClasses,
  nextPopupMenuCheck,
  navLabels,
  createTypeaheadHighlight,
  markTypeaheadMatch,
  type PopupMenuItem,
  handleMenuNavigation,
  focusFirstMenuItem,
  captureActiveElement,
  restoreFocus,
  type ContextMenuPoint,
  type FloatingPlacement
} from '@expcat/tigercat-core'

import type {
  ContextMenuProps as CoreContextMenuProps,
  ContextMenuMenuProps as CoreContextMenuMenuProps,
  ContextMenuItemProps as CoreContextMenuItemProps,
  ContextMenuSubProps as CoreContextMenuSubProps
} from '@expcat/tigercat-core'
import { useVueAnchoredOverlay } from '../utils/overlay'
import { renderVueOverlayOutlet } from '../utils/overlay-outlet'
import { assignOverlayTriggerRef, renderOverlayTrigger } from '../utils/overlay-trigger'

export interface VueContextMenuMenuProps extends CoreContextMenuMenuProps {}

export const ContextMenuMenu = defineComponent({
  name: 'TigerContextMenuMenu',
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
      classNames(getContextMenuMenuClasses(), props.className, coerceClassValue(attrsClass))
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
          style: mergedStyle.value
        },
        slots.default?.()
      )
    }
  }
})

export const ContextMenuContextKey = Symbol('ContextMenuContext')

export interface ContextMenuContext {
  closeOnClick: boolean
  handleItemClick: () => void
  portal: ComputedRef<boolean>
  visible: ComputedRef<boolean>
}

export type VueContextMenuItemProps = CoreContextMenuItemProps

export const ContextMenuItem = defineComponent({
  name: 'TigerContextMenuItem',
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
    href: {
      type: String,
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
  emits: ['click'],
  setup(props, { slots, emit, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>
    const attrsClass = (attrsRecord as { class?: unknown }).class
    const attrsStyle = (attrsRecord as { style?: unknown }).style

    const context = inject<ContextMenuContext | null>(ContextMenuContextKey, null)

    const handleClick = (event: MouseEvent) => {
      if (props.disabled) {
        event.preventDefault()
        return
      }

      emit('click', event)

      if (context?.closeOnClick) {
        context.handleItemClick()
      }
    }

    const itemClasses = computed(() =>
      classNames(
        getContextMenuItemClasses(props.disabled, props.divided),
        props.className,
        coerceClassValue(attrsClass)
      )
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
          role: 'menuitem',
          tabindex: -1,
          'aria-disabled': props.disabled || undefined,
          disabled: isLink ? undefined : props.disabled,
          onClick: handleClick,
          style: mergedStyle.value
        },
        slots.default?.()
      )
    }
  }
})

export interface VueContextMenuSubProps extends CoreContextMenuSubProps {}

export const ContextMenuSub = defineComponent({
  name: 'TigerContextMenuSub',
  inheritAttrs: false,
  props: {
    itemKey: {
      type: [String, Number] as PropType<string | number>,
      default: undefined
    },
    title: {
      type: String,
      default: ''
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
    const attrsClass = (attrsRecord as { class?: unknown }).class
    const attrsStyle = (attrsRecord as { style?: unknown }).style

    const context = inject<ContextMenuContext | null>(ContextMenuContextKey, null)

    const isHovered = ref(false)
    const isOpenByKeyboard = ref(false)
    const titleRef = ref<HTMLElement | null>(null)
    const popupRef = ref<HTMLElement | null>(null)
    let popupCloseTimer: ReturnType<typeof setTimeout> | null = null

    const isExpanded = computed(() => isHovered.value || isOpenByKeyboard.value)
    const portalEnabled = computed(() => Boolean(context?.portal.value))

    const subMenuId = `tiger-context-menu-sub-${useId()}`

    const overlay = useVueAnchoredOverlay({
      referenceRef: titleRef,
      floatingRef: popupRef,
      enabled: computed(() => Boolean(context) && isExpanded.value && !props.disabled),
      placement: () =>
        getContextMenuSubPlacement(
          titleRef.value?.closest('[dir]')?.getAttribute('dir') ??
            (typeof document === 'undefined'
              ? undefined
              : document.documentElement.getAttribute('dir'))
        ),
      offset: 4,
      portal: portalEnabled,
      dismissOnEscape: true,
      onDismiss: () => {
        isOpenByKeyboard.value = false
        isHovered.value = false
      }
    })

    watch(
      () => context?.visible.value,
      (visible) => {
        if (!visible) {
          isHovered.value = false
          isOpenByKeyboard.value = false
        }
      }
    )

    onBeforeUnmount(() => {
      if (popupCloseTimer) clearTimeout(popupCloseTimer)
    })

    const clearCloseTimer = () => {
      if (popupCloseTimer) {
        clearTimeout(popupCloseTimer)
        popupCloseTimer = null
      }
    }

    const handleMouseEnter = () => {
      if (props.disabled) return
      clearCloseTimer()
      isHovered.value = true
    }

    const handleMouseLeave = () => {
      const close = () => {
        isHovered.value = false
        isOpenByKeyboard.value = false
      }

      if (portalEnabled.value) {
        popupCloseTimer = setTimeout(close, CONTEXT_MENU_SUB_HIDE_DELAY_MS)
        return
      }

      close()
    }

    const focusPopupFirstItem = () => {
      nextTick(() => {
        if (popupRef.value) focusFirstMenuItem(popupRef.value)
      })
    }

    const handleTitleKeyDown = (event: KeyboardEvent) => {
      if (props.disabled) return

      const dir =
        titleRef.value?.closest('[dir]')?.getAttribute('dir') ??
        document.documentElement.getAttribute('dir')
      const { openKey, closeKey } = getContextMenuSubKeys(dir)

      if (event.key === openKey || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        event.stopPropagation()
        isOpenByKeyboard.value = true
        isHovered.value = true
        focusPopupFirstItem()
        return
      }

      if (event.key === closeKey || event.key === 'Escape') {
        if (isExpanded.value) {
          event.preventDefault()
          event.stopPropagation()
          isOpenByKeyboard.value = false
          isHovered.value = false
          titleRef.value?.focus()
        }
      }
    }

    const handlePopupKeyDown = (event: KeyboardEvent) => {
      if (popupRef.value) {
        handleMenuNavigation(popupRef.value, event)
      }

      const dir =
        (event.currentTarget as HTMLElement | null)?.closest('[dir]')?.getAttribute('dir') ??
        document.documentElement.getAttribute('dir')
      const { closeKey } = getContextMenuSubKeys(dir)
      if (event.key === closeKey || event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        isOpenByKeyboard.value = false
        isHovered.value = false
        titleRef.value?.focus()
      }
    }

    const handlePopupContextMenu = (event: Event) => {
      event.preventDefault()
    }

    const titleClasses = computed(() =>
      classNames(
        getContextMenuSubTriggerClasses(props.disabled),
        props.className,
        coerceClassValue(attrsClass)
      )
    )

    const mergedStyle = computed(() => mergeStyleValues(attrsStyle, props.style))

    const popupClasses = computed(() =>
      classNames(overlay.floatingClasses.value, CONTEXT_MENU_ENTER_CLASS)
    )

    return () => {
      if (!context) return null

      const {
        class: _class,
        style: _style,
        ...restAttrs
      } = attrsRecord as {
        class?: unknown
        style?: unknown
      } & Record<string, unknown>

      const trigger = h(
        'button',
        {
          ...restAttrs,
          ref: titleRef,
          type: 'button',
          class: titleClasses.value,
          style: mergedStyle.value,
          role: 'menuitem',
          tabindex: -1,
          'aria-haspopup': 'menu',
          'aria-expanded': isExpanded.value,
          'aria-controls': isExpanded.value ? subMenuId : undefined,
          'aria-disabled': props.disabled || undefined,
          'data-state': isExpanded.value ? 'open' : 'closed',
          'data-tiger-context-menu-sub-trigger': '',
          disabled: props.disabled,
          onClick: (event: MouseEvent) => {
            event.preventDefault()
            event.stopPropagation()
            if (props.disabled) return
            if (isExpanded.value) {
              isOpenByKeyboard.value = false
              isHovered.value = false
              return
            }
            isOpenByKeyboard.value = true
            isHovered.value = true
          },
          onMouseenter: handleMouseEnter,
          onKeydown: handleTitleKeyDown
        },
        [
          h('span', { class: 'flex-1 text-start' }, props.title),
          h(
            'svg',
            {
              class: getContextMenuSubChevronClasses(),
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              'aria-hidden': 'true'
            },
            [h('path', { d: CONTEXT_MENU_SUB_CHEVRON_PATH })]
          )
        ]
      )

      const popup = h(
        'div',
        {
          ref: popupRef,
          class: popupClasses.value,
          style: overlay.floatingStyles.value,
          'data-positioned': overlay.positioned.value,
          'data-tiger-context-menu-sub': '',
          onMouseenter: handleMouseEnter,
          onMouseleave: handleMouseLeave,
          onKeydown: handlePopupKeyDown,
          onContextmenu: handlePopupContextMenu
        },
        [
          h(
            'div',
            {
              id: subMenuId,
              class: getContextMenuMenuClasses(),
              role: 'menu'
            },
            slots.default?.()
          )
        ]
      )

      return h(
        'div',
        {
          class: portalEnabled.value ? undefined : 'relative',
          onMouseenter: handleMouseEnter,
          onMouseleave: handleMouseLeave,
          role: 'none'
        },
        [
          trigger,
          isExpanded.value
            ? portalEnabled.value
              ? renderVueOverlayOutlet(subMenuId, popup, overlay.target.value)
              : popup
            : null
        ]
      )
    }
  }
})

export interface VueContextMenuProps extends CoreContextMenuProps {
  /**
   * Menu placement relative to the cursor point
   * @default 'bottom-start'
   */
  placement?: FloatingPlacement
}

export type ContextMenuProps = VueContextMenuProps

export const ContextMenu = defineComponent({
  name: 'TigerContextMenu',
  inheritAttrs: false,
  props: {
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
    portal: {
      type: Boolean,
      default: true
    },
    items: { type: Array as PropType<PopupMenuItem[]>, default: undefined },
    offset: {
      type: Number,
      default: 0
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
    },
    asChild: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:open', 'open-change', 'check'],
  setup(props, { slots, emit, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>
    const attrsClass = (attrsRecord as { class?: unknown }).class
    const attrsStyle = (attrsRecord as { style?: unknown }).style

    onMounted(() => {
      if (currentVisible.value) ensurePoint()
    })

    const menuId = `tiger-context-menu-${useId()}`
    const previousActiveElement = ref<HTMLElement | null>(null)
    const internalVisible = ref(props.defaultOpen)
    const currentVisible = computed(() =>
      props.open !== undefined ? props.open : internalVisible.value
    )

    const containerRef = ref<HTMLElement | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)
    const floatingRef = ref<HTMLElement | null>(null)
    const point = ref<ContextMenuPoint>({ x: 0, y: 0 })
    const pointRevision = computed(() => `${point.value.x},${point.value.y}`)
    const virtualReference = createContextMenuVirtualReference(
      point.value,
      typeof document === 'undefined' ? null : document.documentElement
    ) as ContextMenuVirtualReference
    const positionReferenceRef = ref<ContextMenuVirtualReference | null>(virtualReference)
    watch(point, (next) => virtualReference.setPoint(next), { deep: true })
    const hasExplicitPoint = ref(false)

    const setVisible = (visible: boolean) => {
      if (props.disabled && visible) return

      if (visible && !currentVisible.value) {
        previousActiveElement.value = captureActiveElement()
      }

      if (props.open === undefined) {
        internalVisible.value = visible
      }
      emit('update:open', visible)
      emit('open-change', visible)

      if (visible) {
        nextTick(() => {
          requestAnimationFrame(() => {
            if (floatingRef.value) {
              focusFirstMenuItem(floatingRef.value)
            }
          })
        })
      } else {
        hasExplicitPoint.value = false
        restoreFocus(previousActiveElement.value)
        previousActiveElement.value = null
      }
    }

    const ensurePoint = () => {
      if (hasExplicitPoint.value) return
      point.value = getContextMenuOpenPoint(null, triggerRef.value)
    }

    watch(
      currentVisible,
      (visible) => {
        if (visible) ensurePoint()
      },
      { immediate: true }
    )

    const handleItemClick = () => {
      if (props.closeOnClick) setVisible(false)
    }

    const openAt = (next: ContextMenuPoint) => {
      point.value = next
      hasExplicitPoint.value = true
      setVisible(true)
    }

    const handleContextMenu = (event: MouseEvent) => {
      if (props.disabled) return
      event.preventDefault()
      event.stopPropagation()
      openAt(getContextMenuOpenPoint(event, triggerRef.value))
    }

    const handleTriggerKeyDown = (event: KeyboardEvent) => {
      if (props.disabled || !isContextMenuKeyboardEvent(event)) return
      event.preventDefault()
      openAt(getContextMenuOpenPoint(null, triggerRef.value))
    }

    const typeahead = createTypeaheadHighlight()
    const openSubKey = ref<string | number | null>(null)

    const handleMenuKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setVisible(false)
        return
      }
      if (!floatingRef.value) return
      const labels = Array.from(
        floatingRef.value.querySelectorAll<HTMLElement>('[role^="menuitem"]')
      ).map((node) => node.textContent ?? '')
      const highlight = typeahead.push(event.key, labels, -1)
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

    const handleMenuContextMenu = (event: Event) => {
      event.preventDefault()
    }

    const portalEnabled = computed(() => props.portal)
    const overlay = useVueAnchoredOverlay({
      referenceRef: triggerRef,
      positionReferenceRef,
      revision: pointRevision,
      floatingRef,
      enabled: currentVisible,
      placement: () => props.placement,
      offset: () => props.offset,
      portal: portalEnabled,
      containerRef,
      dismissOnOutside: true,
      dismissOnEscape: true,
      onDismiss: () => setVisible(false)
    })

    const containerClasses = computed(() =>
      classNames(getContextMenuContainerClasses(), props.className, coerceClassValue(attrsClass))
    )

    const mergedStyle = computed(() => mergeStyleValues(attrsStyle, props.style))
    const triggerClasses = computed(() => getContextMenuTriggerClasses(props.disabled))
    const menuWrapperClasses = computed(() =>
      classNames(overlay.floatingClasses.value, CONTEXT_MENU_ENTER_CLASS)
    )
    const contextMenuContext: ContextMenuContext = {
      get closeOnClick() {
        return props.closeOnClick
      },
      handleItemClick,
      portal: portalEnabled,
      visible: currentVisible
    }
    provide(ContextMenuContextKey, contextMenuContext)

    return () => {
      const defaultSlot = slots.default?.() ?? []
      let triggerNodes: VNode[] = []
      let menuNode: VNode | null = null

      const renderPopupBranch = (entries: PopupMenuItem[]): VNode[] =>
        entries.map((item) => {
          const type = resolvePopupMenuItemType(item)
          if (type === 'separator') {
            return h('div', {
              key: item.key,
              role: 'separator',
              class: getDropdownSeparatorClasses()
            })
          }
          if (type === 'submenu') {
            const placement = getContextMenuSubPlacement(
              typeof document === 'undefined' ? 'ltr' : document.documentElement.dir
            )
            return h(
              'div',
              {
                key: item.key,
                class: 'relative',
                onMouseenter: () => {
                  openSubKey.value = item.key
                },
                onMouseleave: () => {
                  if (openSubKey.value === item.key) openSubKey.value = null
                }
              },
              [
                h(
                  'button',
                  {
                    type: 'button',
                    role: 'menuitem',
                    'aria-haspopup': 'menu',
                    'aria-expanded': openSubKey.value === item.key,
                    class: getPopupMenuItemClasses(Boolean(item.disabled), false),
                    'data-tiger-popup-item': ''
                  },
                  item.label
                ),
                openSubKey.value === item.key
                  ? h(
                      'div',
                      {
                        role: 'menu',
                        'data-tiger-popup-submenu': '',
                        class: placement.endsWith('end')
                          ? 'absolute top-0 end-full z-10 min-w-40 p-1'
                          : 'absolute top-0 start-full z-10 min-w-40 p-1'
                      },
                      renderPopupBranch(item.children ?? [])
                    )
                  : null
              ]
            )
          }
          const href = popupMenuItemHref(item)
          const danger = type === 'danger'
          return h(
            href ? 'a' : 'button',
            {
              key: item.key,
              type: href ? undefined : 'button',
              href,
              role: popupMenuItemRole(type),
              'aria-checked':
                type === 'checkbox' || type === 'radio' ? Boolean(item.checked) : undefined,
              'aria-label': danger ? popupMenuAccessibleName(item) : undefined,
              disabled: href ? undefined : item.disabled,
              class: getPopupMenuItemClasses(Boolean(item.disabled), danger),
              'data-tiger-popup-item': '',
              onClick: (event: MouseEvent) => {
                if (item.disabled) {
                  event.preventDefault()
                  return
                }
                if (type === 'checkbox' || type === 'radio') {
                  event.preventDefault()
                  const change = nextPopupMenuCheck(entries, item.key)
                  if (change) emit('check', change)
                  return
                }
                if (popupMenuItemCloses(type)) handleItemClick()
              }
            },
            [
              item.label,
              item.shortcut
                ? h('span', { class: getPopupMenuShortcutClasses() }, item.shortcut)
                : null,
              danger ? h('span', { class: 'sr-only' }, `, ${navLabels.dangerItem}`) : null
            ]
          )
        })

      if (props.items && props.items.length > 0 && !menuNode) {
        menuNode = h(ContextMenuMenu, {}, () => renderPopupBranch(props.items ?? []))
      }

      defaultSlot.forEach((node: VNode) => {
        if (node.type === ContextMenuMenu) {
          menuNode = node
          return
        }
        triggerNodes.push(node)
      })

      const triggerAria = getOverlayTriggerAria({
        kind: 'menu',
        open: currentVisible.value,
        controlsId: menuId,
        disabled: props.disabled
      })

      const trigger = renderOverlayTrigger({
        asChild: props.asChild,
        child: triggerNodes.length === 1 ? triggerNodes[0] : triggerNodes,
        setTriggerRef: (el) => assignOverlayTriggerRef(triggerRef, el),
        className: triggerClasses.value,
        disabled: props.disabled,
        aria: { ...triggerAria, 'data-tiger-context-menu-trigger': '' },
        handlers: {
          onContextmenu: handleContextMenu,
          onKeydown: handleTriggerKeyDown
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
                'data-tiger-context-menu': '',
                onKeydown: handleMenuKeyDown,
                onContextmenu: handleMenuContextMenu
              },
              [cloneVNode(menuNode as VNode, { id: menuId })]
            )
          : null

      const menu = !menuWrapper
        ? null
        : props.portal
          ? renderVueOverlayOutlet(menuId, menuWrapper, overlay.target.value)
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

export default ContextMenu
