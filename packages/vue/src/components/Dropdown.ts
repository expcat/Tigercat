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
  watch
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
  captureActiveElement,
  restoreFocus,
  type DropdownTrigger,
  type FloatingPlacement
} from '@expcat/tigercat-core'

import type {
  DropdownProps as CoreDropdownProps,
  DropdownMenuProps as CoreDropdownMenuProps,
  DropdownItemProps as CoreDropdownItemProps
} from '@expcat/tigercat-core'
import { useVueAnchoredOverlay, renderVueOverlayTeleport } from '../utils/overlay'

// --- DropdownMenu (child component) ---

export interface VueDropdownMenuProps extends CoreDropdownMenuProps {}

export const DropdownMenu = defineComponent({
  name: 'TigerDropdownMenu',
  inheritAttrs: false,
  props: {
    /**
     * Additional CSS classes
     */
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
          style: mergedStyle.value
        },
        slots.default?.()
      )
    }
  }
})

// Counter for unique menu IDs
let dropdownIdCounter = 0
const createDropdownMenuId = () => `tiger-dropdown-menu-${++dropdownIdCounter}`

// Dropdown context key
export const DropdownContextKey = Symbol('DropdownContext')

// Dropdown context interface
export interface DropdownContext {
  closeOnClick: boolean
  handleItemClick: () => void
}

// --- DropdownItem (child component) ---

export type VueDropdownItemProps = CoreDropdownItemProps

