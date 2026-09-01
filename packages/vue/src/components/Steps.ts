import {
  defineComponent,
  computed,
  inject,
  provide,
  PropType,
  h,
  reactive,
  ref,
  type VNode,
  type VNodeArrayChildren,
  type Component
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getStepItemClasses,
  getStepIconClasses,
  getStepTailClasses,
  getStepContentClasses,
  getStepTitleClasses,
  getStepDescriptionClasses,
  getStepsContainerClasses,
  calculateStepStatus,
  clampStepCurrent,
  getStepStatusText,
  isStepsItemType,
  mergeTigerLocale,
  getStepsLabels,
  stepFinishIconViewBox,
  stepFinishIconStrokeWidth,
  stepFinishIconPathD,
  type StepsDirection,
  type StepStatus,
  type StepSize,
  type StepItem,
  type TigerLocale,
  type TigerLocaleSteps
} from '@expcat/tigercat-core'
import { flattenElementVNodes } from '../utils/flatten-vnodes'
import { useTigerConfig } from './ConfigProvider'

// Steps context key
export const StepsContextKey = Symbol('StepsContext')

// Steps context interface
export interface StepsContext {
  current: number
  status: StepStatus
  direction: StepsDirection
  size: StepSize
  simple: boolean
  clickable: boolean
  labels: Required<TigerLocaleSteps>
  handleStepClick?: (index: number) => void
}

export function useStepsContext(): StepsContext | undefined {
  return inject<StepsContext>(StepsContextKey)
}

type RawChildren = string | number | boolean | VNode | VNodeArrayChildren | (() => unknown)
type RawSlotsLike = { [name: string]: unknown; $stable?: boolean }

export interface VueStepsProps {
  current?: number
  status?: StepStatus
  direction?: StepsDirection
  size?: StepSize
  simple?: boolean
  clickable?: boolean
  items?: StepItem[]
  className?: string
  style?: Record<string, unknown>
}

export type StepsProps = VueStepsProps
export type StepsItemProps = VueStepsItemProps

export interface VueStepsItemProps {
  title: string
  description?: string
  icon?: unknown
  status?: StepStatus
  disabled?: boolean
  className?: string
  style?: Record<string, unknown>
}

export const StepsItem = defineComponent({
  name: 'TigerStepsItem',
  inheritAttrs: false,
  props: {
    /**
     * Step title
     */
    title: {
      type: String,
      required: true
    },
    /**
     * Step description
     */
    description: {
      type: String,
      default: undefined
    },
    /**
     * Step icon (slot content or custom icon)
     */
    icon: {
      type: [String, Object] as PropType<unknown>,
      default: undefined
    },
    /**
     * Step status (overrides automatic status)
     */
    status: {
      type: String as PropType<StepStatus>,
      default: undefined
    },
    /**
     * Whether the step is disabled
     */
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
    },
    /**
     * Internal prop: step index (automatically set by parent)
     */
    stepIndex: {
      type: Number,
      default: 0
    },
    /**
     * Internal prop: is last step (automatically set by parent)
     */
    isLast: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots, attrs }) {
    const stepsContext = inject<StepsContext>(StepsContextKey)
    if (!stepsContext) {
      throw new Error('StepsItem must be used within a Steps component')
    }

    const stepStatus = computed(() => {
      return calculateStepStatus(
        props.stepIndex,
        stepsContext.current,
        stepsContext.status,
        props.status
      )
    })

    const itemClasses = computed(() => {
      return classNames(
        getStepItemClasses(stepsContext.direction, props.isLast),
        props.className,
        coerceClassValue(attrs.class)
      )
    })

    const iconClasses = computed(() => {
      const hasCustomIcon = !!(props.icon || slots.icon)
      return getStepIconClasses(
        stepStatus.value,
        stepsContext.size,
        stepsContext.simple,
        hasCustomIcon
      )
    })

    const tailClasses = computed(() => {
      return getStepTailClasses(
        stepsContext.direction,
        stepStatus.value,
        props.isLast,
        stepsContext.size,
        stepsContext.simple
      )
    })

    const contentClasses = computed(() => {
      return getStepContentClasses(stepsContext.direction)
    })

    const titleClasses = computed(() => {
      return getStepTitleClasses(
        stepStatus.value,
        stepsContext.size,
        stepsContext.clickable && !props.disabled
      )
    })

    const descriptionClasses = computed(() => {
      return getStepDescriptionClasses(stepStatus.value, stepsContext.size)
    })

    const handleClick = () => {
      if (props.disabled || !stepsContext.handleStepClick) {
        return
      }
      stepsContext.handleStepClick(props.stepIndex)
    }

    const renderIcon = () => {
      let inner: unknown
      if (slots.icon) inner = slots.icon()
      else if (props.icon) inner = props.icon
      else if (stepStatus.value === 'finish') {
        inner = h(
          'svg',
          {
            class: 'w-4 h-4 shrink-0 tiger-animate-fade-in',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': stepFinishIconStrokeWidth,
            viewBox: stepFinishIconViewBox,
            'aria-hidden': 'true'
          },
          [
            h('path', {
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              d: stepFinishIconPathD
            })
          ]
        )
      } else if (stepStatus.value === 'error') inner = h('span', { 'aria-hidden': 'true' }, '!')
      else inner = h('span', { 'aria-hidden': 'true' }, String(props.stepIndex + 1))

      return h('div', { class: iconClasses.value, 'aria-hidden': 'true' }, inner as RawChildren)
    }

    const renderContent = () => {
      const children = [h('div', { class: titleClasses.value }, props.title)]
      if (!stepsContext.simple && (props.description || slots.description)) {
        children.push(
          h(
            'div',
            { class: descriptionClasses.value },
            slots.description ? slots.description() : props.description
          )
        )
      }
      return h('div', { class: contentClasses.value }, children)
    }

    const mergedStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    return () => {
      const { class: _class, style: _style, ...restAttrs } = attrs as Record<string, unknown>

      const body =
        stepsContext.direction === 'vertical'
          ? [
              h('div', { class: 'relative' }, [
                renderIcon(),
                h('div', { class: tailClasses.value })
              ]),
              renderContent(),
              h(
                'span',
                { class: 'sr-only' },
                getStepStatusText(stepStatus.value, stepsContext.labels)
              )
            ]
          : [
              renderIcon(),
              h('div', { class: tailClasses.value }),
              renderContent(),
              h(
                'span',
                { class: 'sr-only' },
                getStepStatusText(stepStatus.value, stepsContext.labels)
              )
            ]

      const isClickable = !!stepsContext.handleStepClick && !props.disabled
      return h(
        'li',
        {
          class: itemClasses.value,
          style: mergedStyle.value,
          'aria-current': props.stepIndex === stepsContext.current ? 'step' : undefined,
          'aria-disabled': props.disabled || undefined,
          ...restAttrs
        },
        isClickable
          ? [
              h(
                'button',
                {
                  type: 'button',
                  class:
                    stepsContext.direction === 'vertical'
                      ? 'flex w-full flex-row items-start bg-transparent p-0 text-start'
                      : 'flex w-full flex-col items-center bg-transparent p-0',
                  onClick: handleClick
                },
                body
              )
            ]
          : body
      )
    }
  }
})

