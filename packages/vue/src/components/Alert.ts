import { defineComponent, computed, h, onMounted, ref, watch, onBeforeUnmount, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getAlertTypeClasses,
  defaultAlertThemeColors,
  alertBaseClasses,
  alertSizeClasses,
  alertIconSizeClasses,
  alertTitleSizeClasses,
  alertDescriptionSizeClasses,
  alertCloseButtonBaseClasses,
  alertIconContainerClasses,
  getAlertContentClasses,
  getAlertIconPath,
  alertCloseIconPath,
  alertBannerClasses,
  alertCountdownContainerClasses,
  alertCountdownBarClasses,
  alertCountdownColorClasses,
  createAlertCountdown,
  focusAfterElement,
  isAlertInsertedAfterPaint,
  isBrowser,
  resolveAlertLive,
  getAlertLabels,
  mergeTigerLocale,
  mergeStyleValues,
  type AlertType,
  type AlertSize,
  type TigerLocale
} from '@expcat/tigercat-core'
import { createStatusIcon } from '../utils/icon-helpers'
import { useTigerConfig } from './tiger-config'

export interface VueAlertProps {
  locale?: Partial<TigerLocale>
  type?: AlertType
  size?: AlertSize
  title?: string
  description?: string
  showIcon?: boolean
  closable?: boolean
  closeAriaLabel?: string
  duration?: number
  open?: boolean
  banner?: boolean
  showCountdown?: boolean
  className?: string
  style?: Record<string, string | number>
}

export type AlertProps = VueAlertProps

export const Alert = defineComponent({
  name: 'TigerAlert',
  inheritAttrs: false,
  props: {
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
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
     * Accessible label for the close button (when `closable` is true).
     * Defaults to ConfigProvider locale `alert.closeAriaLabel`.
     */
    closeAriaLabel: {
      type: String,
      default: undefined
    },

    /**
     * Auto-close duration in milliseconds. 0 or undefined to disable.
     * Independent of `closable`.
     */
    duration: {
      type: Number,
      default: undefined
    },

    /**
     * Controlled visibility. Omit it and the alert hides itself.
     */
    open: {
      type: Boolean,
      default: undefined
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
    },

    /**
     * Whether to display as full-width banner
     * @since 0.9.0
     */
    banner: {
      type: Boolean,
      default: false
    },

    /**
     * Whether to show countdown progress bar
     * @since 0.9.0
     */
    showCountdown: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'update:open'],
  setup(props, { slots, emit, attrs }) {
    const config = useTigerConfig()
    const labels = computed(() =>
      getAlertLabels(mergeTigerLocale(config.value.locale, props.locale))
    )
    const colorScheme = computed(() => getAlertTypeClasses(props.type, defaultAlertThemeColors))

    const alertClasses = computed(() =>
      classNames(
        alertBaseClasses,
        alertSizeClasses[props.size],
        colorScheme.value.bg,
        colorScheme.value.border,
        props.banner && alertBannerClasses
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

    const dismissed = ref(false)
    const ratio = ref(1)
    const alertRef = ref<HTMLElement | null>(null)
    const inserted = isAlertInsertedAfterPaint()
    const shown = computed(() =>
      props.open === false ? false : props.open === true ? true : !dismissed.value
    )

    const requestClose = (fromCloseButton: boolean) => {
      emit('close', new Event('close', { cancelable: true }))
      emit('update:open', false)
      if (props.open === undefined) dismissed.value = true
      if (fromCloseButton) focusAfterElement(alertRef.value)
    }

    const handleClose = (event: MouseEvent) => {
      event.stopPropagation()
      requestClose(true)
    }

    const countdown = createAlertCountdown({
      enabled: isBrowser(),
      onElapsed: () => requestClose(false)
    })
    const stopCountdown = countdown.subscribe(() => {
      ratio.value = countdown.getRatio()
    })

    const reducedMotion = ref(false)
    let motionMedia: MediaQueryList | null = null
    const syncMotion = () => {
      reducedMotion.value = Boolean(motionMedia?.matches)
    }
    onMounted(() => {
      if (typeof window.matchMedia !== 'function') return
      motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')
      syncMotion()
      motionMedia.addEventListener('change', syncMotion)
    })
    onBeforeUnmount(() => {
      motionMedia?.removeEventListener('change', syncMotion)
    })

    watch(
      () => [props.duration, shown.value, reducedMotion.value] as const,
      () => {
        countdown.sync(shown.value ? props.duration : undefined, reducedMotion.value)
      },
      { immediate: true }
    )

    onBeforeUnmount(() => {
      stopCountdown()
      countdown.dispose()
    })

    return () => {
      if (!shown.value) {
        return null
      }

      const attrsRecord = attrs as Record<string, unknown>
      const attrsClass = attrsRecord.class
      const attrsStyle = attrsRecord.style
      const attrsRole = attrsRecord.role

      const children = []

      if (props.showIcon) {
        const iconPath = getAlertIconPath(props.type)
        children.push(
          h(
            'div',
            { class: alertIconContainerClasses },
            createStatusIcon(iconPath, iconClasses.value, {
              'aria-hidden': 'true',
              focusable: 'false'
            })
          )
        )
      }

      const contentChildren = []
      const hasTitle = !!(props.title || slots.title)
      const hasDescription = !!(props.description || slots.description)
      const hasDefault = !!slots.default
      const defaultSlot = hasDefault ? slots.default?.() : undefined

      if (hasTitle) {
        contentChildren.push(
          h('div', { class: titleClasses.value }, slots.title ? slots.title() : props.title)
        )
      }

      if (slots.action) {
        contentChildren.push(
          h(
            'div',
            { 'data-tiger-alert-action': '', class: descriptionClasses.value },
            slots.action()
          )
        )
      }

      if (hasDescription) {
        contentChildren.push(
          h(
            'div',
            { class: descriptionClasses.value },
            slots.description ? slots.description() : props.description
          )
        )
      }

      if (hasDefault) {
        contentChildren.push(
          h(
            'div',
            { class: hasTitle || hasDescription ? descriptionClasses.value : titleClasses.value },
            defaultSlot
          )
        )
      }

      if (contentChildren.length > 0) {
        children.push(h('div', { class: getAlertContentClasses(props.showIcon) }, contentChildren))
      }

      if (props.closable) {
        children.push(
          h(
            'button',
            {
              class: closeButtonClasses.value,
              onClick: handleClose,
              'aria-label': props.closeAriaLabel ?? labels.value.closeAriaLabel,
              type: 'button'
            },
            createStatusIcon(alertCloseIconPath, 'h-4 w-4', {
              'aria-hidden': 'true',
              focusable: 'false'
            })
          )
        )
      }

      if (props.showCountdown && props.duration && props.duration > 0) {
        children.push(
          h('div', { class: alertCountdownContainerClasses }, [
            h('div', {
              class: classNames(alertCountdownBarClasses, alertCountdownColorClasses[props.type]),
              style: { width: `${Math.max(0, Math.min(1, ratio.value)) * 100}%` }
            })
          ])
        )
      }

      const hasContent = hasTitle || hasDescription || hasDefault || !!slots.action
      const live = resolveAlertLive(props.type, hasContent, inserted)
      const role = typeof attrsRole === 'string' ? attrsRole : live.role

      return h(
        'div',
        {
          ...attrs,
          ref: alertRef,
          class: classNames(alertClasses.value, props.className, coerceClassValue(attrsClass)),
          style: mergeStyleValues(attrsStyle, props.style),
          role,
          'aria-live': live.ariaLive
        },
        children
      )
    }
  }
})

export default Alert
