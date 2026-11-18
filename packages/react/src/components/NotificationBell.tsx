import { useEffect, useRef, useState } from 'react'
import {
  formatW9Label,
  getW9DataLabels,
  mergeTigerLocale,
  notificationItemsPendingRead,
  resolveButtonClasses,
  type NotificationBellProps as CoreNotificationBellProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'
import { Badge } from './Badge'
import { Icon } from './Icon'
import { NotificationCenter } from './NotificationCenter'
import { Popover } from './Popover'

export interface NotificationBellProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: CoreNotificationBellProps['items']
  locale?: CoreNotificationBellProps['locale']
  onItemReadChange?: CoreNotificationBellProps['onItemReadChange']
}

export function NotificationBell({
  items = [],
  locale,
  onItemReadChange,
  ...rest
}: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const wasOpen = useRef(false)
  const config = useTigerConfig()
  const mergedLocale = mergeTigerLocale(config.locale, locale)
  const labels = getW9DataLabels(mergedLocale)
  const unread = notificationItemsPendingRead(items).length
  const announced = formatW9Label(labels.unreadCount, { count: unread })

  useEffect(() => {
    if (open) {
      wasOpen.current = true
      const panel = panelRef.current
      const candidates = panel
        ? [...panel.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]')]
        : []
      const focusable = candidates.find((element) => {
        if (element.hasAttribute('disabled')) return false
        if (element.getAttribute('aria-disabled') === 'true') return false
        return element.tabIndex >= 0
      })
      focusable?.focus()
      return
    }
    if (wasOpen.current) buttonRef.current?.focus()
  }, [open])

  return (
    <div {...rest}>
      <div className="sr-only" aria-live="polite">
        {announced}
      </div>
      <Popover
        open={open}
        placement="bottom-end"
        width="20rem"
        title={formatW9Label(labels.unreadCount, { count: unread })}
        ariaLabel={formatW9Label(labels.unreadCount, { count: unread })}
        onOpenChange={setOpen}
        content={
          <div ref={panelRef} data-tiger-notification-bell-panel="">
            <NotificationCenter
              locale={mergedLocale}
              items={items}
              onItemReadChange={onItemReadChange}
            />
          </div>
        }>
        <button
          ref={buttonRef}
          type="button"
          className={resolveButtonClasses({ variant: 'ghost', iconOnly: true })}
          data-tiger-notification-bell=""
          aria-label={formatW9Label(labels.unreadCount, { count: unread })}>
          <Badge content={unread} standalone={false} size="sm">
            <Icon name="bell" />
          </Badge>
        </button>
      </Popover>
    </div>
  )
}
