import {
  createApp,
  type App,
  defineComponent,
  h,
  ref,
  computed,
  Teleport,
  TransitionGroup,
  type PropType,
} from 'vue';
import {
  classNames,
  getMessageTypeClasses,
  defaultMessageThemeColors,
  icon24PathStrokeLinecap,
  icon24PathStrokeLinejoin,
  icon24StrokeWidth,
  icon24ViewBox,
  messageContainerBaseClasses,
  messagePositionClasses,
  messageBaseClasses,
  messageIconClasses,
  messageContentClasses,
  messageCloseButtonClasses,
  messageLoadingSpinnerClasses,
  getMessageIconPath,
  messageCloseIconPath,
  type MessagePosition,
  type MessageInstance,
  type MessageOptions,
  type MessageConfig,
} from '@tigercat/core';

/**
 * Global message container id
 */
const MESSAGE_CONTAINER_ID = 'tiger-message-container';
const MESSAGE_CLOSE_ARIA_LABEL = 'Close message';

/**
 * Global message container root id
 */
const MESSAGE_CONTAINER_ROOT_ID = `${MESSAGE_CONTAINER_ID}-root`;

/**
 * Message instance storage (reactive)
 */
const messageInstances = ref<MessageInstance[]>([]);
let instanceIdCounter = 0;

const IS_TEST_ENV =
  typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';

let containerApp: App<Element> | null = null;

/**
 * Get next instance id
 */
function getNextInstanceId(): number {
  return ++instanceIdCounter;
}

/**
 * Create icon element
 */
function createIcon(path: string, className: string, isLoading = false) {
  const iconClass = classNames(
    className,
    isLoading ? messageLoadingSpinnerClasses : ''
  );

  return h(
    'svg',
    {
      class: iconClass,
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: icon24ViewBox,
      stroke: 'currentColor',
      'stroke-width': String(icon24StrokeWidth),
    },
    [
      h('path', {
        'stroke-linecap': icon24PathStrokeLinecap,
        'stroke-linejoin': icon24PathStrokeLinejoin,
        d: path,
      }),
    ]
  );
}

/**
 * Message container component
 */
export const MessageContainer = defineComponent({
  name: 'TigerMessageContainer',
  props: {
    position: {
      type: String as PropType<MessagePosition>,
      default: 'top' as MessagePosition,
    },
  },
  setup(props) {
    const containerClasses = computed(() => {
      return classNames(
        messageContainerBaseClasses,
        messagePositionClasses[props.position]
      );
    });

    const removeMessage = (id: string | number) => {
      const index = messageInstances.value.findIndex((msg) => msg.id === id);
      if (index !== -1) {
        const instance = messageInstances.value[index];
        messageInstances.value.splice(index, 1);
        if (instance.onClose) {
          instance.onClose();
        }
      }
    };

    const renderMessageItem = (message: MessageInstance) => {
      const colorScheme = getMessageTypeClasses(
        message.type,
        defaultMessageThemeColors
      );

      const messageClasses = classNames(
        messageBaseClasses,
        colorScheme.bg,
        colorScheme.border,
        colorScheme.text,
        message.className
      );

      const iconPath = message.icon || getMessageIconPath(message.type);
      const iconClass = classNames(messageIconClasses, colorScheme.icon);

      const a11yRole = message.type === 'error' ? 'alert' : 'status';
      const ariaLive = message.type === 'error' ? 'assertive' : 'polite';

      const children = [
        createIcon(iconPath, iconClass, message.type === 'loading'),
        h('div', { class: messageContentClasses }, message.content),
      ];

      if (message.closable) {
        children.push(
          h(
            'button',
            {
              class: messageCloseButtonClasses,
              onClick: () => removeMessage(message.id),
              'aria-label': MESSAGE_CLOSE_ARIA_LABEL,
              type: 'button',
            },
            createIcon(messageCloseIconPath, 'w-4 h-4')
          )
        );
      }

      return h(
        'div',
        {
          key: message.id,
          class: messageClasses,
          role: a11yRole,
          'aria-live': ariaLive,
          'aria-atomic': 'true',
          'aria-busy': message.type === 'loading' ? 'true' : undefined,
          'data-tiger-message': '',
          'data-tiger-message-type': message.type,
          'data-tiger-message-id': String(message.id),
        },
        children
      );
    };

    return () =>
      h(
        Teleport,
        { to: 'body' },
        h(
          'div',
          {
            class: containerClasses.value,
            id: MESSAGE_CONTAINER_ID,
            'aria-live': 'polite',
            'aria-relevant': 'additions',
            'data-tiger-message-container': '',
          },
          IS_TEST_ENV
            ? messageInstances.value.map(renderMessageItem)
            : h(TransitionGroup, { name: 'message', tag: 'div' }, () =>
                messageInstances.value.map(renderMessageItem)
              )
        )
      );
  },
});

