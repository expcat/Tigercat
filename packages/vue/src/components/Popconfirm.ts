import {
  defineComponent,
  computed,
  ref,
  h,
  onBeforeUnmount,
  watch,
  VNode,
  PropType,
} from 'vue';
import {
  classNames,
  getPopconfirmContainerClasses,
  getPopconfirmTriggerClasses,
  getPopconfirmContentClasses,
  getPopconfirmTitleClasses,
  getPopconfirmDescriptionClasses,
  getPopconfirmIconClasses,
  getPopconfirmArrowClasses,
  getPopconfirmButtonsClasses,
  getPopconfirmCancelButtonClasses,
  getPopconfirmOkButtonClasses,
  getDropdownMenuWrapperClasses,
  type PopconfirmIconType,
  type DropdownPlacement,
} from '@tigercat/core';

// Icon components
const WarningIcon = h(
  'svg',
  {
    xmlns: 'http://www.w3.org/2000/svg',
    fill: 'none',
    viewBox: '0 0 24 24',
    'stroke-width': '1.5',
    stroke: 'currentColor',
  },
  [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
    }),
  ]
);

const InfoIcon = h(
  'svg',
  {
    xmlns: 'http://www.w3.org/2000/svg',
    fill: 'none',
    viewBox: '0 0 24 24',
    'stroke-width': '1.5',
    stroke: 'currentColor',
  },
  [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
    }),
  ]
);

const ErrorIcon = h(
  'svg',
  {
    xmlns: 'http://www.w3.org/2000/svg',
    fill: 'none',
    viewBox: '0 0 24 24',
    'stroke-width': '1.5',
    stroke: 'currentColor',
  },
  [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    }),
  ]
);

const SuccessIcon = h(
  'svg',
  {
    xmlns: 'http://www.w3.org/2000/svg',
    fill: 'none',
    viewBox: '0 0 24 24',
    'stroke-width': '1.5',
    stroke: 'currentColor',
  },
  [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    }),
  ]
);

const QuestionIcon = h(
  'svg',
  {
    xmlns: 'http://www.w3.org/2000/svg',
    fill: 'none',
    viewBox: '0 0 24 24',
    'stroke-width': '1.5',
    stroke: 'currentColor',
  },
  [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z',
    }),
  ]
);

const iconMap: Record<PopconfirmIconType, VNode> = {
  warning: WarningIcon,
  info: InfoIcon,
  error: ErrorIcon,
  success: SuccessIcon,
  question: QuestionIcon,
};

