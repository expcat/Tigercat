import {
  defineComponent,
  computed,
  provide,
  PropType,
  h,
  reactive,
  watch,
  type VNode,
  type VNodeArrayChildren,
  type Component
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getStepsContainerClasses,
  type StepsDirection,
  type StepStatus,
  type StepSize
} from '@tigercat/core'

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
    const attrsRecord = attrs as Record<string, unknown>
    const attrsClass = (attrsRecord as { class?: unknown }).class
    const attrsStyle = (attrsRecord as { style?: unknown }).style

    const containerClasses = computed(() =>
      classNames(
        getStepsContainerClasses(props.direction),
        props.className,
        coerceClassValue(attrsClass)
      )
    )

    const mergedStyle = computed(() => mergeStyleValues(attrsStyle, props.style))

    // Handle step click
    const handleStepClick = (index: number) => {
      if (!props.clickable) {
        return
      }

      emit('update:current', index)
      emit('change', index)
    }

    // Provide steps context to child components (make it reactive)
    const stepsContextValue = reactive<StepsContext>({
      current: props.current,
      status: props.status,
      direction: props.direction,
      size: props.size,
      simple: props.simple,
      clickable: props.clickable,
      handleStepClick: props.clickable ? handleStepClick : undefined
    })

    // Watch for changes to current and update context
    watch(
      () => props.current,
      (newCurrent) => {
        stepsContextValue.current = newCurrent
      }
    )

    // Watch for changes to status and update context
    watch(
      () => props.status,
      (newStatus) => {
        stepsContextValue.status = newStatus
      }
    )

    watch(
      () => props.direction,
      (newDirection) => {
        stepsContextValue.direction = newDirection
      }
    )

    watch(
      () => props.size,
      (newSize) => {
        stepsContextValue.size = newSize
      }
    )

    watch(
      () => props.simple,
      (newSimple) => {
        stepsContextValue.simple = newSimple
      }
    )

    watch(
      () => props.clickable,
      (newClickable) => {
        stepsContextValue.clickable = newClickable
        stepsContextValue.handleStepClick = newClickable ? handleStepClick : undefined
      }
    )

    provide<StepsContext>(StepsContextKey, stepsContextValue)

    return () => {
      const children = (slots.default?.() || []) as VNode[]

      const {
        class: _class,
        style: _style,
        ...restAttrs
      } = attrsRecord as { class?: unknown; style?: unknown } & Record<string, unknown>

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
