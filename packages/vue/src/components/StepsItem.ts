import {
  defineComponent,
  computed,
  inject,
  PropType,
  h,
  type VNode,
  type VNodeArrayChildren,
} from 'vue';
import {
  getStepItemClasses,
  getStepIconClasses,
  getStepTailClasses,
  getStepContentClasses,
  getStepTitleClasses,
  getStepDescriptionClasses,
  calculateStepStatus,
  type StepStatus,
} from '@tigercat/core';
import { StepsContextKey, type StepsContext } from './Steps';

type RawChildren =
  | string
  | number
  | boolean
  | VNode
  | VNodeArrayChildren
  | (() => unknown);

export const StepsItem = defineComponent({
  name: 'TigerStepsItem',
  props: {
    /**
     * Step title
     */
    title: {
      type: String,
      required: true,
    },
    /**
     * Step description
     */
    description: {
      type: String,
      default: undefined,
    },
    /**
     * Step icon (slot content or custom icon)
     */
    icon: {
      type: [String, Object] as PropType<unknown>,
      default: undefined,
    },
    /**
     * Step status (overrides automatic status)
     */
    status: {
      type: String as PropType<StepStatus>,
      default: undefined,
    },
    /**
     * Whether the step is disabled
     */
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots, attrs }) {
    // Get steps context
    const stepsContext = inject<StepsContext>(StepsContextKey, {
      current: 0,
      status: 'process',
      direction: 'horizontal',
      size: 'default',
      simple: false,
      clickable: false,
    });

    // Get step index from parent
    const stepIndex = computed(() => {
      // This will be passed by the parent during rendering
      const stepIndexValue = (attrs as Record<string, unknown>).stepIndex;
      return typeof stepIndexValue === 'number' ? stepIndexValue : 0;
    });

    // Calculate step status
    const stepStatus = computed(() => {
      return calculateStepStatus(
        stepIndex.value,
        stepsContext.current,
        stepsContext.status,
        props.status
      );
    });

    // Check if this is the last step
    const isLast = computed(() => {
      const isLastValue = (attrs as Record<string, unknown>).isLast;
      return typeof isLastValue === 'boolean' ? isLastValue : false;
    });

    // Item classes
    const itemClasses = computed(() => {
      return getStepItemClasses(
        stepsContext.direction,
        isLast.value,
        stepsContext.simple
      );
    });

    // Icon classes
    const iconClasses = computed(() => {
      const hasCustomIcon = !!(props.icon || slots.icon);
      return getStepIconClasses(
        stepStatus.value,
        stepsContext.size,
        stepsContext.simple,
        hasCustomIcon
      );
    });

    // Tail classes
    const tailClasses = computed(() => {
      return getStepTailClasses(
        stepsContext.direction,
        stepStatus.value,
        isLast.value
      );
    });

    // Content classes
    const contentClasses = computed(() => {
      return getStepContentClasses(stepsContext.direction, stepsContext.simple);
    });

    // Title classes
    const titleClasses = computed(() => {
      return getStepTitleClasses(
        stepStatus.value,
        stepsContext.size,
        stepsContext.clickable && !props.disabled
      );
    });

    // Description classes
    const descriptionClasses = computed(() => {
      return getStepDescriptionClasses(stepStatus.value, stepsContext.size);
    });

    // Handle click
    const handleClick = () => {
      if (props.disabled || !stepsContext.handleStepClick) {
        return;
      }
      stepsContext.handleStepClick(stepIndex.value);
    };

    // Render icon
    const renderIcon = () => {
      // Custom icon from slot
      if (slots.icon) {
        return h('div', { class: iconClasses.value }, slots.icon());
      }

      // Custom icon from prop
      if (props.icon) {
        return h(
          'div',
          { class: iconClasses.value },
          props.icon as unknown as RawChildren
        );
      }

      // Default: show step number or checkmark for finished steps
      if (stepStatus.value === 'finish') {
        return h(
          'div',
          { class: iconClasses.value },
          h(
            'svg',
            {
              class: 'w-5 h-5',
              fill: 'none',
              stroke: 'currentColor',
              viewBox: '0 0 24 24',
            },
            h('path', {
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              'stroke-width': '2',
              d: 'M5 13l4 4L19 7',
            })
          )
        );
      }

      // Default: show step number
      return h(
        'div',
        { class: iconClasses.value },
        String(stepIndex.value + 1)
      );
    };

    // Render content
    const renderContent = () => {
      const children = [];

      // Title
      children.push(
        h(
          'div',
          {
            class: titleClasses.value,
            onClick: handleClick,
          },
          props.title
        )
      );

      // Description (if not simple mode)
      if (!stepsContext.simple && (props.description || slots.description)) {
        children.push(
          h(
            'div',
            { class: descriptionClasses.value },
            slots.description ? slots.description() : props.description
          )
        );
      }

      return h('div', { class: contentClasses.value }, children);
    };

    return () => {
      // For vertical layout
      if (stepsContext.direction === 'vertical') {
        return h('div', { class: itemClasses.value }, [
          // Icon and tail wrapper
          h('div', { class: 'relative' }, [
            renderIcon(),
            h('div', { class: tailClasses.value }),
          ]),
          // Content
          renderContent(),
        ]);
      }

      // For horizontal layout
      return h('div', { class: itemClasses.value }, [
        // Icon
        renderIcon(),
        // Tail (connector)
        h('div', { class: tailClasses.value }),
        // Content
        renderContent(),
      ]);
    };
  },
});

export default StepsItem;
