import type { TigerLocale } from './locale'

export interface NotificationBellItem {
  id: string
  title: string
  read?: boolean
}

export interface NotificationBellProps {
  /** Inbox rows. The bell does not read the toast queue. */
  items?: NotificationBellItem[]
  /** Locale object for unread copy. */
  locale?: Partial<TigerLocale>
}
