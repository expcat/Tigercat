import type { TigerLocale } from './locale'
import type { NotificationItem } from './notification-center'

type NotificationBellReadHandler = (item: NotificationItem, read: boolean) => void

export interface NotificationBellProps {
  /** Inbox rows. The bell does not read the toast queue. */
  items?: NotificationItem[]
  /** Locale object for unread copy. */
  locale?: Partial<TigerLocale>
  /** Fired when a row is marked read or unread. */
  onItemReadChange?: NotificationBellReadHandler
}
