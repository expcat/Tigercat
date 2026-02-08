import {
  defineComponent,
  computed,
  ref,
  provide,
  PropType,
  h,
  onBeforeUnmount,
  onMounted,
  VNode,
  watch
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getDropdownContainerClasses,
  getDropdownTriggerClasses,
  getDropdownChevronClasses,
  getTransformOrigin,
  injectDropdownStyles,
  DROPDOWN_CHEVRON_PATH,
  DROPDOWN_ENTER_CLASS,
  type DropdownTrigger,
  type FloatingPlacement
} from '@expcat/tigercat-core'

import type { DropdownProps as CoreDropdownProps } from '@expcat/tigercat-core'
import { DropdownMenu } from './DropdownMenu'
import { useVueFloating, useVueClickOutside, useVueEscapeKey } from '../utils/overlay'

// Dropdown context key
export const DropdownContextKey = Symbol('DropdownContext')

// Dropdown context interface
export interface DropdownContext {
  closeOnClick: boolean
  handleItemClick: () => void
}

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
     * Whether the dropdown is visible (controlled mode)
     */
    visible: {
      type: Boolean,
      default: undefined
    },
    /**
     * Default visibility (uncontrolled mode)
     * @default false
     */
    defaultVisible: {
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
  emits: ['update:visible', 'visible-change'],
  setup(props, { slots, emit, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>
    const attrsClass = (attrsRecord as { class?: unknown }).class
    const attrsStyle = (attrsRecord as { style?: unknown }).style

    // Inject animation styles
    onMounted(() => injectDropdownStyles())

    // Internal state for uncontrolled mode
    const internalVisible = ref(props.defaultVisible)

    // Computed visible state (controlled or uncontrolled)
    const currentVisible = computed(() =>
      props.visible !== undefined ? props.visible : internalVisible.value
    )

    // Refs for Floating UI positioning
    const containerRef = ref<HTMLElement | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)
    const floatingRef = ref<HTMLElement | null>(null)

    const setVisible = (visible: boolean) => {
      if (props.disabled && visible) return
      if (props.visible === undefined) {
        internalVisible.value = visible
      }
      emit('update:visible', visible)
      emit('visible-change', visible)
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

    // Floating UI positioning
    const {
      x,
      y,
      placement: currentPlacement
    } = useVueFloating({
      referenceRef: triggerRef,
      floatingRef,
      enabled: currentVisible,
      placement: props.placement,
      offset: props.offset
    })

    const clickOutsideEnabled = computed(() => currentVisible.value && props.trigger === 'click')

    let cleanupClickOutside: (() => void) | null = null
    watch(
      clickOutsideEnabled,
      (enabled) => {
        cleanupClickOutside?.()
        cleanupClickOutside = null
        if (enabled) {
          cleanupClickOutside = useVueClickOutside({
            enabled: currentVisible,
            containerRef,
            onOutsideClick: () => setVisible(false),
            defer: true
          })
        }
      },
      { immediate: true }
    )

    let cleanupEscapeKey: (() => void) | null = null
    watch(
      currentVisible,
      (visible) => {
        cleanupEscapeKey?.()
        cleanupEscapeKey = null
        if (visible) {
          cleanupEscapeKey = useVueEscapeKey({
            enabled: currentVisible,
            onEscape: () => setVisible(false)
          })
        }
      },
      { immediate: true }
    )

    onBeforeUnmount(() => {
      if (hoverTimer) clearTimeout(hoverTimer)
      cleanupClickOutside?.()
      cleanupEscapeKey?.()
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

    const menuWrapperClasses = classNames('absolute z-50', DROPDOWN_ENTER_CLASS)

    const menuWrapperStyles = computed(() => ({
      position: 'absolute' as const,
      left: `${x.value}px`,
      top: `${y.value}px`,
      transformOrigin: getTransformOrigin(currentPlacement.value)
    }))

    // Provide dropdown context
    provide<DropdownContext>(DropdownContextKey, {
      closeOnClick: props.closeOnClick,
      handleItemClick
    })

    return () => {
      const defaultSlot = slots.default?.()
      if (!defaultSlot || defaultSlot.length === 0) return null

      let triggerNode: VNode | null = null
      let menuNode: VNode | null = null

      defaultSlot.forEach((node: VNode) => {
        if (node.type === DropdownMenu) {
          menuNode = node
          return
        }
        triggerNode = node
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
              'aria-expanded': currentVisible.value
            },
            [triggerNode, chevronNode]
          )
        : null

      const menu = menuNode
        ? h(
            'div',
            {
              ref: floatingRef,
              class: menuWrapperClasses,
              style: menuWrapperStyles.value,
              onMouseenter: handleMouseEnter,
              onMouseleave: handleMouseLeave,
              hidden: !currentVisible.value
            },
            menuNode
          )
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
