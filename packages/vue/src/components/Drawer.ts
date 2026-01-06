import {
  defineComponent,
  computed,
  ref,
  watch,
  Teleport,
  Transition,
  PropType,
  h,
  onMounted,
  onBeforeUnmount,
} from 'vue';
import {
  classNames,
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
} from '@tigercat/core';

export const Drawer = defineComponent({
  name: 'TigerDrawer',
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
      default: 'right' as DrawerPlacement,
    },
    /**
     * Drawer size
     * @default 'md'
     */
    size: {
      type: String as PropType<DrawerSize>,
      default: 'md' as DrawerSize,
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
  },
  emits: ['update:visible', 'close', 'after-enter', 'after-leave'],
  setup(props, { slots, emit }) {
    // Track if drawer has ever been opened (for destroyOnClose)
    const hasBeenOpened = ref(false);

    // Update hasBeenOpened when visible changes
    watch(
      () => props.visible,
      (newVisible) => {
        if (newVisible) {
          hasBeenOpened.value = true;
        }
      },
      { immediate: true }
    );

    // Handle close request
    const handleClose = () => {
      emit('update:visible', false);
      emit('close');
    };

    // Handle mask click
    const handleMaskClick = () => {
      if (props.maskClosable) {
        handleClose();
      }
    };

    // Handle ESC key
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && props.visible) {
        handleClose();
      }
    };

    // Setup and cleanup ESC key listener
    onMounted(() => {
      document.addEventListener('keydown', handleEscKey);
    });

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleEscKey);
    });

    // Mask classes
    const maskClasses = computed(() => {
      return getDrawerMaskClasses(props.visible);
    });

    // Container classes
    const containerClasses = computed(() => {
      return getDrawerContainerClasses(props.zIndex);
    });

    // Panel classes
    const panelClasses = computed(() => {
      return classNames(
        getDrawerPanelClasses(props.placement, props.visible, props.size),
        'flex flex-col',
        props.className
      );
    });

    // Header classes
    const headerClasses = computed(() => {
      return getDrawerHeaderClasses();
    });

    // Body classes
    const bodyClasses = computed(() => {
      return getDrawerBodyClasses(props.bodyClassName);
    });

    // Footer classes
    const footerClasses = computed(() => {
      return getDrawerFooterClasses();
    });

    // Close button classes
    const closeButtonClasses = computed(() => {
      return getDrawerCloseButtonClasses();
    });

    // Title classes
    const titleClasses = computed(() => {
      return getDrawerTitleClasses();
    });

    // Transition callbacks
    const onAfterEnter = () => {
      emit('after-enter');
    };

    const onAfterLeave = () => {
      emit('after-leave');
    };

    return () => {
      // Don't render anything if destroyOnClose is true and drawer has never been opened
      if (props.destroyOnClose && !hasBeenOpened.value) {
        return null;
      }

      // Don't render anything if destroyOnClose is true and drawer is not visible
      if (props.destroyOnClose && !props.visible) {
        return null;
      }

      // Close icon SVG
      const closeIcon = h(
        'svg',
        {
          class: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
          xmlns: 'http://www.w3.org/2000/svg',
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M6 18L18 6M6 6l12 12',
          }),
        ]
      );

      // Header
      const header =
        props.title || slots.header || props.closable
          ? h('div', { class: headerClasses.value }, [
              props.title || slots.header
                ? h('div', { class: titleClasses.value }, [
                    slots.header?.() || props.title,
                  ])
                : null,
              props.closable
                ? h(
                    'button',
                    {
                      type: 'button',
                      class: closeButtonClasses.value,
                      onClick: handleClose,
                      'aria-label': 'Close drawer',
                    },
                    [closeIcon]
                  )
                : null,
            ])
          : null;

      // Body
      const body = h('div', { class: bodyClasses.value }, [slots.default?.()]);

      // Footer
      const footer = slots.footer
        ? h('div', { class: footerClasses.value }, [slots.footer()])
        : null;

      // Drawer panel
      const panel = h(
        'div',
        {
          class: panelClasses.value,
          role: 'dialog',
          'aria-modal': 'true',
          'aria-labelledby': props.title ? 'drawer-title' : undefined,
          onClick: (e: Event) => e.stopPropagation(),
        },
        [header, body, footer]
      );

      // Mask (if enabled)
      const mask = props.mask
        ? h('div', {
            class: maskClasses.value,
            onClick: handleMaskClick,
            'aria-hidden': 'true',
          })
        : null;

      // Drawer container
      const drawerContent = h(
        'div',
        {
          class: containerClasses.value,
        },
        [mask, panel]
      );

      // Use Teleport to render drawer at document body
      return h(Teleport, { to: 'body' }, [
        h(
          Transition,
          {
            name: 'drawer',
            onAfterEnter,
            onAfterLeave,
          },
          {
            default: () => (props.visible ? drawerContent : null),
          }
        ),
      ]);
    };
  },
});

export default Drawer;
