import { defineComponent, h, ref, computed, onMounted, onUnmounted, Teleport, TransitionGroup, PropType } from 'vue'
import { 
  classNames,
  getMessageTypeClasses,
  defaultMessageThemeColors,
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
} from '@tigercat/core'

/**
 * Global message container id
 */
const MESSAGE_CONTAINER_ID = 'tiger-message-container'

/**
 * Message instance storage
 */
let messageInstances: MessageInstance[] = []
let instanceIdCounter = 0

/**
 * Get next instance id
 */
function getNextInstanceId(): number {
  return ++instanceIdCounter
}

/**
 * Create icon element
 */
function createIcon(path: string, className: string, isLoading = false) {
  const iconClass = classNames(className, isLoading ? messageLoadingSpinnerClasses : '')
  
  return h(
    'svg',
    {
      class: iconClass,
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor',
      'stroke-width': '2',
    },
    [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: path,
      }),
    ]
  )
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
    const messages = ref<MessageInstance[]>([])
    
    // Sync with global message instances
    const syncMessages = () => {
      messages.value = [...messageInstances]
    }
    
    // Update messages periodically to check for changes
    let intervalId: number | undefined
    
    onMounted(() => {
      syncMessages()
      intervalId = window.setInterval(syncMessages, 50)
    })
    
    onUnmounted(() => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    })
    
    const containerClasses = computed(() => {
      return classNames(
        messageContainerBaseClasses,
        messagePositionClasses[props.position]
      )
    })
    
    const removeMessage = (id: string | number) => {
      const index = messageInstances.findIndex(msg => msg.id === id)
      if (index !== -1) {
        const instance = messageInstances[index]
        messageInstances.splice(index, 1)
        if (instance.onClose) {
          instance.onClose()
        }
      }
      syncMessages()
    }
    
    return () => {
      return h(
        Teleport,
        { to: 'body' },
        h(
          'div',
          {
            class: containerClasses.value,
            id: MESSAGE_CONTAINER_ID,
          },
          h(
            TransitionGroup,
            {
              name: 'message',
              tag: 'div',
              class: 'flex flex-col gap-2',
            },
            () => messages.value.map((message) => {
              const colorScheme = getMessageTypeClasses(message.type, defaultMessageThemeColors)
              
              const messageClasses = classNames(
                messageBaseClasses,
                colorScheme.bg,
                colorScheme.border,
                colorScheme.text,
                message.className
              )
              
              const iconPath = message.icon || getMessageIconPath(message.type)
              const iconClass = classNames(messageIconClasses, colorScheme.icon)
              
              const children = []
              
              // Icon
              children.push(
                createIcon(iconPath, iconClass, message.type === 'loading')
              )
              
              // Content
              children.push(
                h('div', { class: messageContentClasses }, message.content)
              )
              
              // Close button (if closable)
              if (message.closable) {
                children.push(
                  h(
                    'button',
                    {
                      class: messageCloseButtonClasses,
                      onClick: () => removeMessage(message.id),
                      'aria-label': 'Close message',
                      type: 'button',
                    },
                    createIcon(messageCloseIconPath, 'w-4 h-4')
                  )
                )
              }
              
              return h(
                'div',
                {
                  key: message.id,
                  class: messageClasses,
                  role: 'alert',
                },
                children
              )
            })
          )
        )
      )
    }
  },
})

/**
 * Add a message to the queue
 */
function addMessage(config: MessageConfig): () => void {
  const id = getNextInstanceId()
  
  const instance: MessageInstance = {
    id,
    type: config.type || 'info',
    content: config.content,
    duration: config.duration !== undefined ? config.duration : 3000,
    closable: config.closable || false,
    onClose: config.onClose,
    icon: config.icon,
    className: config.className,
  }
  
  messageInstances.push(instance)
  
  // Auto close after duration
  if (instance.duration > 0) {
    setTimeout(() => {
      removeMessage(id)
    }, instance.duration)
  }
  
  // Return close function
  return () => removeMessage(id)
}

/**
 * Remove a message from the queue
 */
function removeMessage(id: string | number) {
  const index = messageInstances.findIndex(msg => msg.id === id)
  if (index !== -1) {
    const instance = messageInstances[index]
    messageInstances.splice(index, 1)
    if (instance.onClose) {
      instance.onClose()
    }
  }
}

/**
 * Clear all messages
 */
function clearAll() {
  messageInstances.forEach(instance => {
    if (instance.onClose) {
      instance.onClose()
    }
  })
  messageInstances = []
}

/**
 * Normalize message options
 */
function normalizeOptions(options: MessageOptions): MessageConfig {
  if (typeof options === 'string') {
    return { content: options }
  }
  return options
}

/**
 * Message API
 */
export const message = {
  /**
   * Show an info message
   */
  info(options: MessageOptions): () => void {
    const config = normalizeOptions(options)
    return addMessage({ ...config, type: 'info' })
  },
  
  /**
   * Show a success message
   */
  success(options: MessageOptions): () => void {
    const config = normalizeOptions(options)
    return addMessage({ ...config, type: 'success' })
  },
  
  /**
   * Show a warning message
   */
  warning(options: MessageOptions): () => void {
    const config = normalizeOptions(options)
    return addMessage({ ...config, type: 'warning' })
  },
  
  /**
   * Show an error message
   */
  error(options: MessageOptions): () => void {
    const config = normalizeOptions(options)
    return addMessage({ ...config, type: 'error' })
  },
  
  /**
   * Show a loading message
   */
  loading(options: MessageOptions): () => void {
    const config = normalizeOptions(options)
    return addMessage({ ...config, type: 'loading', duration: 0 })
  },
  
  /**
   * Clear all messages
   */
  clear() {
    clearAll()
  },
}

export default message
