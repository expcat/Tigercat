import {
  defineComponent,
  computed,
  ref,
  h,
  onBeforeUnmount,
  watch,
  PropType,
} from 'vue';
import { useVueClickOutside, useVueEscapeKey } from '../utils/overlay';
import {
  classNames,
  coerceClassValue,
  getPopoverContainerClasses,
  getPopoverTriggerClasses,
  getPopoverContentClasses,
  getPopoverTitleClasses,
  getPopoverContentTextClasses,
  getDropdownMenuWrapperClasses,
  type PopoverTrigger,
  type DropdownPlacement,
  type StyleValue,
} from '@tigercat/core';

export interface VuePopoverProps {
  className?: string;
  style?: StyleValue;
}

let popoverIdCounter = 0;
const createPopoverId = () => `tiger-popover-${++popoverIdCounter}`;

export const Popover = defineComponent({
  name: 'TigerPopover',
  inheritAttrs: false,
  props: {
    /**
     * Whether the popover is visible (controlled mode)
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
     * Popover title text
     */
    title: {
      type: String,
      default: undefined,
    },
    /**
     * Popover content text
     */
    content: {
      type: String,
      default: undefined,
    },
    /**
     * Trigger type for showing/hiding popover
     * @default 'click'
     */
    trigger: {
      type: String as PropType<PopoverTrigger>,
      default: 'click' as PopoverTrigger,
    },
    /**
     * Popover placement relative to trigger
     * @default 'top'
     */
    placement: {
      type: String as PropType<DropdownPlacement>,
      default: 'top' as DropdownPlacement,
    },
    /**
     * Whether the popover is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Popover width (CSS value)
     * @default 'auto'
     */
    width: {
      type: [String, Number],
      default: undefined,
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined,
    },
    style: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined,
    },
  },
  emits: ['update:visible', 'visible-change'],
  setup(props, { slots, emit, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>;

    const coerceBoolean = (val: unknown) => {
      if (val === '') return true;
      return Boolean(val);
    };

    const internalVisible = ref(
      props.visible !== undefined
        ? coerceBoolean(props.visible)
        : props.defaultVisible
    );

    const isControlled = computed(() => props.visible !== undefined);

    watch(
      () => props.visible,
      (next) => {
        if (next === undefined) return;
        internalVisible.value = coerceBoolean(next);
      }
    );

    const currentVisible = computed(() => internalVisible.value);

    const containerRef = ref<HTMLElement | null>(null);

    const popoverId = createPopoverId();
    const titleId = `${popoverId}-title`;
    const contentId = `${popoverId}-content`;

    const setVisible = (nextVisible: boolean) => {
      if (props.disabled && nextVisible) return;

      if (!isControlled.value) {
        internalVisible.value = nextVisible;
      }

      emit('update:visible', nextVisible);
      emit('visible-change', nextVisible);
    };

    // Handle trigger click
    const handleTriggerClick = () => {
      if (props.disabled || props.trigger !== 'click') return;
      setVisible(!currentVisible.value);
    };

    // Handle trigger mouse enter
    const handleTriggerMouseEnter = () => {
      if (props.disabled || props.trigger !== 'hover') return;
      setVisible(true);
    };

    // Handle trigger mouse leave
    const handleTriggerMouseLeave = () => {
      if (props.disabled || props.trigger !== 'hover') return;
      setVisible(false);
    };

    // Handle trigger focus
    const handleTriggerFocus = () => {
      if (props.disabled || props.trigger !== 'focus') return;
      setVisible(true);
    };

    // Handle trigger blur
    const handleTriggerBlur = () => {
      if (props.disabled || props.trigger !== 'focus') return;
      setVisible(false);
    };

    let outsideClickCleanup: (() => void) | undefined;
    let escapeKeyCleanup: (() => void) | undefined;

    watch([currentVisible, () => props.trigger], ([visible, trigger]) => {
      outsideClickCleanup?.();
      outsideClickCleanup = undefined;

      escapeKeyCleanup?.();
      escapeKeyCleanup = undefined;

      if (visible && trigger === 'click') {
        outsideClickCleanup = useVueClickOutside({
          enabled: currentVisible,
          containerRef,
          onOutsideClick: () => setVisible(false),
          defer: true,
        });
      }

      if (visible && trigger !== 'manual') {
        escapeKeyCleanup = useVueEscapeKey({
          enabled: currentVisible,
          onEscape: () => setVisible(false),
        });
      }
    });

    onBeforeUnmount(() => {
      outsideClickCleanup?.();
      escapeKeyCleanup?.();
    });

    // Container classes
    const containerClasses = computed(() => {
      return classNames(
        getPopoverContainerClasses(),
        props.className,
        coerceClassValue(attrsRecord.class)
      );
    });

    // Trigger classes
    const triggerClasses = computed(() => {
      return getPopoverTriggerClasses(props.disabled);
    });

    // Content wrapper classes
    const contentWrapperClasses = computed(() => {
      return getDropdownMenuWrapperClasses(
        currentVisible.value,
        props.placement
      );
    });

    // Content classes
    const contentClasses = computed(() => {
      return getPopoverContentClasses(props.width);
    });

    // Title classes
    const titleClasses = computed(() => {
      return getPopoverTitleClasses();
    });

    // Content text classes
    const contentTextClasses = computed(() => {
      return getPopoverContentTextClasses();
    });

    return () => {
      const defaultSlot = slots.default?.();
      if (!defaultSlot || defaultSlot.length === 0) {
        return null;
      }

      const {
        class: _class,
        style: _style,
        ...restAttrs
      } = attrsRecord as { class?: unknown; style?: unknown } & Record<
        string,
        unknown
      >;

      const hasTitle = Boolean(props.title || slots.title);
      const hasContent = Boolean(props.content || slots.content);

      const triggerA11yProps = {
        'aria-haspopup': 'dialog',
        'aria-disabled': props.disabled ? 'true' : undefined,
      } as const;

      // Build trigger event handlers
      const triggerHandlers: Record<string, unknown> = {};

      if (props.trigger === 'click') {
        triggerHandlers.onClick = handleTriggerClick;
      } else if (props.trigger === 'hover') {
        triggerHandlers.onMouseenter = handleTriggerMouseEnter;
        triggerHandlers.onMouseleave = handleTriggerMouseLeave;
      } else if (props.trigger === 'focus') {
        triggerHandlers.onFocusin = handleTriggerFocus;
        triggerHandlers.onFocusout = handleTriggerBlur;
      }

      // Trigger element
      const trigger = h(
        'div',
        {
          class: triggerClasses.value,
          ...triggerA11yProps,
          ...triggerHandlers,
        },
        defaultSlot
      );

      // Popover content
      const content = h(
        'div',
        {
          class: contentWrapperClasses.value,
          hidden: !currentVisible.value,
          'aria-hidden': !currentVisible.value,
        },
        [
          h(
            'div',
            {
              id: popoverId,
              role: 'dialog',
              'aria-modal': 'false',
              'aria-labelledby': hasTitle ? titleId : undefined,
              'aria-describedby': hasContent ? contentId : undefined,
              class: contentClasses.value,
            },
            [
              // Title
              (props.title || slots.title) &&
                h(
                  'div',
                  {
                    id: titleId,
                    class: titleClasses.value,
                  },
                  slots.title ? slots.title() : props.title
                ),
              // Content
              (props.content || slots.content) &&
                h(
                  'div',
                  {
                    id: contentId,
                    class: contentTextClasses.value,
                  },
                  slots.content ? slots.content() : props.content
                ),
            ].filter(Boolean)
          ),
        ]
      );

      return h(
        'div',
        {
          ...restAttrs,
          ref: containerRef,
          class: containerClasses.value,
          style: props.style,
        },
        [trigger, content]
      );
    };
  },
});

export default Popover;
