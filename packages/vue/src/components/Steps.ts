import {
  defineComponent,
  computed,
  inject,
  provide,
  PropType,
  h,
  reactive,
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
  stepFinishIconViewBox,
  stepFinishIconStrokeWidth,
  stepFinishIconPathD,
  type StepsDirection,
  type StepStatus,
  type StepSize
} from '@expcat/tigercat-core'

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
  handleStepClick?: (index: number) => void
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
  className?: string
  style?: Record<string, unknown>
}

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
    const stepsContext = inject<StepsContext>(StepsContextKey, {
      current: 0,
      status: 'process',
      direction: 'horizontal',
      size: 'default',
      simple: false,
      clickable: false
    })

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
      if (slots.icon) {
        return h('div', { class: iconClasses.value }, slots.icon())
      }

      if (props.icon) {
        return h('div', { class: iconClasses.value }, props.icon as unknown as RawChildren)
      }

      if (stepStatus.value === 'finish') {
        return h('div', { class: iconClasses.value, 'aria-hidden': 'true' }, [
          h(
            'svg',
            {
              class: 'w-4 h-4 shrink-0 transition-transform duration-300 animate-fade-in',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': stepFinishIconStrokeWidth,
              viewBox: stepFinishIconViewBox
            },
            [
              h('path', {
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                d: stepFinishIconPathD
              })
            ]
          )
        ])
      }

      return h('div', { class: iconClasses.value }, String(props.stepIndex + 1))
    }

    const renderContent = () => {
      const children = []

      if (stepsContext.clickable) {
        children.push(
          h(
            'button',
            {
              type: 'button',
              class: titleClasses.value,
              onClick: handleClick,
              disabled: props.disabled,
              'aria-disabled': props.disabled || undefined
            },
            props.title
          )
        )
      } else {
        children.push(h('div', { class: titleClasses.value }, props.title))
      }

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

      if (stepsContext.direction === 'vertical') {
        return h(
          'li',
          {
            class: itemClasses.value,
            style: mergedStyle.value,
            'aria-current': props.stepIndex === stepsContext.current ? 'step' : undefined,
            'aria-disabled': props.disabled || undefined,
            ...restAttrs
          },
          [
            h('div', { class: 'relative' }, [renderIcon(), h('div', { class: tailClasses.value })]),
            renderContent()
          ]
        )
      }

      return h(
        'li',
        {
          class: itemClasses.value,
          style: mergedStyle.value,
          'aria-current': props.stepIndex === stepsContext.current ? 'step' : undefined,
          'aria-disabled': props.disabled || undefined,
          ...restAttrs
        },
        [renderIcon(), h('div', { class: tailClasses.value }), renderContent()]
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
    const handleStepClick = (index: number) => {
      if (!props.clickable) {
        return
      }

      emit('update:current', index)
      emit('change', index)
    }

    // Provide steps context to child components via reactive computed refs
    provide<StepsContext>(
      StepsContextKey,
      reactive({
        current: computed(() => props.current),
        status: computed(() => props.status),
        direction: computed(() => props.direction),
        size: computed(() => props.size),
        simple: computed(() => props.simple),
        clickable: computed(() => props.clickable),
        handleStepClick: computed(() => (props.clickable ? handleStepClick : undefined))
      }) as StepsContext
    )

    return () => {
      const children = (slots.default?.() || []) as VNode[]

      const { class: _class, style: _style, ...restAttrs } = attrs as Record<string, unknown>

      // Add step index and isLast props to each step item
      const stepsWithProps = children.map((child, index: number) => {
        const childType = child?.type
        const childName =
          typeof childType === 'object' && childType && 'name' in childType
            ? (childType as { name?: string }).name
            : undefined

        if (childName === 'TigerStepsItem') {
          const childProps = (child.props ?? {}) as Record<string, unknown>
          // `h()` expects `string | Component`, but `VNode.type` is `VNodeTypes`.
          // Narrow here to keep DTS generation happy.
          const stepItemType =
            typeof child.type === 'string' || typeof child.type === 'object'
              ? (child.type as string | Component)
              : 'div'

          return h(
            stepItemType,
            {
              ...childProps,
              stepIndex: index,
              isLast: index === children.length - 1
            },
            (child.children ?? undefined) as unknown as RawChildren | RawSlotsLike
          )
        }
        return child
      })

      return h(
        'ol',
        {
          class: containerClasses.value,
          style: mergedStyle.value,
          ...restAttrs
        },
        stepsWithProps
      )
    }
  }
})

export default Steps
