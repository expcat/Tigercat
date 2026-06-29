import React, { useMemo, useEffect, useState, useCallback } from 'react'
import {
  classNames,
  buildNotificationGroups,
  formatActivityTime,
  type NotificationCenterProps as CoreNotificationCenterProps,
  type NotificationGroup,
  type NotificationItem,
  type NotificationReadFilter
} from '@expcat/tigercat-core'
import { Card } from './Card'
import { Tabs, TabPane } from './Tabs'
import { List } from './List'
import { Text } from './Text'
import { Button } from './Button'
import { Loading } from './Loading'

export interface NotificationCenterProps
  extends CoreNotificationCenterProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {}

const getGroupKey = (group: NotificationGroup, index: number): string | number => {
  return group.key ?? group.title ?? index
}

const filterItems = (items: NotificationItem[], filter: NotificationReadFilter) => {
  return items.filter((item) => {
    const isRead = Boolean(item.read)
    if (filter === 'read') return isRead
    if (filter === 'unread') return !isRead
    return true
  })
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  items = [],
  groups,
  groupBy,
  groupOrder,
  activeGroupKey,
  defaultActiveGroupKey,
  readFilter,
  defaultReadFilter = 'all',
  loading = false,
  loadingText = '加载中...',
  emptyText = '暂无通知',
  title = '通知中心',
  allLabel = '全部',
  unreadLabel = '未读',
  readLabel = '已读',
  markAllReadText = '全部标记已读',
  markReadText = '标记已读',
  markUnreadText = '标记未读',
  manageReadState = false,
  onGroupChange,
  onReadFilterChange,
  onMarkAllRead,
  onItemClick,
  onItemReadChange,
  className,
  ...props
}) => {
  const resolvedGroups = useMemo(
    () => buildNotificationGroups(items, groups, groupBy, groupOrder),
    [items, groups, groupBy, groupOrder]
  )

  const firstGroupKey = useMemo(() => {
    return resolvedGroups.length > 0 ? getGroupKey(resolvedGroups[0], 0) : undefined
  }, [resolvedGroups])

  const [internalGroupKey, setInternalGroupKey] = useState<string | number | undefined>(
    defaultActiveGroupKey
  )

  const [internalReadFilter, setInternalReadFilter] =
    useState<NotificationReadFilter>(defaultReadFilter)

  const currentGroupKey = activeGroupKey ?? internalGroupKey ?? firstGroupKey
  const currentReadFilter = readFilter ?? internalReadFilter

  useEffect(() => {
    if (activeGroupKey !== undefined) return
    if (resolvedGroups.length === 0) {
      setInternalGroupKey(undefined)
      return
    }
    const keys = resolvedGroups.map((group, index) => getGroupKey(group, index))
    if (!keys.some((key) => key === currentGroupKey)) {
      setInternalGroupKey(keys[0])
    }
  }, [activeGroupKey, currentGroupKey, resolvedGroups])

  // --- Internal read-state management ---
  const [readStateOverrides, setReadStateOverrides] = useState(
    () => new Map<string | number, boolean>()
  )

  // Reset overrides when source items change
  useEffect(() => {
    if (manageReadState) setReadStateOverrides(new Map())
  }, [items, manageReadState])

  const applyReadOverrides = useCallback(
    (list: NotificationItem[]): NotificationItem[] => {
      if (!manageReadState || readStateOverrides.size === 0) return list
      return list.map((item) => {
        const override = readStateOverrides.get(item.id)
        return override !== undefined ? { ...item, read: override } : item
      })
    },
    [manageReadState, readStateOverrides]
  )

  const effectiveGroups = useMemo(
    () =>
      resolvedGroups.map((group) => ({
        ...group,
        items: applyReadOverrides(group.items)
      })),
    [resolvedGroups, applyReadOverrides]
  )

  const effectiveCurrentGroup = useMemo(() => {
    if (effectiveGroups.length === 0) return undefined
    if (currentGroupKey === undefined) return effectiveGroups[0]
    const index = effectiveGroups.findIndex(
      (group, groupIndex) => getGroupKey(group, groupIndex) === currentGroupKey
    )
    return index >= 0 ? effectiveGroups[index] : effectiveGroups[0]
  }, [currentGroupKey, effectiveGroups])

  const effectiveCurrentGroupItems = useMemo(
    () => effectiveCurrentGroup?.items ?? [],
    [effectiveCurrentGroup]
  )
  const effectiveItems = useMemo(() => applyReadOverrides(items), [items, applyReadOverrides])

  const hasUnread = useMemo(
    () => effectiveCurrentGroupItems.some((item) => !item.read),
    [effectiveCurrentGroupItems]
  )

  const totalUnread = useMemo(() => {
    const allItems = effectiveGroups.flatMap((group) => group.items)
    if (allItems.length === 0) return effectiveItems.filter((item) => !item.read).length
    return allItems.filter((item) => !item.read).length
  }, [effectiveGroups, effectiveItems])

  const wrapperClasses = useMemo(
    () => classNames('tiger-notification-center', 'w-full', 'flex', 'flex-col', className),
    [className]
  )

  const filterButtons = useMemo<Array<{ key: NotificationReadFilter; label: string }>>(
    () => [
      { key: 'all', label: allLabel },
      { key: 'unread', label: unreadLabel },
      { key: 'read', label: readLabel }
    ],
    [allLabel, unreadLabel, readLabel]
  )

  const groupTabData = useMemo(
    () =>
      resolvedGroups.map((group, index) => {
        const effectiveGroup = effectiveGroups.find(
          (eg, ei) => getGroupKey(eg, ei) === getGroupKey(group, index)
        )
        const groupItems = effectiveGroup?.items ?? group.items
        const unreadCount = groupItems.filter((item) => !item.read).length
        const labelBase = group.title || String(group.key ?? index)
        const label = unreadCount > 0 ? `${labelBase} (${unreadCount})` : labelBase
        const filteredItems = filterItems(groupItems, currentReadFilter)
        return { key: getGroupKey(group, index), label, filteredItems }
      }),
    [resolvedGroups, effectiveGroups, currentReadFilter]
  )

  const filteredFlatItems = useMemo(
    () => filterItems(effectiveItems, currentReadFilter),
    [effectiveItems, currentReadFilter]
  )

  const handleGroupChange = (key: string | number) => {
    if (activeGroupKey === undefined) {
      setInternalGroupKey(key)
    }
    onGroupChange?.(key)
  }

  const handleReadFilterChange = (next: NotificationReadFilter) => {
    if (readFilter === undefined) {
      setInternalReadFilter(next)
    }
    onReadFilterChange?.(next)
  }

  const handleMarkAllRead = () => {
    if (manageReadState) {
      setReadStateOverrides((prev) => {
        const next = new Map(prev)
        effectiveCurrentGroupItems.forEach((item) => next.set(item.id, true))
        return next
      })
    }
    onMarkAllRead?.(currentGroupKey, effectiveCurrentGroupItems)
  }

  const renderItem = (item: NotificationItem, _index: number) => {
    const isRead = Boolean(item.read)
    const timeText = item.time ? formatActivityTime(item.time) : ''

    return (
      <div
        className={classNames(
          'group relative flex items-start gap-3.5 w-full p-3.5 rounded-xl transition-all duration-300 hover:bg-gray-50/60 dark:hover:bg-gray-800/30',
          !isRead
            ? 'bg-blue-50/20 dark:bg-blue-950/5 hover:bg-blue-50/40 dark:hover:bg-blue-950/10 border-l-[3px] border-l-blue-500/80 -ml-[3px] pl-[calc(0.875rem-3px)]'
            : 'border-l-[3px] border-l-transparent -ml-[3px] pl-[calc(0.875rem-3px)]'
        )}>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Text
                tag="span"
                size="sm"
                weight={isRead ? 'normal' : 'semibold'}
                className={
                  isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'
                }>
                {item.title}
              </Text>
              {!isRead && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 shrink-0 shadow-sm shadow-blue-500/40 animate-pulse" />
              )}
            </div>
            {timeText ? (
              <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap flex-shrink-0 self-center">
                {timeText}
              </span>
            ) : null}
          </div>
          {item.description ? (
            <div
              className={classNames(
                'mt-1 text-xs leading-relaxed line-clamp-2',
                isRead ? 'text-gray-500 dark:text-gray-400' : 'text-gray-600 dark:text-gray-300'
              )}>
              {item.description}
            </div>
          ) : null}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all duration-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-0 flex-shrink-0 self-center"
          onClick={(event) => {
            event.stopPropagation()
            if (manageReadState) {
              setReadStateOverrides((prev) => {
                const next = new Map(prev)
                next.set(item.id, !isRead)
                return next
              })
            }
            onItemReadChange?.(item, !isRead)
          }}>
          {isRead ? markUnreadText : markReadText}
        </Button>
      </div>
    )
  }

  const renderList = (listItems: NotificationItem[]) => {
    if (listItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
          <div className="p-3.5 bg-gray-50 dark:bg-gray-900 rounded-full mb-3 shadow-inner">
            <svg
              className="w-8 h-8 text-gray-400 dark:text-gray-600 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
              />
            </svg>
          </div>
          <Text
            tag="div"
            size="sm"
            color="muted"
            className="font-semibold text-gray-400 dark:text-gray-500">
            {emptyText}
          </Text>
        </div>
      )
    }

    return (
      <List
        dataSource={listItems}
        split
        bordered="divided"
        hoverable
        emptyText={emptyText}
        onItemClick={(item, index) => onItemClick?.(item, index)}
        renderItem={renderItem}
      />
    )
  }

  const content = loading ? (
    <div className="flex items-center justify-center py-16">
      <Loading text={loadingText} className="text-blue-500 dark:text-blue-400 font-medium" />
    </div>
  ) : resolvedGroups.length > 0 ? (
    <div className="-mx-4 -mb-4">
      <Tabs type="line" size="small" activeKey={currentGroupKey} onActiveKeyChange={handleGroupChange}>
        {groupTabData.map((tab) => (
          <TabPane key={String(tab.key)} tabKey={tab.key} label={tab.label}>
            <div className="max-h-[380px] overflow-y-auto">{renderList(tab.filteredItems)}</div>
          </TabPane>
        ))}
      </Tabs>
    </div>
  ) : (
    <div className="-mx-4 -mb-4 max-h-[380px] overflow-y-auto">{renderList(filteredFlatItems)}</div>
  )

  return (
    <div
      className={wrapperClasses}
      role={props.role ?? 'region'}
      aria-label={props['aria-label'] ?? (props['aria-labelledby'] ? undefined : title)}
      {...props}
      data-tiger-notification-center>
      <Card
        variant="bordered"
        className="w-full rounded-2xl border border-gray-100/80 dark:border-gray-800/80 bg-white/95 dark:bg-gray-950/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 overflow-hidden"
        header={
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Text
                  tag="div"
                  size="base"
                  weight="bold"
                  className="text-gray-900 dark:text-gray-100">
                  {title}
                </Text>
                {totalUnread > 0 ? (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/20 animate-pulse">
                    {totalUnread}
                  </span>
                ) : null}
              </div>
              <Button
                size="sm"
                variant="ghost"
                disabled={!hasUnread}
                onClick={handleMarkAllRead}
                className={classNames(
                  'text-xs font-semibold transition-colors duration-200',
                  hasUnread
                    ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                    : 'text-gray-400 dark:text-gray-600'
                )}>
                {markAllReadText}
              </Button>
            </div>
            <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-gray-100/80 dark:bg-gray-800/60 self-start">
              {filterButtons.map((option) => (
                <button
                  key={option.key}
                  className={classNames(
                    'px-3.5 py-1 text-xs font-semibold rounded-md transition-all duration-200',
                    currentReadFilter === option.key
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm scale-102'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  )}
                  onClick={() => handleReadFilterChange(option.key)}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        }>
        {content}
      </Card>
    </div>
  )
}

export default NotificationCenter
