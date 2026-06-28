import { computed, defineComponent, h, Teleport, TransitionGroup, type PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getNotificationIconPath,
  getNotificationTypeClasses,
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
  type NotificationInstance,
  type NotificationPosition
} from '@expcat/tigercat-core'
import { createStatusIcon } from '../utils/icon-helpers'

type HArrayChildren = Extract<NonNullable<Parameters<typeof h>[2]>, unknown[]>

const NOTIFICATION_CONTAINER_ID_PREFIX = 'tiger-notification-container'
const NOTIFICATION_CLOSE_ARIA_LABEL = 'Close notification'

const IS_TEST_ENV = (() => {
  const proc = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process
  return typeof proc !== 'undefined' && proc.env?.NODE_ENV === 'test'
})()

export interface VueNotificationContainerProps {
  position?: NotificationPosition
  notifications?: NotificationInstance[]
  onClose?: (id: string | number) => void
}

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
    onClose: Function as PropType<(id: string | number) => void>
  },
  setup(props, { attrs }) {
    const containerClasses = computed(() =>
      classNames(
        notificationContainerBaseClasses,
        notificationPositionClasses[props.position],
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

      const a11yRole = notification.type === 'error' ? 'alert' : 'status'
      const ariaLive = notification.type === 'error' ? 'assertive' : 'polite'

      const contentChildren = [
        h(
          'div',
          {
            class: classNames(notificationTitleClasses, colorScheme.titleText)
          },
          notification.title
        )
      ]

      if (notification.description) {
        contentChildren.push(
          h(
            'div',
            {
              class: classNames(notificationDescriptionClasses, colorScheme.descriptionText)
            },
            notification.description
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
              onClick: (e: MouseEvent) => {
                e.stopPropagation()
                props.onClose?.(notification.id)
              },
              'aria-label': NOTIFICATION_CLOSE_ARIA_LABEL,
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
          'aria-live': ariaLive,
          'aria-atomic': 'true',
          onClick: notification.onClick,
          onKeydown: (e: KeyboardEvent) => {
            if (!notification.onClick) return
            const key = e.key
            if (key === 'Enter' || key === ' ') {
              e.preventDefault()
              notification.onClick()
            }
          },
          tabindex: notification.onClick ? 0 : undefined,
          style: notification.onClick ? 'cursor: pointer;' : undefined,
          'data-tiger-notification': '',
          'data-tiger-notification-type': notification.type,
          'data-tiger-notification-id': String(notification.id)
        },
        children
      )
    }

    return () =>
      h(
        Teleport,
        { to: 'body' },
        h(
          'div',
          {
            ...attrs,
            class: containerClasses.value,
            id: `${NOTIFICATION_CONTAINER_ID_PREFIX}-${props.position}`,
            'aria-live': 'polite',
            'aria-relevant': 'additions',
            'data-tiger-notification-container': '',
            'data-tiger-notification-position': props.position
          },
          IS_TEST_ENV
            ? props.notifications.map(renderNotificationItem)
            : h(
                TransitionGroup,
                {
                  name: 'notification',
                  tag: 'div',
                  class: 'flex flex-col gap-3'
                },
                () => props.notifications.map(renderNotificationItem)
              )
        )
      )
  }
})

export default NotificationContainer
