import {
  defineComponent,
  computed,
  ref,
  watch,
  Teleport,
  PropType,
  h,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getDrawerMaskClasses,
  getDrawerContainerClasses,
  getDrawerPanelClasses,
  getDrawerHeaderClasses,
  getDrawerBodyClasses,
  getDrawerFooterClasses,
  getDrawerCloseButtonClasses,
  getDrawerTitleClasses,
  type DrawerPlacement,
  type DrawerSize,
} from "@tigercat/core";

let drawerIdCounter = 0;
const createDrawerId = () => `tiger-drawer-${++drawerIdCounter}`;

export interface VueDrawerProps {
  visible?: boolean;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  title?: string;
  closable?: boolean;
  mask?: boolean;
  maskClosable?: boolean;
  zIndex?: number;
  className?: string;
  bodyClassName?: string;
  destroyOnClose?: boolean;
  style?: Record<string, unknown>;
  closeAriaLabel?: string;
}

export const Drawer = defineComponent({
  name: "TigerDrawer",
  inheritAttrs: false,
  props: {
    /**
     * Whether the drawer is visible
     * @default false
     */
    visible: {
      type: Boolean,
      default: false,
    },
    /**
     * Drawer placement
     * @default 'right'
     */
    placement: {
      type: String as PropType<DrawerPlacement>,
      default: "right" as DrawerPlacement,
    },
    /**
     * Drawer size
     * @default 'md'
     */
    size: {
      type: String as PropType<DrawerSize>,
      default: "md" as DrawerSize,
    },
    /**
     * Drawer title
     */
    title: {
      type: String,
      default: undefined,
    },
    /**
     * Whether to show close button
     * @default true
     */
    closable: {
      type: Boolean,
      default: true,
    },
    /**
     * Whether to show mask/backdrop
     * @default true
     */
    mask: {
      type: Boolean,
      default: true,
    },
    /**
     * Whether clicking mask closes the drawer
     * @default true
     */
    maskClosable: {
      type: Boolean,
      default: true,
    },
    /**
     * z-index of the drawer
     * @default 1000
     */
    zIndex: {
      type: Number,
      default: 1000,
    },
    /**
     * Additional CSS class for the drawer container
     */
    className: {
      type: String,
      default: undefined,
    },
    /**
     * Additional CSS class for the drawer body
     */
    bodyClassName: {
      type: String,
      default: undefined,
    },
    /**
     * Whether to destroy content on close
     * @default false
     */
    destroyOnClose: {
      type: Boolean,
      default: false,
    },

    /**
     * Custom inline style for drawer panel
     */
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined,
    },

    /**
     * Close button aria-label
     * @default 'Close drawer'
     */
    closeAriaLabel: {
      type: String,
      default: "Close drawer",
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
  emits: ["update:visible", "close", "after-enter", "after-leave"],
  setup(props, { slots, emit, attrs }) {
    const instanceId = ref<string>(createDrawerId());
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

    const handleClose = () => {
      emit("update:visible", false);
      emit("close");
    };

    const handleMaskClick = (event: MouseEvent) => {
      if (!props.maskClosable) return;
      if (event.target === event.currentTarget) {
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

    watch(
      () => props.visible,
      (nextVisible, prevVisible, onCleanup) => {
        if (typeof prevVisible === "undefined") {
          if (!nextVisible) return;

          const timer = window.setTimeout(() => {
            emit("after-enter");
          }, 300);

          onCleanup(() => window.clearTimeout(timer));
          return;
        }

        if (nextVisible === prevVisible) return;

        const timer = window.setTimeout(() => {
          emit(nextVisible ? "after-enter" : "after-leave");
        }, 300);

        onCleanup(() => window.clearTimeout(timer));
      },
      { immediate: true }
    );

    return () => {
      if (!shouldRender.value) return null;

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
        (props.title || slots.header ? titleId.value : undefined);

      const containerClasses = classNames(
        getDrawerContainerClasses(props.zIndex),
        !props.visible && "pointer-events-none"
      );

      const maskClasses = getDrawerMaskClasses(props.visible);

      const panelClasses = classNames(
        getDrawerPanelClasses(props.placement, props.visible, props.size),
        "flex flex-col",
        props.className,
        coerceClassValue(attrs.class)
      );

      const mergedStyle = mergeStyleValues(attrs.style, props.style);

      const headerClasses = getDrawerHeaderClasses();
      const bodyClasses = getDrawerBodyClasses(props.bodyClassName);
      const footerClasses = getDrawerFooterClasses();
      const closeButtonClasses = getDrawerCloseButtonClasses();
      const titleClasses = getDrawerTitleClasses();

      const closeIcon = h(
        "svg",
        {
          class: "w-5 h-5",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          xmlns: "http://www.w3.org/2000/svg",
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

      const header =
        props.title || slots.header || props.closable
          ? h("div", { class: headerClasses }, [
              props.title || slots.header
                ? h(
                    "h3",
                    {
                      id: titleId.value,
                      class: titleClasses,
                    },
                    slots.header ? slots.header() : props.title
                  )
                : null,
              props.closable
                ? h(
                    "button",
                    {
                      type: "button",
                      class: closeButtonClasses,
                      onClick: handleClose,
                      "aria-label": props.closeAriaLabel,
                      ref: closeButtonRef,
                    },
                    closeIcon
                  )
                : null,
            ])
          : null;

      const body = slots.default
        ? h("div", { class: bodyClasses }, slots.default())
        : null;

      const footer = slots.footer
        ? h("div", { class: footerClasses }, slots.footer())
        : null;

      const mask = props.mask
        ? h("div", {
            class: maskClasses,
            onClick: handleMaskClick,
            "aria-hidden": "true",
            "data-tiger-drawer-mask": "",
          })
        : null;

      const panel = h(
        "div",
        {
          ...(forwardedAttrs as Record<string, unknown>),
          class: panelClasses,
          style: mergedStyle,
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": ariaLabelledby,
          tabindex: -1,
          ref: dialogRef,
          "data-tiger-drawer": "",
        },
        [header, body, footer]
      );

      const root = h(
        "div",
        {
          class: containerClasses,
          style: { zIndex: props.zIndex },
          hidden: !props.visible,
          "aria-hidden": !props.visible ? "true" : undefined,
          "data-tiger-drawer-root": "",
        },
        [mask, panel]
      );

      return h(Teleport, { to: "body", disabled: props.disableTeleport }, [
        root,
      ]);
    };
  },
});

export default Drawer;
