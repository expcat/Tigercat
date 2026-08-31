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
  onMounted,
  nextTick,
  VNode,
  cloneVNode,
  watch,
  useId
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getDropdownContainerClasses,
  getDropdownTriggerClasses,
  getDropdownChevronClasses,
  getDropdownMenuClasses,
  getDropdownItemClasses,
  injectDropdownStyles,
  DROPDOWN_CHEVRON_PATH,
  DROPDOWN_ENTER_CLASS,
  handleMenuNavigation,
  focusFirstMenuItem,
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
  DropdownItemProps as CoreDropdownItemProps
} from '@expcat/tigercat-core'
import { useVueAnchoredOverlay, renderVueOverlayTeleport } from '../utils/overlay'
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
  emits: ['click'],
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

      const shouldClose = props.closeOnClick ?? context?.closeOnClick ?? true
      if (shouldClose) {
        context?.handleItemClick()
      }
    }

    const itemClasses = computed(() => {
      return classNames(
        getDropdownItemClasses(props.disabled, props.divided),
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

      const isLink = Boolean(props.href) && !props.disabled
      return h(
        isLink ? 'a' : 'button',
        {
          ...restAttrs,
          ...(isLink ? { href: props.href } : { type: 'button' }),
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

export interface VueDropdownProps extends CoreDropdownProps {
  placement?: FloatingPlacement
  offset?: number
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
  emits: ['update:open', 'open-change'],
  setup(props, { slots, emit, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>
    const attrsClass = (attrsRecord as { class?: unknown }).class
    const attrsStyle = (attrsRecord as { style?: unknown }).style

    onMounted(() => injectDropdownStyles())

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
    const skipRestore = ref(false)

    const hoverController = createFloatingHoverDelayController({
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
        if (openIntent.value === 'hover') return
        nextTick(() => {
          if (floatingRef.value) focusFirstMenuItem(floatingRef.value)
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
      if (!visible || openIntent.value === 'hover') return
      nextTick(() => {
        if (floatingRef.value) focusFirstMenuItem(floatingRef.value)
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
      openIntent.value = 'menu'
      if (!currentVisible.value) setVisible(true)
    }

    const handleMenuKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        skipRestore.value = true
        setVisible(false)
        return
      }
      if (floatingRef.value) {
        handleMenuNavigation(floatingRef.value, event)
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
      onDismiss: (reason) => {
        skipRestore.value = reason !== 'escape'
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

      const menuWrapper = menuNode
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
              onKeydown: handleMenuKeyDown,
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
        [trigger, menu]
      )
    }
  }
})

export default Dropdown
