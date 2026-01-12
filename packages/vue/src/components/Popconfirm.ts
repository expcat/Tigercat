import {
  defineComponent,
  computed,
  ref,
  h,
  cloneVNode,
  isVNode,
  onBeforeUnmount,
  watch,
  PropType,
} from "vue";
import {
  classNames,
  coerceClassValue,
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
  mergeStyleValues,
  type PopconfirmIconType,
  type DropdownPlacement,
  type StyleValue,
} from "@tigercat/core";

// Icon components
const WarningIcon = h(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    stroke: "currentColor",
  },
  [
    h("path", {
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
    }),
  ]
);

const InfoIcon = h(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    stroke: "currentColor",
  },
  [
    h("path", {
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      d: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z",
    }),
  ]
);

const ErrorIcon = h(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    stroke: "currentColor",
  },
  [
    h("path", {
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      d: "M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    }),
  ]
);

const SuccessIcon = h(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    stroke: "currentColor",
  },
  [
    h("path", {
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      d: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    }),
  ]
);

const QuestionIcon = h(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    stroke: "currentColor",
  },
  [
    h("path", {
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      d: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z",
    }),
  ]
);

const iconMap: Record<PopconfirmIconType, ReturnType<typeof h>> = {
  warning: WarningIcon,
  info: InfoIcon,
  error: ErrorIcon,
  success: SuccessIcon,
  question: QuestionIcon,
};

let popconfirmIdCounter = 0;
const createPopconfirmId = () => `tiger-popconfirm-${++popconfirmIdCounter}`;

export interface VuePopconfirmProps {
  className?: string;
  style?: StyleValue;
}

