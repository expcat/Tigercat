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
  type ComputedRef
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getContextMenuContainerClasses,
  getContextMenuTriggerClasses,
  getContextMenuMenuClasses,
  getContextMenuItemClasses,
  getContextMenuSubTriggerClasses,
  getContextMenuSubChevronClasses,
  getContextMenuPointStyle,
  getContextMenuOpenPoint,
  injectContextMenuStyles,
  CONTEXT_MENU_ENTER_CLASS,
  CONTEXT_MENU_SUB_CHEVRON_PATH,
  isContextMenuKeyboardEvent,
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
import { useVueAnchoredOverlay, renderVueOverlayTeleport } from '../utils/overlay'

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

let contextMenuIdCounter = 0
const createContextMenuId = () => `tiger-context-menu-${++contextMenuIdCounter}`

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

      return h(
        'button',
        {
          ...restAttrs,
          type: 'button',
          class: itemClasses.value,
          role: 'menuitem',
          tabindex: -1,
          'aria-disabled': props.disabled,
          disabled: props.disabled,
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

    const overlay = useVueAnchoredOverlay({
      referenceRef: titleRef,
      floatingRef: popupRef,
      enabled: computed(() => Boolean(context) && isExpanded.value && !props.disabled),
      placement: 'right-start',
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
        popupCloseTimer = setTimeout(close, 120)
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

      if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        event.stopPropagation()
        isOpenByKeyboard.value = true
        isHovered.value = true
        focusPopupFirstItem()
        return
      }

      if (event.key === 'ArrowLeft' || event.key === 'Escape') {
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

      if (event.key === 'ArrowLeft' || event.key === 'Escape') {
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
          'aria-disabled': props.disabled || undefined,
          'data-state': isExpanded.value ? 'open' : 'closed',
          'data-tiger-context-menu-sub-trigger': '',
          disabled: props.disabled,
          onClick: (event: MouseEvent) => {
            event.preventDefault()
            event.stopPropagation()
          },
          onMouseenter: handleMouseEnter,
          onKeydown: handleTitleKeyDown
        },
        [
          h('span', { class: 'flex-1 text-left' }, props.title),
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
          hidden: !isExpanded.value,
          onMouseenter: handleMouseEnter,
          onMouseleave: handleMouseLeave,
          onKeydown: handlePopupKeyDown,
          onContextmenu: handlePopupContextMenu
        },
        [
          h(
            'div',
            {
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
        [trigger, renderVueOverlayTeleport(popup, overlay.target.value, !portalEnabled.value)]
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
    }
  },
  emits: ['update:open', 'open-change'],
  setup(props, { slots, emit, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>
    const attrsClass = (attrsRecord as { class?: unknown }).class
    const attrsStyle = (attrsRecord as { style?: unknown }).style

    onMounted(() => {
      injectContextMenuStyles()
      if (currentVisible.value) ensurePoint()
    })

    const menuId = createContextMenuId()
    const previousActiveElement = ref<HTMLElement | null>(null)
    const internalVisible = ref(props.defaultOpen)
    const currentVisible = computed(() =>
      props.open !== undefined ? props.open : internalVisible.value
    )

    const containerRef = ref<HTMLElement | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)
    const pointRef = ref<HTMLElement | null>(null)
    const floatingRef = ref<HTMLElement | null>(null)
    const point = ref<ContextMenuPoint>({ x: 0, y: 0 })
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

    const handleMenuKeyDown = (event: KeyboardEvent) => {
      if (floatingRef.value) {
        handleMenuNavigation(floatingRef.value, event)
      }
    }

    const handleMenuContextMenu = (event: Event) => {
      event.preventDefault()
    }

    const portalEnabled = computed(() => props.portal)
    const overlay = useVueAnchoredOverlay({
      referenceRef: pointRef,
      floatingRef,
      enabled: currentVisible,
      placement: props.placement,
      offset: props.offset,
      portal: portalEnabled,
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
    const pointStyle = computed(() => getContextMenuPointStyle(point.value))

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

      defaultSlot.forEach((node: VNode) => {
        if (node.type === ContextMenuMenu) {
          menuNode = node
          return
        }
        triggerNodes.push(node)
      })

      const trigger = h(
        'div',
        {
          ref: triggerRef,
          class: triggerClasses.value,
          onContextmenu: handleContextMenu,
          onKeydown: handleTriggerKeyDown,
          'aria-haspopup': 'menu',
          'aria-expanded': currentVisible.value,
          'aria-controls': currentVisible.value ? menuId : undefined,
          'data-state': currentVisible.value ? 'open' : 'closed',
          'data-tiger-context-menu-trigger': ''
        },
        triggerNodes
      )

      const pointNode = h('div', {
        ref: pointRef,
        style: pointStyle.value,
        'aria-hidden': 'true',
        'data-tiger-context-menu-point': ''
      })

      const menuWrapper = menuNode
        ? h(
            'div',
            {
              key: `${point.value.x},${point.value.y}`,
              ref: floatingRef,
              class: menuWrapperClasses.value,
              style: overlay.floatingStyles.value,
              'data-positioned': overlay.positioned.value,
              'data-tiger-context-menu': '',
              onKeydown: handleMenuKeyDown,
              onContextmenu: handleMenuContextMenu,
              hidden: !currentVisible.value
            },
            [cloneVNode(menuNode as VNode, { id: menuId })]
          )
        : null

      const menu = menuWrapper
        ? renderVueOverlayTeleport(menuWrapper, overlay.target.value, !props.portal)
        : null

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
        [trigger, pointNode, menu]
      )
    }
  }
})

export default ContextMenu
