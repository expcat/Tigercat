import React, { useEffect, useRef, useState } from 'react'
import {
  formatW9Label,
  getW9DataLabels,
  notificationItemsPendingRead,
  type NotificationItem
} from '@expcat/tigercat-core'
import { NotificationCenter } from './NotificationCenter'
import { Popover } from './Popover'

export interface NotificationBellProps {
  items?: NotificationItem[]
  locale?: string
  onItemReadChange?: (item: NotificationItem, read: boolean) => void
}

export function NotificationBell({
  items = [],
  locale,
  onItemReadChange
}: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)
  const labels = getW9DataLabels(locale)
  const unread = notificationItemsPendingRead(items).length
  const [announced] = useState(() => formatW9Label(labels.unreadCount, { count: unread }))

  useEffect(() => {
    if (open) {
      wasOpen.current = true
      const panel = document.querySelector('[data-tiger-notification-bell-panel]')
      const focusable = panel?.querySelector<HTMLElement>('button, [href], input, [tabindex]')
      focusable?.focus()
      return
    }
    if (wasOpen.current) buttonRef.current?.focus()
  }, [open])

  return (
    <div>
      <div className="sr-only" aria-live="polite">
        {announced}
      </div>
      <Popover
        open={open}
        title={formatW9Label(labels.unreadCount, { count: unread })}
        ariaLabel={formatW9Label(labels.unreadCount, { count: unread })}
        onOpenChange={setOpen}
        content={
          <div data-tiger-notification-bell-panel="">
            <NotificationCenter items={items} onItemReadChange={onItemReadChange} />
          </div>
        }>
        <button
          ref={buttonRef}
          type="button"
          data-tiger-notification-bell=""
          aria-label={formatW9Label(labels.unreadCount, { count: unread })}>
          {unread}
        </button>
      </Popover>
    </div>
  )
}
