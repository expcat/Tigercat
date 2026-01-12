import {
  defineComponent,
  h,
  Teleport,
  ref,
  PropType,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getModalContentClasses,
  modalWrapperClasses,
  modalMaskClasses,
  getModalContainerClasses,
  modalHeaderClasses,
  modalTitleClasses,
  modalCloseButtonClasses,
  modalBodyClasses,
  modalFooterClasses,
  type ModalSize,
} from "@tigercat/core";

import { Button } from "./Button";

let modalIdCounter = 0;
const createModalId = () => `tiger-modal-${++modalIdCounter}`;

export interface VueModalProps {
  visible?: boolean;
  size?: ModalSize;
  title?: string;
  closable?: boolean;
  mask?: boolean;
  maskClosable?: boolean;
  centered?: boolean;
  destroyOnClose?: boolean;
  zIndex?: number;
  className?: string;
  style?: Record<string, unknown>;
  closeAriaLabel?: string;
  okText?: string;
  cancelText?: string;
}

export const Modal = defineComponent({
  name: "TigerModal",
  inheritAttrs: false,
  props: {
    /**
     * Whether the modal is visible
     * @default false
     */
    visible: {
      type: Boolean,
      default: false,
    },
    /**
     * Modal size
     * @default 'md'
     */
    size: {
      type: String as PropType<ModalSize>,
      default: "md" as ModalSize,
    },
    /**
     * Modal title
     */
    title: {
      type: String,
      default: undefined,
    },
    /**
     * Whether to show the close button
     * @default true
     */
    closable: {
      type: Boolean,
      default: true,
    },
    /**
     * Whether to show the mask (overlay)
     * @default true
     */
    mask: {
      type: Boolean,
      default: true,
    },
    /**
     * Whether clicking the mask should close the modal
     * @default true
     */
    maskClosable: {
      type: Boolean,
      default: true,
    },
    /**
     * Whether the modal should be centered vertically
     * @default false
     */
    centered: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether to destroy the modal content when closed
     * @default false
     */
    destroyOnClose: {
      type: Boolean,
      default: false,
    },
    /**
     * z-index of the modal
     * @default 1000
     */
    zIndex: {
      type: Number,
      default: 1000,
    },
    /**
     * Custom class name
     */
    className: {
      type: String,
      default: undefined,
    },

    /**
     * Custom inline style
     */
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined,
    },

    /**
     * Close button aria-label
     * @default 'Close'
     */
    closeAriaLabel: {
      type: String,
      default: "Close",
    },

    /**
     * Default OK button text (used in default footer)
     * @default '确定'
     */
    okText: {
      type: String,
      default: "确定",
    },

    /**
     * Default Cancel button text (used in default footer)
     * @default '取消'
     */
    cancelText: {
      type: String,
      default: "取消",
    },

    /**
     * Whether to render a default footer when no `footer` slot is provided
     * @default false
     */
    showDefaultFooter: {
      type: Boolean,
      default: false,
    },
    /**
     * Disable teleport (useful for testing)
     * @default false
     * @internal
     */
    disableTeleport: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:visible", "close", "cancel", "ok"],
  setup(props, { slots, emit, attrs }) {
    const instanceId = ref<string>(createModalId());
    const hasBeenOpened = ref(false);

    const dialogRef = ref<HTMLElement | null>(null);
    const closeButtonRef = ref<HTMLButtonElement | null>(null);
    const previousActiveElement = ref<HTMLElement | null>(null);

    const titleId = computed(() => `${instanceId.value}-title`);

    const shouldRender = computed(() => {
      if (props.visible) {
        hasBeenOpened.value = true;
        return true;
      }

      if (props.destroyOnClose) return false;
      return hasBeenOpened.value;
    });

    watch(
      () => props.visible,
      (newVal) => {
        if (!newVal) {
          emit("close");
        }
      }
    );

    const handleClose = () => {
      emit("update:visible", false);
      emit("cancel");
    };

    const handleOk = () => {
      emit("ok");
      emit("update:visible", false);
    };

    const handleMaskClick = (event: MouseEvent) => {
      if (props.maskClosable && event.target === event.currentTarget) {
        handleClose();
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && props.visible) {
        handleClose();
      }
    };

    onMounted(() => {
      document.addEventListener("keydown", handleEscKey);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("keydown", handleEscKey);
    });

    watch(
      () => props.visible,
      async (nextVisible) => {
        if (nextVisible) {
          const active = document.activeElement;
          previousActiveElement.value =
            active instanceof HTMLElement ? active : null;

          await nextTick();
          const el = closeButtonRef.value ?? dialogRef.value;
          el?.focus?.();
          return;
        }

        previousActiveElement.value?.focus?.();
      }
    );

    const contentClasses = computed(() => {
      return getModalContentClasses(props.size, props.className);
    });

    const containerClasses = computed(() => {
      return getModalContainerClasses(props.centered);
    });

    const CloseIcon = h(
      "svg",
      {
        class: "h-5 w-5",
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
      },
      [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M6 18L18 6M6 6l12 12",
        }),
      ]
    );

    return () => {
      if (!shouldRender.value) {
        return null;
      }

      const forwardedAttrs = Object.fromEntries(
        Object.entries(attrs).filter(
          ([key]) => key !== "class" && key !== "style"
        )
      );

      const ariaLabelledbyFromAttrs =
        typeof attrs["aria-labelledby"] === "string"
          ? (attrs["aria-labelledby"] as string)
          : undefined;

      const ariaLabelledby =
        ariaLabelledbyFromAttrs ??
        (props.title || slots.title ? titleId.value : undefined);

      const mergedClass = classNames(
        contentClasses.value,
        coerceClassValue(attrs.class)
      );

      const mergedStyle = mergeStyleValues(attrs.style, props.style);

      const header =
        props.title || slots.title || props.closable
          ? h("div", { class: modalHeaderClasses }, [
              props.title || slots.title
                ? h(
                    "h3",
                    {
                      id: titleId.value,
                      class: modalTitleClasses,
                    },
                    slots.title ? slots.title() : props.title
                  )
                : null,
              props.closable
                ? h(
                    "button",
                    {
                      type: "button",
                      class: modalCloseButtonClasses,
                      onClick: handleClose,
                      "aria-label": props.closeAriaLabel,
                      ref: closeButtonRef,
                    },
                    CloseIcon
                  )
                : null,
            ])
          : null;

      const body = slots.default
        ? h("div", { class: modalBodyClasses }, slots.default())
        : null;

      const footer = slots.footer
        ? h(
            "div",
            { class: modalFooterClasses, "data-tiger-modal-footer": "" },
            slots.footer({ ok: handleOk, cancel: handleClose })
          )
        : props.showDefaultFooter
        ? h(
            "div",
            { class: modalFooterClasses, "data-tiger-modal-footer": "" },
            [
              h(
                Button,
                { variant: "secondary", onClick: handleClose },
                { default: () => props.cancelText }
              ),
              h(Button, { onClick: handleOk }, { default: () => props.okText }),
            ]
          )
        : null;

      const renderedWrapper = h(
        "div",
        {
          class: modalWrapperClasses,
          style: { zIndex: props.zIndex },
          hidden: !props.visible,
          "aria-hidden": !props.visible ? "true" : undefined,
          "data-tiger-modal-root": "",
        },
        [
          props.mask &&
            h("div", {
              class: modalMaskClasses,
              "aria-hidden": "true",
              "data-tiger-modal-mask": "",
            }),
          h(
            "div",
            {
              class: containerClasses.value,
              onClick: handleMaskClick,
            },
            [
              h(
                "div",
                {
                  ...(forwardedAttrs as Record<string, unknown>),
                  class: mergedClass,
                  style: mergedStyle,
                  role: "dialog",
                  "aria-modal": "true",
                  "aria-labelledby": ariaLabelledby,
                  tabindex: -1,
                  ref: dialogRef,
                  "data-tiger-modal": "",
                },
                [header, body, footer]
              ),
            ]
          ),
        ]
      );

      return h(Teleport, { to: "body", disabled: props.disableTeleport }, [
        renderedWrapper,
      ]);
    };
  },
});

export default Modal;
