import {
  defineComponent,
  computed,
  h,
  ref,
  provide,
  inject,
  onMounted,
  onBeforeUnmount,
  cloneVNode,
  isVNode,
  useId,
  Comment,
  Fragment,
  Text,
  type PropType,
  type ComputedRef,
  type VNode
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  floatButtonIconSizeClasses,
  floatButtonPlusIconPath,
  floatButtonGroupExpandClasses,
  getFloatButtonClasses,
  getFloatButtonGroupClasses,
  getFloatButtonLabels,
  getFloatButtonOffsetStyle,
  mergeTigerLocale,
  resolveFloatButtonAriaLabel,
  resolveFloatButtonShape,
  shouldMergeOverlayTriggerChild,
  type FloatButtonShape,
  type FloatButtonSize,
  type ViewportOffset,
  type ViewportPlacement,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { renderVueBodyTeleport, useVueClickOutside, useVueEscapeKey } from '../utils/overlay'

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

function vnodesHaveVisibleText(nodes: VNode[] | undefined): boolean {
  if (!nodes) return false
  for (const node of nodes) {
    if (!node || node.type === Comment) continue
    if (node.type === Text) {
      if (String(node.children ?? '').trim()) return true
      continue
    }
    const ariaHidden = (node.props as { 'aria-hidden'?: unknown } | null)?.['aria-hidden']
    if (node.type === 'svg' || ariaHidden === true || ariaHidden === 'true') continue
    if (typeof node.children === 'string' && node.children.trim()) return true
    if (node.type === Fragment && Array.isArray(node.children)) {
      if (vnodesHaveVisibleText(node.children as VNode[])) return true
      continue
    }
    if (Array.isArray(node.children) && vnodesHaveVisibleText(node.children as VNode[])) {
      return true
    }
  }
  return false
}

const FloatButtonGroupShapeKey = Symbol('FloatButtonGroupShape')
const FloatButtonGroupFlagKey = Symbol('FloatButtonGroupFlag')

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
  locale?: Partial<TigerLocale>
}

export type FloatButtonProps = VueFloatButtonProps

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
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    }
  },
  emits: ['click'],
  setup(props, { slots, emit, attrs }) {
    const config = useTigerConfig()
    const groupShape = inject<ComputedRef<FloatButtonShape | undefined> | undefined>(
      FloatButtonGroupShapeKey,
      undefined
    )
    const inGroup = inject(FloatButtonGroupFlagKey, false)
    const resolvedShape = computed<FloatButtonShape>(() =>
      resolveFloatButtonShape(props.shape, groupShape?.value)
    )
    const labels = computed(() =>
      getFloatButtonLabels(mergeTigerLocale(config.value.locale, props.locale))
    )
    const classes = computed(() =>
      getFloatButtonClasses({
        shape: resolvedShape.value,
        size: props.size,
        type: props.type,
        disabled: props.disabled,
        floating: props.floating,
        inGroup,
        placement: props.placement,
        className: classNames(
          props.className,
          coerceClassValue((attrs as Record<string, unknown>).class)
        )
      })
    )

    const handleClick = (e: MouseEvent) => {
      if (!props.disabled) emit('click', e)
    }

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const slotContent = slots.default?.()
      const hasSlot = Boolean(slotContent && slotContent.length)
      const content = hasSlot ? slotContent : [renderDefaultPlusIcon(props.size)]
      const ariaLabel = resolveFloatButtonAriaLabel({
        ariaLabel: props.ariaLabel,
        tooltip: props.tooltip,
        hasVisibleText: vnodesHaveVisibleText(hasSlot ? slotContent : undefined),
        localeLabel: labels.value.ariaLabel
      })

      return h(
        'button',
        {
          ...attrs,
          class: classes.value,
          style: mergeStyleValues(
            getFloatButtonOffsetStyle(props.placement, props.offset, props.floating && !inGroup),
            attrsRecord.style,
            props.style
          ),
          type: 'button',
          disabled: props.disabled,
          'aria-label': ariaLabel,
          title: props.tooltip,
          onClick: handleClick
        },
        content
      )
    }
  }
})