export const DropdownItem = defineComponent({
  name: 'TigerDropdownItem',
  inheritAttrs: false,
  props: {
    /**
     * Whether the item is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Whether the item is divided from previous item
     * @default false
     */
    divided: {
      type: Boolean,
      default: false
    },
    /**
     * Additional CSS classes
     */
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

// --- Dropdown (parent component) ---

export interface VueDropdownProps extends CoreDropdownProps {
  /**
   * Dropdown placement relative to trigger
   * @default 'bottom-start'
   */
  placement?: FloatingPlacement
  /**
   * Offset distance from trigger element
   * @default 4
   */
  offset?: number
}

export const Dropdown = defineComponent({
  name: 'TigerDropdown',
  inheritAttrs: false,
  props: {
    /**
     * Trigger mode - click or hover
     * @default 'hover'
     */
    trigger: {
      type: String as PropType<DropdownTrigger>,
      default: 'hover' as DropdownTrigger
    },
    /**
     * Dropdown placement relative to trigger
     * @default 'bottom-start'
     */
    placement: {
      type: String as PropType<FloatingPlacement>,
      default: 'bottom-start' as FloatingPlacement
    },
    /**
     * Offset distance from trigger element
     * @default 4
     */
    offset: {
      type: Number,
      default: 4
    },
    /**
     * Whether the dropdown is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Whether the dropdown is open (controlled mode)
     */
    open: {
      type: Boolean,
      default: undefined
    },
    /**
     * Default open state (uncontrolled mode)
     * @default false
     */
    defaultOpen: {
      type: Boolean,
      default: false
    },
    /**
     * Whether to close dropdown on menu item click
     * @default true
     */
    closeOnClick: {
      type: Boolean,
      default: true
    },
    /**
     * Whether to show the dropdown arrow/chevron indicator
     * @default true
     */
    showArrow: {
      type: Boolean,
      default: true
    },
    /**
     * Render the menu into document.body (Teleport) so it is not clipped or
     * covered by overflow/sticky ancestors (e.g. fixed table columns).
     * @default true
     */
    portal: {
      type: Boolean,
      default: true
    },
    /**
     * Additional CSS classes
     */
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

    // Inject animation styles
    onMounted(() => injectDropdownStyles())

    // Unique ID for menu a11y
    const menuId = createDropdownMenuId()

    // Previous active element for focus restore
    const previousActiveElement = ref<HTMLElement | null>(null)

    // Internal state for uncontrolled mode
    const internalVisible = ref(props.defaultOpen)

    // Computed visible state (controlled or uncontrolled)
    const currentVisible = computed(() =>
      props.open !== undefined ? props.open : internalVisible.value
    )

    // Refs for Floating UI positioning
    const containerRef = ref<HTMLElement | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)
    const floatingRef = ref<HTMLElement | null>(null)

    const setVisible = (visible: boolean) => {
      if (props.disabled && visible) return

      // Capture focus before opening
      if (visible && !currentVisible.value) {
        previousActiveElement.value = captureActiveElement()
      }

      if (props.open === undefined) {
        internalVisible.value = visible
      }
      emit('update:open', visible)
      emit('open-change', visible)

      // Focus management
      if (visible) {
        nextTick(() => {
          if (floatingRef.value) {
            focusFirstMenuItem(floatingRef.value)
          }
        })
      } else {
        restoreFocus(previousActiveElement.value)
        previousActiveElement.value = null
      }
    }

    const handleItemClick = () => {
      if (props.closeOnClick) setVisible(false)
    }

    let hoverTimer: ReturnType<typeof setTimeout> | null = null

    const handleMouseEnter = () => {
      if (props.trigger !== 'hover') return
      if (hoverTimer) clearTimeout(hoverTimer)
      hoverTimer = setTimeout(() => setVisible(true), 100)
    }

    const handleMouseLeave = () => {
      if (props.trigger !== 'hover') return
      if (hoverTimer) clearTimeout(hoverTimer)
      hoverTimer = setTimeout(() => setVisible(false), 150)
    }

    const handleClick = () => {
      if (props.trigger !== 'click') return
      setVisible(!currentVisible.value)
    }

    const handleMenuKeyDown = (event: KeyboardEvent) => {
      if (floatingRef.value) {
        handleMenuNavigation(floatingRef.value, event)
      }
    }

    const clickOutsideEnabled = computed(() => props.trigger === 'click')
    const portalEnabled = computed(() => props.portal)
    const overlay = useVueAnchoredOverlay({
      referenceRef: triggerRef,
      floatingRef,
      enabled: currentVisible,
      placement: props.placement,
      offset: props.offset,
      portal: portalEnabled,
      containerRef,
      dismissOnOutside: clickOutsideEnabled,
      dismissOnEscape: true,
      onDismiss: () => setVisible(false)
    })

    onBeforeUnmount(() => {
      if (hoverTimer) clearTimeout(hoverTimer)
    })

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

    // Provide a reactive context so items see dynamic `closeOnClick` changes
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
      const defaultSlot = slots.default?.()
      const triggerSlot = slots.trigger?.({ open: currentVisible.value })
      if (
        (!defaultSlot || defaultSlot.length === 0) &&
        (!triggerSlot || triggerSlot.length === 0)
      ) {
        return null
      }

      let triggerNode: VNode | null = null
      let menuNode: VNode | null = null

      // The `trigger` scoped slot (receives `{ open }`) supplies the trigger so
      // consumers can style/render it by open state without attribute-selector
      // hacks; the menu is still taken from the default slot.
      if (triggerSlot && triggerSlot.length > 0) {
        triggerNode = triggerSlot.length === 1 ? triggerSlot[0] : (h('span', triggerSlot) as VNode)
      }

      defaultSlot?.forEach((node: VNode) => {
        if (node.type === DropdownMenu) {
          menuNode = node
          return
        }
        if (!triggerSlot) {
          triggerNode = node
        }
      })

      const chevronNode = props.showArrow
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

      const trigger = triggerNode
        ? h(
            'div',
            {
              ref: triggerRef,
              class: triggerClasses.value,
              onClick: handleClick,
              onMouseenter: handleMouseEnter,
              onMouseleave: handleMouseLeave,
              'aria-haspopup': 'menu',
              'aria-expanded': currentVisible.value,
              'aria-controls': currentVisible.value ? menuId : undefined,
              'data-state': currentVisible.value ? 'open' : 'closed'
            },
            [triggerNode, chevronNode]
          )
        : null

      // Clone menuNode with id for aria-controls
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