export const Popconfirm = defineComponent({
  name: "TigerPopconfirm",
  inheritAttrs: false,
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
      default: "确定要执行此操作吗？",
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
      default: "warning" as PopconfirmIconType,
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
      default: "确定",
    },
    /**
     * Cancel button text
     * @default '取消'
     */
    cancelText: {
      type: String,
      default: "取消",
    },
    /**
     * Confirm button type
     * @default 'primary'
     */
    okType: {
      type: String as PropType<"primary" | "danger">,
      default: "primary" as const,
    },
    /**
     * Popconfirm placement relative to trigger
     * @default 'top'
     */
    placement: {
      type: String as PropType<DropdownPlacement>,
      default: "top" as DropdownPlacement,
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
    style: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined,
    },
  },
  emits: ["update:visible", "visible-change", "confirm", "cancel"],
  setup(props, { slots, emit, attrs }) {
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

    const popconfirmId = createPopconfirmId();
    const titleId = `${popconfirmId}-title`;
    const descriptionId = `${popconfirmId}-description`;

    // Handle visibility change
    const setVisible = (visible: boolean) => {
      if (props.disabled && visible) return;

      // Update internal state if uncontrolled
      if (props.visible === undefined) {
        internalVisible.value = visible;
      }

      // Emit events
      emit("update:visible", visible);
      emit("visible-change", visible);
    };

    // Handle confirm
    const handleConfirm = () => {
      setVisible(false);
      emit("confirm");
    };

    // Handle cancel
    const handleCancel = () => {
      setVisible(false);
      emit("cancel");
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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setVisible(false);
    };

    let outsideClickTimeoutId: number | undefined;

    watch(currentVisible, (visible) => {
      if (outsideClickTimeoutId !== undefined) {
        clearTimeout(outsideClickTimeoutId);
        outsideClickTimeoutId = undefined;
      }

      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);

      if (!visible) return;

      outsideClickTimeoutId = window.setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 0);

      document.addEventListener("keydown", handleKeyDown);
    });

    onBeforeUnmount(() => {
      if (outsideClickTimeoutId !== undefined) {
        clearTimeout(outsideClickTimeoutId);
      }
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    });

    // Container classes
    const containerClasses = computed(() => {
      return classNames(
        getPopconfirmContainerClasses(),
        props.className,
        coerceClassValue(attrs.class)
      );
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

      const {
        class: _class,
        style: _style,
        ...restAttrs
      } = attrs as {
        class?: unknown;
        style?: unknown;
      } & Record<string, unknown>;

      const triggerA11yProps = {
        "aria-haspopup": "dialog",
        "aria-expanded": Boolean(currentVisible.value),
        "aria-controls": currentVisible.value ? popconfirmId : undefined,
        "aria-disabled": props.disabled ? "true" : undefined,
      } as const;

      const trigger = (() => {
        if (defaultSlot.length === 1) {
          const only = defaultSlot[0];
          if (isVNode(only)) {
            const existingProps = (only.props ?? {}) as {
              class?: unknown;
              onClick?: unknown;
            };

            const existingOnClick = existingProps.onClick;
            const onClick = (event: MouseEvent) => {
              if (typeof existingOnClick === "function") {
                (existingOnClick as (e: MouseEvent) => void)(event);
              } else if (Array.isArray(existingOnClick)) {
                for (const handler of existingOnClick) {
                  if (typeof handler === "function") {
                    (handler as (e: MouseEvent) => void)(event);
                  }
                }
              }

              if (event.defaultPrevented) return;
              handleTriggerClick();
            };

            return cloneVNode(
              only,
              {
                ...triggerA11yProps,
                class: classNames(
                  coerceClassValue(existingProps.class),
                  triggerClasses.value
                ),
                onClick,
              },
              true
            );
          }
        }

        return h(
          "div",
          {
            class: triggerClasses.value,
            onClick: handleTriggerClick,
            role: "button",
            tabindex: props.disabled ? -1 : 0,
            onKeydown: (event: KeyboardEvent) => {
              if (props.disabled) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleTriggerClick();
              }
            },
            ...triggerA11yProps,
          },
          defaultSlot
        );
      })();

      const hasDescription = Boolean(props.description || slots.description);

      const content = h(
        "div",
        {
          class: contentWrapperClasses.value,
          hidden: !currentVisible.value,
          "aria-hidden": !currentVisible.value,
        },
        [
          h("div", { class: "relative" }, [
            h("div", { class: arrowClasses.value, "aria-hidden": "true" }),
            h(
              "div",
              {
                id: popconfirmId,
                role: "dialog",
                "aria-modal": "false",
                "aria-labelledby": titleId,
                "aria-describedby": hasDescription ? descriptionId : undefined,
                class: contentClasses.value,
              },
              [
                // Title section with icon
                h(
                  "div",
                  {
                    class: "flex items-start",
                  },
                  [
                    // Icon
                    props.showIcon &&
                      h(
                        "div",
                        {
                          class: iconClasses.value,
                          "aria-hidden": "true",
                        },
                        iconMap[props.icon]
                      ),
                    // Title and description
                    h(
                      "div",
                      {
                        class: "flex-1",
                      },
                      [
                        // Title
                        slots.title
                          ? h(
                              "div",
                              { id: titleId, class: titleClasses.value },
                              slots.title()
                            )
                          : h(
                              "div",
                              { id: titleId, class: titleClasses.value },
                              props.title
                            ),
                        // Description
                        hasDescription &&
                          h(
                            "div",
                            {
                              id: descriptionId,
                              class: descriptionClasses.value,
                            },
                            slots.description
                              ? slots.description()
                              : props.description
                          ),
                      ]
                    ),
                  ]
                ),
                // Buttons
                h(
                  "div",
                  {
                    class: buttonsClasses.value,
                  },
                  [
                    // Cancel button
                    h(
                      "button",
                      {
                        type: "button",
                        class: cancelButtonClasses.value,
                        onClick: handleCancel,
                      },
                      props.cancelText
                    ),
                    // OK button
                    h(
                      "button",
                      {
                        type: "button",
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
        "div",
        {
          ...restAttrs,
          ref: containerRef,
          class: containerClasses.value,
          style: mergeStyleValues(
            (attrs as Record<string, unknown>).style,
            props.style
          ),
        },
        [trigger, content]
      );
    };
  },
});

export default Popconfirm;
