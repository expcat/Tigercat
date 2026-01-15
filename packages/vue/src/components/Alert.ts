import { defineComponent, computed, h, ref, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  icon24PathStrokeLinecap,
  icon24PathStrokeLinejoin,
  icon24StrokeWidth,
  icon24ViewBox,
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
  mergeStyleValues,
  type AlertType,
  type AlertSize
} from '@expcat/tigercat-core'

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
      viewBox: icon24ViewBox,
      stroke: 'currentColor',
      'stroke-width': String(icon24StrokeWidth)
    },
    [
      h('path', {
        'stroke-linecap': icon24PathStrokeLinecap,
        'stroke-linejoin': icon24PathStrokeLinejoin,
        d: path
      })
    ]
  )
}

export interface VueAlertProps {
  type?: AlertType
  size?: AlertSize
  title?: string
  description?: string
  showIcon?: boolean
  closable?: boolean
  closeAriaLabel?: string
  className?: string
  style?: Record<string, string | number>
}

export const Alert = defineComponent({
  name: 'TigerAlert',
  inheritAttrs: false,
  props: {
    /**
     * Alert type (determines icon and color scheme)
     * @default 'info'
     */
    type: {
      type: String as PropType<AlertType>,
      default: 'info' as AlertType
    },
    /**
     * Alert size
     * @default 'md'
     */
    size: {
      type: String as PropType<AlertSize>,
      default: 'md' as AlertSize
    },
    /**
     * Alert title (main message)
     */
    title: {
      type: String,
      default: undefined
    },
    /**
     * Alert description (detailed content)
     */
    description: {
      type: String,
      default: undefined
    },
    /**
     * Whether to show the type icon
     * @default true
     */
    showIcon: {
      type: Boolean,
      default: true
    },
    /**
     * Whether the alert can be closed
     * @default false
     */
    closable: {
      type: Boolean,
      default: false
    },

    /**
     * Accessible label for the close button (when `closable` is true)
     * @default 'Close alert'
     */
    closeAriaLabel: {
      type: String,
      default: 'Close alert'
    },

    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined
    },

    /**
     * Custom styles
     */
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['close'],
  setup(props, { slots, emit, attrs }) {
    const visible = ref(true)
    const colorScheme = computed(() => getAlertTypeClasses(props.type, defaultAlertThemeColors))

    const alertClasses = computed(() =>
      classNames(
        alertBaseClasses,
        alertSizeClasses[props.size],
        colorScheme.value.bg,
        colorScheme.value.border
      )
    )

    const iconClasses = computed(() =>
      classNames(alertIconSizeClasses[props.size], colorScheme.value.icon)
    )

    const titleClasses = computed(() =>
      classNames(alertTitleSizeClasses[props.size], colorScheme.value.title)
    )

    const descriptionClasses = computed(() =>
      classNames(alertDescriptionSizeClasses[props.size], colorScheme.value.description)
    )

    const closeButtonClasses = computed(() =>
      classNames(
        alertCloseButtonBaseClasses,
        colorScheme.value.closeButton,
        colorScheme.value.closeButtonHover,
        colorScheme.value.focus
      )
    )

    const handleClose = (event: MouseEvent) => {
      emit('close', event)

      if (!event.defaultPrevented) {
        visible.value = false
      }
    }

    return () => {
      if (!visible.value) {
        return null
      }

      const attrsRecord = attrs as Record<string, unknown>
      const attrsClass = attrsRecord.class
      const attrsStyle = attrsRecord.style

      const children = []

      // Add icon if showIcon is true
      if (props.showIcon) {
        const iconPath = getAlertIconPath(props.type)
        children.push(
          h('div', { class: alertIconContainerClasses }, createIcon(iconPath, iconClasses.value))
        )
      }

      // Add content (title and/or description)
      const contentChildren = []

      // Add title
      if (props.title || slots.title) {
        contentChildren.push(
          h('div', { class: titleClasses.value }, slots.title ? slots.title() : props.title)
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
      if (
        !props.title &&
        !props.description &&
        !slots.title &&
        !slots.description &&
        slots.default
      ) {
        contentChildren.push(h('div', { class: titleClasses.value }, slots.default()))
      }

      if (contentChildren.length > 0) {
        children.push(h('div', { class: alertContentClasses }, contentChildren))
      }

      // Add close button if closable
      if (props.closable) {
        children.push(
          h(
            'button',
            {
              class: closeButtonClasses.value,
              onClick: handleClose,
              'aria-label': props.closeAriaLabel,
              type: 'button'
            },
            createIcon(alertCloseIconPath, 'h-4 w-4')
          )
        )
      }

      return h(
        'div',
        {
          ...attrs,
          class: classNames(alertClasses.value, props.className, coerceClassValue(attrsClass)),
          style: mergeStyleValues(attrsStyle, props.style),
          role: 'alert'
        },
        children
      )
    }
  }
})

export default Alert