/**
 * Ensure message container exists (auto-mounted singleton)
 */
function ensureContainer() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const existingRootEl = document.getElementById(MESSAGE_CONTAINER_ROOT_ID);

  // If we already created an app but the DOM was externally cleared (e.g. tests), reset.
  if (containerApp && !existingRootEl) {
    containerApp = null;
  }

  if (containerApp) {
    return;
  }

  let rootEl = existingRootEl;
  if (!rootEl) {
    rootEl = document.createElement('div');
    rootEl.id = MESSAGE_CONTAINER_ROOT_ID;
    document.body.appendChild(rootEl);
  }

  containerApp = createApp(MessageContainer);
  containerApp.mount(rootEl);
}

/**
 * Add a message to the queue
 */
function addMessage(config: MessageConfig): () => void {
  const id = getNextInstanceId();

  const instance: MessageInstance = {
    id,
    type: config.type || 'info',
    content: config.content,
    duration: config.duration !== undefined ? config.duration : 3000,
    closable: config.closable || false,
    onClose: config.onClose,
    icon: config.icon,
    className: config.className,
  };

  messageInstances.value.push(instance);

  // Ensure container exists after state is updated so it can render immediately.
  ensureContainer();

  // Auto close after duration
  if (instance.duration > 0) {
    setTimeout(() => {
      removeMessage(id);
    }, instance.duration);
  }

  // Return close function
  return () => removeMessage(id);
}

/**
 * Remove a message from the queue
 */
function removeMessage(id: string | number) {
  const index = messageInstances.value.findIndex((msg) => msg.id === id);
  if (index !== -1) {
    const instance = messageInstances.value[index];
    messageInstances.value.splice(index, 1);
    if (instance.onClose) {
      instance.onClose();
    }
  }
}

/**
 * Clear all messages
 */
function clearAll() {
  messageInstances.value.forEach((instance) => {
    if (instance.onClose) {
      instance.onClose();
    }
  });

  messageInstances.value = [];

  // Unmount and remove root for singleton-style API
  if (containerApp) {
    containerApp.unmount();
    containerApp = null;
  }
  const rootEl = document.getElementById(MESSAGE_CONTAINER_ROOT_ID);
  if (rootEl?.parentNode) {
    rootEl.parentNode.removeChild(rootEl);
  }
}

/**
 * Normalize message options
 */
function normalizeOptions(options: MessageOptions): MessageConfig {
  if (typeof options === 'string') {
    return { content: options };
  }
  return options;
}

/**
 * Message API
 */
export const message = {
  /**
   * Show an info message
   */
  info(options: MessageOptions): () => void {
    const config = normalizeOptions(options);
    return addMessage({ ...config, type: 'info' });
  },

  /**
   * Show a success message
   */
  success(options: MessageOptions): () => void {
    const config = normalizeOptions(options);
    return addMessage({ ...config, type: 'success' });
  },

  /**
   * Show a warning message
   */
  warning(options: MessageOptions): () => void {
    const config = normalizeOptions(options);
    return addMessage({ ...config, type: 'warning' });
  },

  /**
   * Show an error message
   */
  error(options: MessageOptions): () => void {
    const config = normalizeOptions(options);
    return addMessage({ ...config, type: 'error' });
  },

  /**
   * Show a loading message
   */
  loading(options: MessageOptions): () => void {
    const config = normalizeOptions(options);
    return addMessage({ ...config, type: 'loading', duration: 0 });
  },

  /**
   * Clear all messages
   */
  clear() {
    clearAll();
  },
};

export default message;