export const Steps = defineComponent({
  name: 'TigerSteps',
  inheritAttrs: false,
  props: {
    /**
     * Current step index (0-based)
     * @default 0
     */
    current: {
      type: Number,
      default: 0
    },
    /**
     * Step status (for current step)
     * @default 'process'
     */
    status: {
      type: String as PropType<StepStatus>,
      default: 'process' as StepStatus
    },
    /**
     * Steps direction/orientation
     * @default 'horizontal'
     */
    direction: {
      type: String as PropType<StepsDirection>,
      default: 'horizontal' as StepsDirection
    },
    /**
     * Step size
     * @default 'default'
     */
    size: {
      type: String as PropType<StepSize>,
      default: 'default' as StepSize
    },
    /**
     * Whether to use simple style (no description, smaller icons)
     * @default false
     */
    simple: {
      type: Boolean,
      default: false
    },
    /**
     * Whether steps are clickable
     * @default false
     */
    clickable: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array as PropType<StepItem[]>,
      default: undefined
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    labels: {
      type: Object as PropType<Partial<TigerLocaleSteps>>,
      default: undefined
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
  emits: ['change', 'update:current'],
  setup(props, { slots, attrs, emit }) {
    const containerClasses = computed(() =>
      classNames(
        getStepsContainerClasses(props.direction),
        props.className,
        coerceClassValue(attrs.class)
      )
    )

    const mergedStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    // Handle step click
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const stepLabels = computed(() => getStepsLabels(mergedLocale.value, props.labels))
    const itemCount = ref(0)

    const handleStepClick = (index: number) => {
      if (!props.clickable) {
        return
      }

      emit('update:current', index)
      emit('change', index)
    }

    provide<StepsContext>(
      StepsContextKey,
      reactive({
        current: computed(() => clampStepCurrent(props.current, itemCount.value)),
        status: computed(() => props.status),
        direction: computed(() => props.direction),
        size: computed(() => props.size),
        simple: computed(() => props.simple),
        clickable: computed(() => props.clickable),
        labels: computed(() => stepLabels.value),
        handleStepClick: computed(() => (props.clickable ? handleStepClick : undefined))
      }) as unknown as StepsContext
    )

    return () => {
      const {
        class: _class,
        style: _style,
        'aria-label': ariaLabelAttr,
        ...restAttrs
      } = attrs as Record<string, unknown>

      let itemVNodes: VNode[]
      if (props.items && props.items.length > 0) {
        itemVNodes = props.items.map((item) =>
          h(StepsItem as unknown as Component, {
            key: item.key ?? item.title,
            title: item.title,
            description: item.description,
            icon: item.icon,
            status: item.status,
            disabled: item.disabled
          })
        )
      } else {
        itemVNodes = flattenElementVNodes(slots.default?.() as VNode[] | undefined).filter(
          (child) => isStepsItemType(child.type, StepsItem)
        )
      }

      itemCount.value = itemVNodes.length

      const stepsWithProps = itemVNodes.map((child, index: number) => {
        const childProps = (child.props ?? {}) as Record<string, unknown>
        const stepItemType =
          typeof child.type === 'string' || typeof child.type === 'object'
            ? (child.type as string | Component)
            : 'div'
        return h(
          stepItemType,
          {
            ...childProps,
            key: child.key ?? index,
            stepIndex: index,
            isLast: index === itemVNodes.length - 1
          },
          (child.children ?? undefined) as unknown as RawChildren | RawSlotsLike
        )
      })

      return h(
        'ol',
        {
          class: containerClasses.value,
          style: mergedStyle.value,
          role: 'list',
          'aria-label':
            typeof ariaLabelAttr === 'string' ? ariaLabelAttr : stepLabels.value.ariaLabel,
          ...restAttrs
        },
        stepsWithProps
      )
    }
  }
})

export default Steps
