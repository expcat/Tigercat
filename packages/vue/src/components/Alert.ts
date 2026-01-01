import { defineComponent, computed, h, ref, PropType } from 'vue'
import { 
  classNames, 
  getAlertTypeClasses,
  defaultAlertThemeColors,
  alertBaseClasses,
  alertSizeClasses,
  alertIconSizeClasses,
  alertTitleSizeClasses,
  alertDescriptionSizeClasses,
  alertCloseButtonBaseClasses,
  alertIconContainerClasses,
  alertContentClasses,
  getAlertIconPath,
  alertCloseIconPath,
  type AlertType, 
  type AlertSize,
} from '@tigercat/core'

/**
 * Create icon element
 */
function createIcon(path: string, className: string) {
  return h(
    'svg',
    {
      class: className,
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

export const Alert = defineComponent({
  name: 'TigerAlert',
  props: {
    /**
     * Alert type (determines icon and color scheme)
     * @default 'info'
     */
    type: {
      type: String as PropType<AlertType>,
      default: 'info' as AlertType,
    },
    /**
     * Alert size
     * @default 'md'
     */
    size: {
      type: String as PropType<AlertSize>,
      default: 'md' as AlertSize,
    },
    /**
     * Alert title (main message)
     */
    title: {
      type: String,
      default: '',
    },
    /**
     * Alert description (detailed content)
     */
    description: {
      type: String,
      default: '',
    },
    /**
     * Whether to show the type icon
     * @default true
     */
    showIcon: {
      type: Boolean,
      default: true,
    },
    /**
     * Whether the alert can be closed
     * @default false
     */
    closable: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],
  setup(props, { slots, emit }) {
    const visible = ref(true)
    const colorScheme = computed(() => getAlertTypeClasses(props.type, defaultAlertThemeColors))

    const alertClasses = computed(() => {
      return classNames(
        alertBaseClasses,
        alertSizeClasses[props.size],
        colorScheme.value.bg,
        colorScheme.value.border
      )
    })

    const iconClasses = computed(() => {
      return classNames(
        alertIconSizeClasses[props.size],
        colorScheme.value.icon
      )
    })

    const titleClasses = computed(() => {
      return classNames(
        alertTitleSizeClasses[props.size],
        colorScheme.value.title
      )
    })

    const descriptionClasses = computed(() => {
      return classNames(
        alertDescriptionSizeClasses[props.size],
        colorScheme.value.description
      )
    })

    const closeButtonClasses = computed(() => {
      return classNames(
        alertCloseButtonBaseClasses,
        colorScheme.value.closeButton,
        colorScheme.value.closeButtonHover,
        colorScheme.value.focus
      )
    })

    const handleClose = (event: MouseEvent) => {
      visible.value = false
      emit('close', event)
    }

    return () => {
      if (!visible.value) {
        return null
      }

      const children = []

      // Add icon if showIcon is true
      if (props.showIcon) {
        const iconPath = getAlertIconPath(props.type)
        children.push(
          h(
            'div',
            { class: alertIconContainerClasses },
            createIcon(iconPath, iconClasses.value)
          )
        )
      }

      // Add content (title and/or description)
      const contentChildren = []
      
      // Add title
      if (props.title || slots.title) {
        contentChildren.push(
          h(
            'div',
            { class: titleClasses.value },
            slots.title ? slots.title() : props.title
          )
        )
      }

      // Add description
      if (props.description || slots.description) {
        contentChildren.push(
          h(
            'div',
            { class: descriptionClasses.value },
            slots.description ? slots.description() : props.description
          )
        )
      }

      // Add default slot content if no title/description
      if (!props.title && !props.description && !slots.title && !slots.description && slots.default) {
        contentChildren.push(
          h(
            'div',
            { class: titleClasses.value },
            slots.default()
          )
        )
      }

      if (contentChildren.length > 0) {
        children.push(
          h('div', { class: alertContentClasses }, contentChildren)
        )
      }

      // Add close button if closable
      if (props.closable) {
        children.push(
          h(
            'button',
            {
              class: closeButtonClasses.value,
              onClick: handleClose,
              'aria-label': 'Close alert',
              type: 'button',
            },
            createIcon(alertCloseIconPath, 'h-4 w-4')
          )
        )
      }

      return h(
        'div',
        {
          class: alertClasses.value,
          role: 'alert',
        },
        children
      )
    }
  },
})

export default Alert
