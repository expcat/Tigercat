import {
  defineComponent,
  computed,
  h,
  Transition,
  Teleport,
  watch,
  ref,
  PropType,
} from 'vue';
import {
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
} from '@tigercat/core';

export const Modal = defineComponent({
  name: 'TigerModal',
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
      default: 'md' as ModalSize,
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
     * Disable teleport (useful for testing)
     * @default false
     * @internal
     */
    disableTeleport: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:visible', 'close', 'cancel', 'ok'],
  setup(props, { slots, emit }) {
    const hasRendered = ref(false);
    const shouldRender = computed(() => {
      if (props.visible) {
        hasRendered.value = true;
        return true;
      }
      return !props.destroyOnClose && hasRendered.value;
    });

    // Watch for visible changes to emit events
    watch(
      () => props.visible,
      (newVal) => {
        if (!newVal) {
          emit('close');
        }
      }
    );

    const handleClose = () => {
      emit('update:visible', false);
      emit('cancel');
    };

    const handleMaskClick = (event: MouseEvent) => {
      if (props.maskClosable && event.target === event.currentTarget) {
        handleClose();
      }
    };

    const contentClasses = computed(() => {
      return getModalContentClasses(props.size, props.className);
    });

    const containerClasses = computed(() => {
      return getModalContainerClasses(props.centered);
    });

    // Close button icon (X)
    const CloseIcon = h(
      'svg',
      {
        class: 'h-5 w-5',
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24',
        stroke: 'currentColor',
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

    return () => {
      if (!shouldRender.value) {
        return null;
      }

      const modalContent = h(
        'div',
        {
          class: containerClasses.value,
          onClick: handleMaskClick,
        },
        [
          h(
            Transition,
            {
              name: 'modal-content',
              appear: true,
            },
            {
              default: () =>
                props.visible
                  ? h(
                      'div',
                      {
                        class: contentClasses.value,
                        role: 'dialog',
                        'aria-modal': 'true',
                        'aria-labelledby': props.title
                          ? 'modal-title'
                          : undefined,
                      },
                      [
                        // Header
                        (props.title || slots.title || props.closable) &&
                          h('div', { class: modalHeaderClasses }, [
                            // Title
                            (props.title || slots.title) &&
                              h(
                                'h3',
                                {
                                  id: 'modal-title',
                                  class: modalTitleClasses,
                                },
                                slots.title ? slots.title() : props.title
                              ),
                            // Close button
                            props.closable &&
                              h(
                                'button',
                                {
                                  type: 'button',
                                  class: modalCloseButtonClasses,
                                  onClick: handleClose,
                                  'aria-label': 'Close',
                                },
                                CloseIcon
                              ),
                          ]),

                        // Body
                        slots.default &&
                          h(
                            'div',
                            { class: modalBodyClasses },
                            slots.default()
                          ),

                        // Footer
                        slots.footer &&
                          h(
                            'div',
                            { class: modalFooterClasses },
                            slots.footer()
                          ),
                      ]
                    )
                  : null,
            }
          ),
        ]
      );

      const wrapper = h(
        'div',
        {
          class: modalWrapperClasses,
          style: { zIndex: props.zIndex },
        },
        [
          // Mask
          props.mask &&
            h(
              Transition,
              { name: 'modal-mask', appear: true },
              {
                default: () =>
                  props.visible
                    ? h('div', {
                        class: modalMaskClasses,
                        'aria-hidden': 'true',
                      })
                    : null,
              }
            ),
          // Content
          modalContent,
        ]
      );

      const teleportedChildren =
        props.visible || hasRendered.value
          ? [
              h(
                Transition,
                {
                  name: 'modal-fade',
                  appear: true,
                },
                {
                  default: () => (props.visible ? wrapper : null),
                }
              ),
            ]
          : [];

      return h(
        Teleport,
        { to: 'body', disabled: props.disableTeleport },
        teleportedChildren
      );
    };
  },
});

export default Modal;