export const Popconfirm = defineComponent({
  name: 'TigerPopconfirm',
  props: {
    /**
     * Whether the popconfirm is visible (controlled mode)
     */
    visible: {
      type: Boolean,
      default: undefined,
    },
    /**
     * Default visibility (uncontrolled mode)
     * @default false
     */
    defaultVisible: {
      type: Boolean,
      default: false,
    },
    /**
     * Popconfirm title/question text
     */
    title: {
      type: String,
      default: '确定要执行此操作吗？',
    },
    /**
     * Popconfirm description text
     */
    description: {
      type: String,
      default: undefined,
    },
    /**
     * Icon type to display
     * @default 'warning'
     */
    icon: {
      type: String as PropType<PopconfirmIconType>,
      default: 'warning' as PopconfirmIconType,
    },
    /**
     * Whether to show icon
     * @default true
     */
    showIcon: {
      type: Boolean,
      default: true,
    },
    /**
     * Confirm button text
     * @default '确定'
     */
    okText: {
      type: String,
      default: '确定',
    },
    /**
     * Cancel button text
     * @default '取消'
     */
    cancelText: {
      type: String,
      default: '取消',
    },
    /**
     * Confirm button type
     * @default 'primary'
     */
    okType: {
      type: String as PropType<'primary' | 'danger'>,
      default: 'primary' as const,
    },
    /**
     * Popconfirm placement relative to trigger
     * @default 'top'
     */
    placement: {
      type: String as PropType<DropdownPlacement>,
      default: 'top' as DropdownPlacement,
    },
    /**
     * Whether the popconfirm is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined,
    },
  },
  emits: ['update:visible', 'visible-change', 'confirm', 'cancel'],
  setup(props, { slots, emit }) {
    // Internal state for uncontrolled mode
    const internalVisible = ref(props.defaultVisible);

    // Computed visible state (controlled or uncontrolled)
    const currentVisible = computed(() => {
      return props.visible !== undefined
        ? props.visible
        : internalVisible.value;
    });

    // Ref to the container element
    const containerRef = ref<HTMLElement | null>(null);

    // Handle visibility change
    const setVisible = (visible: boolean) => {
      if (props.disabled) return;

      // Update internal state if uncontrolled
      if (props.visible === undefined) {
        internalVisible.value = visible;
      }

      // Emit events
      emit('update:visible', visible);
      emit('visible-change', visible);
    };

    // Handle confirm
    const handleConfirm = () => {
      emit('confirm');
      setVisible(false);
    };

    // Handle cancel
    const handleCancel = () => {
      emit('cancel');
      setVisible(false);
    };

    // Handle trigger click
    const handleTriggerClick = () => {
      if (props.disabled) return;
      setVisible(!currentVisible.value);
    };

    // Handle outside click to close popconfirm
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (containerRef.value && !containerRef.value.contains(target)) {
        setVisible(false);
      }
    };

    // Setup and cleanup event listeners based on visibility
    watch(currentVisible, (visible) => {
      if (visible) {
        // Use setTimeout to avoid immediate triggering on the same click that opened it
        setTimeout(() => {
          document.addEventListener('click', handleClickOutside);
        }, 0);
      } else {
        document.removeEventListener('click', handleClickOutside);
      }
    });

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    // Container classes
    const containerClasses = computed(() => {
      return classNames(getPopconfirmContainerClasses(), props.className);
    });

    // Trigger classes
    const triggerClasses = computed(() => {
      return getPopconfirmTriggerClasses(props.disabled);
    });

    // Content wrapper classes
    const contentWrapperClasses = computed(() => {
      return getDropdownMenuWrapperClasses(
        currentVisible.value,
        props.placement
      );
    });

    const arrowClasses = computed(() => {
      return getPopconfirmArrowClasses(props.placement);
    });

    // Content classes
    const contentClasses = computed(() => {
      return getPopconfirmContentClasses();
    });

    // Title classes
    const titleClasses = computed(() => {
      return getPopconfirmTitleClasses();
    });

    // Description classes
    const descriptionClasses = computed(() => {
      return getPopconfirmDescriptionClasses();
    });

    // Icon classes
    const iconClasses = computed(() => {
      return getPopconfirmIconClasses(props.icon);
    });

    // Buttons classes
    const buttonsClasses = computed(() => {
      return getPopconfirmButtonsClasses();
    });

    // Cancel button classes
    const cancelButtonClasses = computed(() => {
      return getPopconfirmCancelButtonClasses();
    });

    // OK button classes
    const okButtonClasses = computed(() => {
      return getPopconfirmOkButtonClasses(props.okType);
    });

    return () => {
      const defaultSlot = slots.default?.();
      if (!defaultSlot || defaultSlot.length === 0) {
        return null;
      }

      // Trigger element
      const trigger = h(
        'div',
        {
          class: triggerClasses.value,
          onClick: handleTriggerClick,
        },
        defaultSlot
      );

      // Popconfirm content
      const content = h(
        'div',
        {
          class: contentWrapperClasses.value,
          hidden: !currentVisible.value,
        },
        [
          h('div', { class: 'relative' }, [
            h('div', { class: arrowClasses.value, 'aria-hidden': 'true' }),
            h(
              'div',
              {
                class: contentClasses.value,
              },
              [
                // Title section with icon
                h(
                  'div',
                  {
                    class: 'flex items-start',
                  },
                  [
                    // Icon
                    props.showIcon &&
                      h(
                        'div',
                        {
                          class: iconClasses.value,
                        },
                        iconMap[props.icon]
                      ),
                    // Title and description
                    h(
                      'div',
                      {
                        class: 'flex-1',
                      },
                      [
                        // Title
                        slots.title
                          ? h(
                              'div',
                              { class: titleClasses.value },
                              slots.title()
                            )
                          : h(
                              'div',
                              { class: titleClasses.value },
                              props.title
                            ),
                        // Description
                        props.description &&
                          (slots.description
                            ? h(
                                'div',
                                { class: descriptionClasses.value },
                                slots.description()
                              )
                            : h(
                                'div',
                                { class: descriptionClasses.value },
                                props.description
                              )),
                      ]
                    ),
                  ]
                ),
                // Buttons
                h(
                  'div',
                  {
                    class: buttonsClasses.value,
                  },
                  [
                    // Cancel button
                    h(
                      'button',
                      {
                        type: 'button',
                        class: cancelButtonClasses.value,
                        onClick: handleCancel,
                      },
                      props.cancelText
                    ),
                    // OK button
                    h(
                      'button',
                      {
                        type: 'button',
                        class: okButtonClasses.value,
                        onClick: handleConfirm,
                      },
                      props.okText
                    ),
                  ]
                ),
              ]
            ),
          ]),
        ]
      );

      return h(
        'div',
        {
          ref: containerRef,
          class: containerClasses.value,
        },
        [trigger, content]
      );
    };
  },
});

export default Popconfirm;