export interface VueFloatButtonGroupProps {
  shape?: FloatButtonShape
  trigger?: 'click' | 'hover'
  open?: boolean
  defaultOpen?: boolean
  closeOnAction?: boolean
  className?: string
  style?: Record<string, string | number>
  placement?: ViewportPlacement
  offset?: ViewportOffset
  portal?: boolean
}

export type FloatButtonGroupProps = VueFloatButtonGroupProps

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
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    },
    defaultOpen: {
      type: Boolean,
      default: false
    },
    closeOnAction: {
      type: Boolean,
      default: true
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
  emits: ['update:open', 'open-change'],
  setup(props, { slots, emit, attrs }) {
    const instanceId = useId()
    const panelId = `tiger-float-group-${instanceId}`
    const groupRef = ref<HTMLElement | null>(null)
    const internalOpen = ref(props.defaultOpen)
    const isOpen = computed(() => props.open ?? internalOpen.value)

    provide(
      FloatButtonGroupShapeKey,
      computed(() => props.shape)
    )
    provide(FloatButtonGroupFlagKey, true)

    const setOpen = (next: boolean) => {
      if (props.open === undefined) internalOpen.value = next
      emit('update:open', next)
      emit('open-change', next)
    }

    const toggle = () => setOpen(!isOpen.value)
    const close = () => setOpen(false)

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

    let cleanupOutside: (() => void) | undefined
    let cleanupEscape: (() => void) | undefined

    onMounted(() => {
      cleanupOutside = useVueClickOutside({
        enabled: isOpen,
        containerRef: groupRef,
        onOutsideClick: close,
        defer: true
      })
      cleanupEscape = useVueEscapeKey({ enabled: isOpen, onEscape: close, layerRef: groupRef })
    })

    onBeforeUnmount(() => {
      cleanupOutside?.()
      cleanupEscape?.()
    })

    const handleActionClick = (event: MouseEvent) => {
      if (!props.closeOnAction) return
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('button, a, [role="button"]')) close()
    }

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const triggerAria = {
        'aria-expanded': isOpen.value,
        'aria-controls': isOpen.value ? panelId : undefined,
        'data-state': isOpen.value ? 'open' : 'closed'
      }

      const triggerNodes = slots.trigger?.()
      let trigger: VNode
      const onTriggerClick = (event: Event) => {
        event.stopPropagation()
        if (props.trigger === 'hover') {
          setOpen(true)
          return
        }
        toggle()
      }

      if (triggerNodes && triggerNodes.length === 1 && isVNode(triggerNodes[0])) {
        const single = triggerNodes[0]
        if (shouldMergeOverlayTriggerChild(true, single.type)) {
          trigger = cloneVNode(single, {
            ...triggerAria,
            onClick: onTriggerClick
          })
        } else {
          trigger = h(
            'button',
            { type: 'button', ...triggerAria, onClick: onTriggerClick },
            triggerNodes
          )
        }
      } else if (triggerNodes && triggerNodes.length > 0) {
        trigger = h(
          'button',
          { type: 'button', ...triggerAria, onClick: onTriggerClick },
          triggerNodes
        )
      } else {
        trigger = h(FloatButton, { ...triggerAria, onClick: onTriggerClick })
      }

      const actions =
        isOpen.value && slots.default
          ? h(
              'div',
              {
                id: panelId,
                role: 'group',
                class: floatButtonGroupExpandClasses,
                onClick: handleActionClick
              },
              slots.default()
            )
          : null

      const groupRoot = h(
        'div',
        {
          ...attrs,
          ref: groupRef,
          class: groupClasses.value,
          style: mergeStyleValues(
            getFloatButtonOffsetStyle(props.placement, props.offset, true),
            attrsRecord.style,
            props.style
          ),
          onMouseenter:
            props.trigger === 'hover'
              ? () => {
                  setOpen(true)
                }
              : undefined,
          onMouseleave:
            props.trigger === 'hover'
              ? () => {
                  setOpen(false)
                }
              : undefined
        },
        [trigger, actions]
      )

      return props.portal ? renderVueBodyTeleport(groupRoot) : groupRoot
    }
  }
})

export default FloatButton
