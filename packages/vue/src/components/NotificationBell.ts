import { defineComponent, h, nextTick, ref, watch, type PropType } from 'vue'
import {
  formatW9Label,
  getW9DataLabels,
  notificationItemsPendingRead,
  resolveButtonClasses,
  type NotificationItem
} from '@expcat/tigercat-core'
import { Badge } from './Badge'
import { Icon } from './Icon'
import { NotificationCenter } from './NotificationCenter'
import { Popover } from './Popover'

export type VueNotificationBellProps = InstanceType<typeof NotificationBell>['$props']

export const NotificationBell = defineComponent({
  name: 'TigerNotificationBell',
  props: {
    items: { type: Array as PropType<NotificationItem[]>, default: () => [] },
    locale: { type: String, default: undefined }
  },
  emits: ['item-read-change', 'update:open'],
  setup(props, { emit }) {
    const open = ref(false)
    const buttonRef = ref<HTMLButtonElement | null>(null)
    const labels = () => getW9DataLabels(props.locale)
    const announced = ref(
      formatW9Label(labels().unreadCount, {
        count: notificationItemsPendingRead(props.items).length
      })
    )

    watch(open, (value) => {
      emit('update:open', value)
      void nextTick(() => {
        if (value) {
          const panel = document.querySelector('[data-tiger-notification-bell-panel]')
          const focusable = panel?.querySelector<HTMLElement>('button, [href], input, [tabindex]')
          focusable?.focus()
          return
        }
        buttonRef.value?.focus()
      })
    })

    return () => {
      const unread = notificationItemsPendingRead(props.items).length
      return h('div', [
        h('div', { class: 'sr-only', 'aria-live': 'polite' }, announced.value),
        h(
          Popover,
          {
            open: open.value,
            placement: 'bottom-end',
            width: '20rem',
            title: formatW9Label(labels().unreadCount, { count: unread }),
            ariaLabel: formatW9Label(labels().unreadCount, { count: unread }),
            'onUpdate:open': (value: boolean) => {
              open.value = value
            }
          },
          {
            trigger: () =>
              h(
                'button',
                {
                  ref: buttonRef,
                  type: 'button',
                  class: resolveButtonClasses({ variant: 'ghost', iconOnly: true }),
                  'data-tiger-notification-bell': '',
                  'aria-label': formatW9Label(labels().unreadCount, { count: unread })
                },
                [
                  h(
                    Badge,
                    { content: unread, standalone: false, size: 'sm' },
                    { default: () => h(Icon, { name: 'bell' }) }
                  )
                ]
              ),
            content: () =>
              h('div', { 'data-tiger-notification-bell-panel': '' }, [
                h(NotificationCenter, {
                  items: props.items,
                  onItemReadChange: (item: NotificationItem, nextRead: boolean) => {
                    emit('item-read-change', item, nextRead)
                  }
                })
              ])
          }
        )
      ])
    }
  }
})
