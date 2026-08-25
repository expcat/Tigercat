import {
  defineComponent,
  computed,
  h,
  ref,
  provide,
  inject,
  PropType,
  Teleport,
  type ComputedRef,
  type VNode
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  floatButtonBaseClasses,
  floatButtonShapeClasses,
  floatButtonSizeClasses,
  floatButtonTypeClasses,
  floatButtonDisabledClasses,
  floatButtonIconSizeClasses,
  floatButtonPlusIconPath,
  getFloatButtonGroupClasses,
  getViewportOffsetStyle,
  viewportFloatingBaseClasses,
  viewportPlacementClasses,
  type FloatButtonShape,
  type FloatButtonSize,
  type ViewportOffset,
  type ViewportPlacement
} from '@expcat/tigercat-core'

function renderDefaultPlusIcon(size: FloatButtonSize) {
  return h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor',
      'stroke-width': '2',
      class: floatButtonIconSizeClasses[size],
      'aria-hidden': 'true'
    },
    [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: floatButtonPlusIconPath
      })
    ]
  )
}

// Group → child shape inheritance (child's own shape still wins)
const FloatButtonGroupShapeKey = Symbol('FloatButtonGroupShape')

export interface VueFloatButtonProps {
  shape?: FloatButtonShape
  size?: FloatButtonSize
  type?: 'primary' | 'default'
  tooltip?: string
  disabled?: boolean
  ariaLabel?: string
  className?: string
  floating?: boolean
  placement?: ViewportPlacement
  offset?: ViewportOffset
  style?: Record<string, string | number>
}

export const FloatButton = defineComponent({
  name: 'TigerFloatButton',
  inheritAttrs: false,
  props: {
    shape: {
      type: String as PropType<FloatButtonShape>,
      default: undefined
    },
    size: {
      type: String as PropType<FloatButtonSize>,
      default: 'md' as FloatButtonSize
    },
    type: {
      type: String as PropType<'primary' | 'default'>,
      default: 'primary'
    },
    tooltip: {
      type: String,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    ariaLabel: {
      type: String,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    },
    floating: {
      type: Boolean,
      default: false
    },
    placement: {
      type: String as PropType<ViewportPlacement>,
      default: 'bottom-right' as ViewportPlacement
    },
    offset: {
      type: [Number, String, Object] as PropType<ViewportOffset>,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['click'],
  setup(props, { slots, emit, attrs }) {
    const groupShape = inject<ComputedRef<FloatButtonShape | undefined> | undefined>(
      FloatButtonGroupShapeKey,
      undefined
    )
    // Explicit shape wins; otherwise inherit the group shape, else default.
    const resolvedShape = computed<FloatButtonShape>(
      () => props.shape ?? groupShape?.value ?? 'circle'
    )
    const classes = computed(() =>
      classNames(
        floatButtonBaseClasses,
        floatButtonShapeClasses[resolvedShape.value],
        floatButtonSizeClasses[props.size],
        floatButtonTypeClasses[props.type],
        props.disabled && floatButtonDisabledClasses,
        props.floating && viewportFloatingBaseClasses,
        props.floating && viewportPlacementClasses[props.placement],
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    const handleClick = (e: MouseEvent) => {
      if (!props.disabled) {
        emit('click', e)
      }
    }

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const content = slots.default ? slots.default() : renderDefaultPlusIcon(props.size)
      const btn = h(
        'button',
        {
          ...attrs,
          class: classes.value,
          style: mergeStyleValues(
            props.floating ? getViewportOffsetStyle(props.placement, props.offset) : undefined,
            attrsRecord.style,
            props.style
          ),
          type: 'button',
          disabled: props.disabled,
          'aria-label': slots.default
            ? (props.ariaLabel ?? props.tooltip)
            : (props.ariaLabel ?? props.tooltip ?? 'Add'),
          title: props.tooltip,
          onClick: handleClick
        },
        content
      )

      return btn
    }
  }
})

export interface VueFloatButtonGroupProps {
  shape?: FloatButtonShape
  trigger?: 'click' | 'hover'
  open?: boolean
  className?: string
  style?: Record<string, string | number>
  placement?: ViewportPlacement
  offset?: ViewportOffset
  portal?: boolean
}

export const FloatButtonGroup = defineComponent({
  name: 'TigerFloatButtonGroup',
  inheritAttrs: false,
  props: {
    shape: {
      type: String as PropType<FloatButtonShape>,
      default: 'circle' as FloatButtonShape
    },
    trigger: {
      type: String as PropType<'click' | 'hover'>,
      default: 'click'
    },
    open: {
      type: Boolean,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    },
    placement: {
      type: String as PropType<ViewportPlacement>,
      default: 'bottom-right' as ViewportPlacement
    },
    offset: {
      type: [Number, String, Object] as PropType<ViewportOffset>,
      default: undefined
    },
    portal: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:open'],
  setup(props, { slots, emit, attrs }) {
    const internalOpen = ref(false)
    const isOpen = computed(() => props.open ?? internalOpen.value)

    // Share the group shape with child FloatButtons that don't set their own.
    provide(
      FloatButtonGroupShapeKey,
      computed(() => props.shape)
    )

    const toggle = () => {
      const next = !isOpen.value
      internalOpen.value = next
      emit('update:open', next)
    }

    const groupClasses = computed(() =>
      classNames(
        getFloatButtonGroupClasses({
          placement: props.placement,
          portal: props.portal
        }),
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const children: VNode[] = []

      // Trigger button (first child or default icon)
      if (slots.trigger) {
        children.push(
          h('div', { onClick: props.trigger === 'click' ? toggle : undefined }, slots.trigger())
        )
      }

      // Expanded children
      if (isOpen.value && slots.default) {
        const defaultSlot = slots.default()
        for (const node of defaultSlot) {
          children.push(node)
        }
      }

      const groupRoot = h(
        'div',
        {
          ...attrs,
          class: groupClasses.value,
          style: mergeStyleValues(
            getViewportOffsetStyle(props.placement, props.offset),
            attrsRecord.style,
            props.style
          ),
          onMouseenter:
            props.trigger === 'hover'
              ? () => {
                  internalOpen.value = true
                  emit('update:open', true)
                }
              : undefined,
          onMouseleave:
            props.trigger === 'hover'
              ? () => {
                  internalOpen.value = false
                  emit('update:open', false)
                }
              : undefined
        },
        children
      )

      return props.portal ? h(Teleport, { to: 'body' }, [groupRoot]) : groupRoot
    }
  }
})

export default FloatButton
