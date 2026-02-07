import {
  defineComponent,
  computed,
  inject,
  PropType,
  h,
  type VNode,
  type VNodeArrayChildren
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
  calculateStepStatus,
  stepFinishChar,
  type StepStatus
} from '@expcat/tigercat-core'
import { StepsContextKey, type StepsContext } from './Steps'

type RawChildren = string | number | boolean | VNode | VNodeArrayChildren | (() => unknown)

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
    // Get steps context
    const stepsContext = inject<StepsContext>(StepsContextKey, {
      current: 0,
      status: 'process',
      direction: 'horizontal',
      size: 'default',
      simple: false,
      clickable: false
    })

    const attrsRecord = attrs as Record<string, unknown>
    const attrsClass = (attrsRecord as { class?: unknown }).class
    const attrsStyle = (attrsRecord as { style?: unknown }).style

    // Calculate step status
    const stepStatus = computed(() => {
      return calculateStepStatus(
        props.stepIndex,
        stepsContext.current,
        stepsContext.status,
        props.status
      )
    })

    // Item classes
    const itemClasses = computed(() => {
      return classNames(
        getStepItemClasses(stepsContext.direction, props.isLast, stepsContext.simple),
        props.className,
        coerceClassValue(attrsClass)
      )
    })

    // Icon classes
    const iconClasses = computed(() => {
      const hasCustomIcon = !!(props.icon || slots.icon)
      return getStepIconClasses(
        stepStatus.value,
        stepsContext.size,
        stepsContext.simple,
        hasCustomIcon
      )
    })

    // Tail classes
    const tailClasses = computed(() => {
      return getStepTailClasses(stepsContext.direction, stepStatus.value, props.isLast)
    })

    // Content classes
    const contentClasses = computed(() => {
      return getStepContentClasses(stepsContext.direction, stepsContext.simple)
    })

    // Title classes
    const titleClasses = computed(() => {
      return getStepTitleClasses(
        stepStatus.value,
        stepsContext.size,
        stepsContext.clickable && !props.disabled
      )
    })

    // Description classes
    const descriptionClasses = computed(() => {
      return getStepDescriptionClasses(stepStatus.value, stepsContext.size)
    })

    // Handle click
    const handleClick = () => {
      if (props.disabled || !stepsContext.handleStepClick) {
        return
      }
      stepsContext.handleStepClick(props.stepIndex)
    }

    // Render icon
    const renderIcon = () => {
      if (slots.icon) {
        return h('div', { class: iconClasses.value }, slots.icon())
      }

      if (props.icon) {
        return h('div', { class: iconClasses.value }, props.icon as unknown as RawChildren)
      }

      if (stepStatus.value === 'finish') {
        return h('div', { class: iconClasses.value, 'aria-hidden': 'true' }, stepFinishChar)
      }

      return h('div', { class: iconClasses.value }, String(props.stepIndex + 1))
    }

    // Render content
    const renderContent = () => {
      const children = []

      // Title
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

      // Description (if not simple mode)
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

    const mergedStyle = computed(() => mergeStyleValues(attrsStyle, props.style))

    return () => {
      const {
        class: _class,
        style: _style,
        ...restAttrs
      } = attrsRecord as { class?: unknown; style?: unknown } & Record<string, unknown>

      // For vertical layout
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
            // Icon and tail wrapper
            h('div', { class: 'relative' }, [renderIcon(), h('div', { class: tailClasses.value })]),
            // Content
            renderContent()
          ]
        )
      }

      // For horizontal layout
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
          // Icon
          renderIcon(),
          // Tail (connector)
          h('div', { class: tailClasses.value }),
          // Content
          renderContent()
        ]
      )
    }
  }
})

export default StepsItem
