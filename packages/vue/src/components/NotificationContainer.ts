import { computed, defineComponent, h, type PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getNotificationCloseAriaLabel,
  getNotificationIconPath,
  getNotificationTypeClasses,
  getToastItemRole,
  notificationActionButtonClasses,
  notificationActionButtonTypeClasses,
  notificationActionsClasses,
  notificationBaseClasses,
  notificationCloseButtonClasses,
  notificationCloseIconClasses,
  notificationCloseIconPath,
  notificationContainerBaseClasses,
  notificationContentClasses,
  notificationDescriptionClasses,
  notificationIconClasses,
  notificationPositionClasses,
  notificationTitleClasses,
  shouldHandleToastSurfaceEvent,
  type NotificationInstance,
  type NotificationPosition
} from '@expcat/tigercat-core'
import { createStatusIcon } from '../utils/icon-helpers'
import { renderVueBodyTeleport } from '../utils/overlay'
import { useTigerConfig } from './ConfigProvider'
import { getGlobalTigerLocale } from '../utils/global-locale'

type HArrayChildren = Extract<NonNullable<Parameters<typeof h>[2]>, unknown[]>

export interface VueNotificationContainerProps {
  position?: NotificationPosition
  notifications?: NotificationInstance[]
  className?: string
  /**
   * Portal through the overlay-host chain. Imperative hosts pass `false`.
   * @default true
   */
  portal?: boolean
}

export type NotificationContainerProps = VueNotificationContainerProps

export const NotificationContainer = /* @__PURE__ */ defineComponent({
  name: 'TigerNotificationContainer',
  inheritAttrs: false,
  props: {
    position: {
      type: String as PropType<NotificationPosition>,
      default: 'top-right' as NotificationPosition
    },
    notifications: {
      type: Array as PropType<NotificationInstance[]>,
      default: () => []
    },
    className: {
      type: String,
      default: undefined
    },
    portal: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close'],
  setup(props, { attrs, emit }) {
    const config = useTigerConfig()
    const locale = computed(() => config.value.locale ?? getGlobalTigerLocale())
    const containerClasses = computed(() =>
      classNames(
        notificationContainerBaseClasses,
        notificationPositionClasses[props.position],
        props.className,
        coerceClassValue(attrs.class)
      )
    )

    const renderNotificationItem = (notification: NotificationInstance) => {
      const colorScheme = getNotificationTypeClasses(notification.type)
      const notificationClasses = classNames(
        notificationBaseClasses,
        colorScheme.bg,
        colorScheme.border,
        notification.className
      )
      const iconPath = notification.icon || getNotificationIconPath(notification.type)
      const iconClass = classNames(notificationIconClasses, colorScheme.icon)
      const a11yRole = getToastItemRole(notification.type)
      const closeLabel = getNotificationCloseAriaLabel(locale.value, notification.closeAriaLabel)
      const close = () => emit('close', notification.id)

      const contentChildren = [
        h(
          'div',
          { class: classNames(notificationTitleClasses, colorScheme.titleText) },
          notification.title
        )
      ]

      if (notification.description) {
        contentChildren.push(
          h(
            'div',
            { class: classNames(notificationDescriptionClasses, colorScheme.descriptionText) },
            notification.description
          )
        )
      }

      if (notification.actions?.length) {
        contentChildren.push(
          h(
            'div',
            { class: notificationActionsClasses },
            notification.actions.map((action) =>
              h(
                'button',
                {
                  key: action.key ?? action.label,
                  class: classNames(
                    notificationActionButtonClasses,
                    notificationActionButtonTypeClasses[action.type ?? 'default']
                  ),
                  type: 'button',
                  disabled: action.disabled,
                  onClick: (event: MouseEvent) => {
                    event.stopPropagation()
                    action.onClick?.({
                      id: notification.id,
                      close
                    })
                    if (action.closeOnClick) close()
                  }
                },
                action.label
              )
            )
          )
        )
      }

      const children: HArrayChildren = [
        createStatusIcon(iconPath, iconClass, { 'aria-hidden': 'true', focusable: 'false' }),
        h('div', { class: notificationContentClasses }, contentChildren)
      ]

      if (notification.closable) {
        children.push(
          h(
            'button',
            {
              class: notificationCloseButtonClasses,
              onClick: (event: MouseEvent) => {
                event.stopPropagation()
                close()
              },
              'aria-label': closeLabel,
              type: 'button'
            },
            createStatusIcon(notificationCloseIconPath, notificationCloseIconClasses, {
              'aria-hidden': 'true',
              focusable: 'false'
            })
          )
        )
      }

      return h(
        'div',
        {
          key: notification.id,
          class: notificationClasses,
          role: a11yRole,
          onClick: (event: MouseEvent) => {
            if (!notification.onClick) return
            if (!shouldHandleToastSurfaceEvent(event)) return
            notification.onClick()
          },
          style: notification.onClick ? 'cursor: pointer;' : undefined,
          'data-tiger-notification': '',
          'data-tiger-notification-type': notification.type,
          'data-tiger-notification-id': String(notification.id)
        },
        children
      )
    }

    return () => {
      const node = h(
        'div',
        {
          ...attrs,
          class: containerClasses.value,
          'data-tiger-notification-container': '',
          'data-tiger-notification-position': props.position
        },
        props.notifications.map(renderNotificationItem)
      )
      return props.portal ? renderVueBodyTeleport(node) : node
    }
  }
})

export default NotificationContainer
