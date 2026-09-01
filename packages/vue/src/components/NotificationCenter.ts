import { defineComponent, computed, ref, watch, getCurrentInstance, PropType, h } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  buildNotificationGroups,
  formatActivityTime,
  formatBadgeCountLabel,
  shouldUseNotificationTabs,
  getNotificationCenterLabels,
  mergeTigerLocale,
  resolveLocaleText,
  notificationCenterItemClasses,
  notificationCenterUnreadItemClasses,
  notificationCenterReadItemClasses,
  notificationCenterReadTitleClasses,
  notificationCenterUnreadTitleClasses,
  notificationCenterUnreadDotClasses,
  notificationCenterTimeClasses,
  notificationCenterReadDescriptionClasses,
  notificationCenterUnreadDescriptionClasses,
  notificationCenterItemActionClasses,
  notificationCenterEmptyIconWrapperClasses,
  notificationCenterEmptyIconClasses,
  notificationCenterEmptyTextClasses,
  notificationCenterLoadingClasses,
  notificationCenterCardClasses,
  notificationCenterTitleClasses,
  notificationCenterUnreadBadgeClasses,
  notificationCenterMarkAllBaseClasses,
  notificationCenterMarkAllEnabledClasses,
  notificationCenterMarkAllDisabledClasses,
  notificationCenterFilterGroupClasses,
  notificationCenterFilterButtonClasses,
  notificationCenterFilterActiveClasses,
  notificationCenterFilterIdleClasses,
  type NotificationCenterProps as CoreNotificationCenterProps,
  type NotificationGroup,
  type NotificationItem,
  type NotificationReadFilter,
  type TigerLocale,
  type TigerLocaleNotificationCenter
} from '@expcat/tigercat-core'
import { Card } from './Card'
import { Tabs, TabPane } from './Tabs'
import { List } from './List'
import { Text } from './Text'
import { Button } from './Button'
import { Loading } from './Loading'
import { useTigerConfig } from './ConfigProvider'

type ReadFilterOption = {
  key: NotificationReadFilter
  label: string
}

export interface VueNotificationCenterProps extends CoreNotificationCenterProps {
  className?: string
  style?: Record<string, string | number>
}

const getGroupKey = (group: NotificationGroup, index: number): string | number => {
  return group.key ?? group.title ?? index
}

export const NotificationCenter = defineComponent({
  name: 'TigerNotificationCenter',
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<NotificationItem[]>,
      default: () => []
    },
    groups: {
      type: Array as PropType<NotificationGroup[]>,
      default: undefined
    },
    groupBy: {
      type: Function as PropType<(item: NotificationItem) => string>,
      default: undefined
    },
    groupOrder: {
      type: Array as PropType<string[]>,
      default: undefined
    },
    activeGroupKey: {
      type: [String, Number] as PropType<string | number>,
      default: undefined
    },
    defaultActiveGroupKey: {
      type: [String, Number] as PropType<string | number>,
      default: undefined
    },
    readFilter: {
      type: String as PropType<NotificationReadFilter>,
      default: undefined
    },
    defaultReadFilter: {
      type: String as PropType<NotificationReadFilter>,
      default: 'all' as NotificationReadFilter
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: undefined
    },
    emptyText: {
      type: String,
      default: undefined
    },
    title: {
      type: String,
      default: undefined
    },
    allLabel: {
      type: String,
      default: undefined
    },
    unreadLabel: {
      type: String,
      default: undefined
    },
    readLabel: {
      type: String,
      default: undefined
    },
    markAllReadText: {
      type: String,
      default: undefined
    },
    markReadText: {
      type: String,
      default: undefined
    },
    markUnreadText: {
      type: String,
      default: undefined
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    labels: {
      type: Object as PropType<Partial<TigerLocaleNotificationCenter>>,
      default: undefined
    },
    manageReadState: {
      type: Boolean,
      default: false
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: [
    'update:activeGroupKey',
    'group-change',
    'update:readFilter',
    'read-filter-change',
    'mark-all-read',
    'item-click',
    'item-read-change'
  ],
  setup(props, { emit, attrs }) {
    const instance = getCurrentInstance()
    const vnodeProps = () => (instance?.vnode.props ?? {}) as Record<string, unknown>
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getNotificationCenterLabels(mergedLocale.value, props.labels))

    const resolvedGroups = computed(() =>
      buildNotificationGroups(
        props.items,
        props.groups,
        props.groupBy,
        props.groupOrder,
        labels.value.defaultGroupTitle
      )
    )

    const internalActiveGroupKey = ref<string | number | undefined>(props.defaultActiveGroupKey)
    const internalReadFilter = ref<NotificationReadFilter>(props.defaultReadFilter ?? 'all')

    const resolveFirstKey = (groups: NotificationGroup[]) => {
      if (groups.length === 0) return undefined
      return getGroupKey(groups[0], 0)
    }

    const currentGroupKey = computed(() => {
      const firstKey = resolveFirstKey(resolvedGroups.value)
      return props.activeGroupKey ?? internalActiveGroupKey.value ?? firstKey
    })

    const currentReadFilter = computed(() => {
      return props.readFilter ?? internalReadFilter.value
    })

    watch(
      resolvedGroups,
      (nextGroups) => {
        if (props.activeGroupKey !== undefined) return
        const nextKeys = nextGroups.map((group, index) => getGroupKey(group, index))
        if (nextKeys.length === 0) {
          internalActiveGroupKey.value = undefined
          return
        }
        if (!nextKeys.some((key) => key === currentGroupKey.value)) {
          internalActiveGroupKey.value = nextKeys[0]
        }
      },
      { immediate: true }
    )

    // --- Internal read-state management ---
    const readStateOverrides = ref(new Map<string | number, boolean>())

    const applyReadOverrides = (items: NotificationItem[]): NotificationItem[] => {
      if (!props.manageReadState || readStateOverrides.value.size === 0) return items
      return items.map((item) => {
        const override = readStateOverrides.value.get(item.id)
        return override !== undefined ? { ...item, read: override } : item
      })
    }

    watch(
      () => [props.items, props.groups] as const,
      () => {
        if (!props.manageReadState || readStateOverrides.value.size === 0) return
        const source = (props.groups ?? [])
          .flatMap((group) => group.items ?? [])
          .concat(props.items ?? [])
        const next = new Map(readStateOverrides.value)
        for (const [id, read] of readStateOverrides.value) {
          const item = source.find((entry) => entry.id === id)
          if (!item || Boolean(item.read) === read) next.delete(id)
        }
        readStateOverrides.value = next
      }
    )

    const effectiveGroups = computed(() =>
      resolvedGroups.value.map((group) => ({
        ...group,
        items: applyReadOverrides(group.items)
      }))
    )

    const effectiveItems = computed(() => applyReadOverrides(props.items))

    const totalUnread = computed(() => {
      const allItems = effectiveGroups.value.flatMap((group) => group.items)
      if (allItems.length === 0) return effectiveItems.value.filter((item) => !item.read).length
      return allItems.filter((item) => !item.read).length
    })

    const filterItems = (items: NotificationItem[]) => {
      const filter = currentReadFilter.value
      return items.filter((item) => {
        const isRead = Boolean(item.read)
        if (filter === 'read') return isRead
        if (filter === 'unread') return !isRead
        return true
      })
    }

    const allManagedItems = computed(() => {
      const grouped = effectiveGroups.value.flatMap((group) => group.items)
      return grouped.length > 0 ? grouped : effectiveItems.value
    })

    const hasUnread = computed(() => allManagedItems.value.some((item) => !item.read))

    const groupTabData = computed(() =>
      resolvedGroups.value.map((group, index) => {
        const effectiveGroup = effectiveGroups.value.find(
          (eg, ei) => getGroupKey(eg, ei) === getGroupKey(group, index)
        )
        const groupItems = effectiveGroup?.items ?? group.items
        const unreadCount = groupItems.filter((item) => !item.read).length
        const labelBase = group.title || String(group.key ?? index)
        const label = unreadCount > 0 ? `${labelBase} (${unreadCount})` : labelBase
        const filteredItems = filterItems(groupItems)
        return { key: getGroupKey(group, index), label, filteredItems }
      })
    )

    const filteredFlatItems = computed(() => filterItems(effectiveItems.value))

    const wrapperClasses = computed(() =>
      classNames(
        'tiger-notification-center',
        'w-full',
        'flex',
        'flex-col',
        props.className,
        coerceClassValue(attrs.class)
      )
    )

    const wrapperStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    const handleGroupChange = (key: string | number) => {
      if (props.activeGroupKey === undefined) {
        internalActiveGroupKey.value = key
      }
      emit('update:activeGroupKey', key)
      emit('group-change', key)
    }

    const handleReadFilterChange = (filter: NotificationReadFilter) => {
      if (props.readFilter === undefined) {
        internalReadFilter.value = filter
      }
      emit('update:readFilter', filter)
      emit('read-filter-change', filter)
    }

    const handleMarkAllRead = () => {
      const items = allManagedItems.value
      if (props.manageReadState) {
        const next = new Map(readStateOverrides.value)
        items.forEach((item) => next.set(item.id, true))
        readStateOverrides.value = next
      }
      emit('mark-all-read', undefined, items)
    }

    const handleItemClick = (item: NotificationItem, index: number) => {
      emit('item-click', item, index)
    }

    const handleItemReadChange = (item: NotificationItem, nextRead: boolean) => {
      if (props.manageReadState) {
        const next = new Map(readStateOverrides.value)
        next.set(item.id, nextRead)
        readStateOverrides.value = next
      }
      emit('item-read-change', item, nextRead)
    }

    const renderReadFilterButtons = () => {
      const options: ReadFilterOption[] = [
        { key: 'all', label: resolveLocaleText(labels.value.allLabel, props.allLabel) },
        { key: 'unread', label: resolveLocaleText(labels.value.unreadLabel, props.unreadLabel) },
        { key: 'read', label: resolveLocaleText(labels.value.readLabel, props.readLabel) }
      ]

      return h(
        'div',
        {
          class: notificationCenterFilterGroupClasses,
          role: 'radiogroup'
        },
        options.map((option) =>
          h(
            'button',
            {
              key: option.key,
              type: 'button',
              role: 'radio',
              'aria-checked': currentReadFilter.value === option.key,
              class: classNames(
                notificationCenterFilterButtonClasses,
                currentReadFilter.value === option.key
                  ? notificationCenterFilterActiveClasses
                  : notificationCenterFilterIdleClasses
              ),
              onClick: () => handleReadFilterChange(option.key)
            },
            option.label
          )
        )
      )
    }

    const renderListItem = (item: NotificationItem, _index: number) => {
      const isRead = Boolean(item.read)
      const timeText = formatActivityTime(item.time, mergedLocale.value)

      return h(
        'div',
        {
          class: classNames(
            notificationCenterItemClasses,
            isRead ? notificationCenterReadItemClasses : notificationCenterUnreadItemClasses
          )
        },
        [
          h('div', { class: 'flex-1 min-w-0' }, [
            h('div', { class: 'flex items-baseline justify-between gap-2' }, [
              h('div', { class: 'flex items-center gap-1.5' }, [
                h(
                  Text,
                  {
                    tag: 'span',
                    size: 'sm',
                    weight: isRead ? 'normal' : 'semibold',
                    class: isRead
                      ? notificationCenterReadTitleClasses
                      : notificationCenterUnreadTitleClasses
                  },
                  { default: () => item.title }
                ),
                !isRead
                  ? h('span', {
                      class: notificationCenterUnreadDotClasses,
                      'aria-hidden': 'true'
                    })
                  : null
              ]),
              timeText
                ? h(
                    'span',
                    {
                      class: notificationCenterTimeClasses
                    },
                    timeText
                  )
                : null
            ]),
            item.description
              ? h(
                  'div',
                  {
                    class: classNames(
                      'mt-1 text-xs leading-relaxed line-clamp-2',
                      isRead
                        ? notificationCenterReadDescriptionClasses
                        : notificationCenterUnreadDescriptionClasses
                    )
                  },
                  item.description
                )
              : null
          ]),
          h(
            Button,
            {
              size: 'sm',
              variant: 'ghost',
              class: notificationCenterItemActionClasses,
              onClick: (event: MouseEvent) => {
                event.stopPropagation()
                handleItemReadChange(item, !isRead)
              }
            },
            {
              default: () =>
                isRead
                  ? resolveLocaleText(labels.value.markUnreadText, props.markUnreadText)
                  : resolveLocaleText(labels.value.markReadText, props.markReadText)
            }
          )
        ]
      )
    }

    const renderList = (items: NotificationItem[]) => {
      if (items.length === 0) {
        return h(
          'div',
          { class: 'flex flex-col items-center justify-center py-14 px-4 text-center' },
          [
            h(
              'div',
              {
                class: notificationCenterEmptyIconWrapperClasses
              },
              [
                h(
                  'svg',
                  {
                    class: notificationCenterEmptyIconClasses,
                    fill: 'none',
                    viewBox: '0 0 24 24',
                    stroke: 'currentColor',
                    strokeWidth: '1.5'
                  },
                  [
                    h('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      d: 'M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0'
                    })
                  ]
                )
              ]
            ),
            h(
              Text,
              {
                tag: 'div',
                size: 'sm',
                color: 'muted',
                class: notificationCenterEmptyTextClasses
              },
              { default: () => resolveLocaleText(labels.value.emptyText, props.emptyText) }
            )
          ]
        )
      }

      return h(
        List,
        {
          dataSource: items,
          rowKey: 'id',
          split: true,
          hoverable: typeof vnodeProps().onItemClick === 'function',
          emptyText: resolveLocaleText(labels.value.emptyText, props.emptyText),
          onItemClick: typeof vnodeProps().onItemClick === 'function' ? handleItemClick : undefined
        },
        {
          renderItem: ({ item, index }: { item: NotificationItem; index: number }) =>
            renderListItem(item, index)
        }
      )
    }

    const renderTabs = () =>
      h(
        Tabs,
        {
          type: 'line',
          size: 'small',
          swipeable: false,
          activeKey: currentGroupKey.value,
          onChange: handleGroupChange
        },
        {
          default: () =>
            groupTabData.value.map((tab) =>
              h(
                TabPane,
                {
                  key: tab.key,
                  tabKey: tab.key,
                  label: tab.label
                },
                {
                  default: () =>
                    h(
                      'div',
                      { class: 'max-h-[380px] overflow-y-auto' },
                      renderList(tab.filteredItems)
                    )
                }
              )
            )
        }
      )

    return () => {
      const header = h('div', { class: 'flex flex-col gap-3' }, [
        h('div', { class: 'flex items-center justify-between' }, [
          h('div', { class: 'flex items-center gap-2.5' }, [
            h(
              Text,
              {
                tag: 'div',
                size: 'base',
                weight: 'bold',
                class: notificationCenterTitleClasses
              },
              { default: () => resolveLocaleText(labels.value.title, props.title) }
            ),
            totalUnread.value > 0
              ? h(
                  'span',
                  {
                    class: notificationCenterUnreadBadgeClasses,
                    'aria-label': formatBadgeCountLabel(
                      labels.value.unreadCountText,
                      totalUnread.value,
                      mergedLocale.value?.locale
                    )
                  },
                  String(totalUnread.value)
                )
              : null
          ]),
          h(
            Button,
            {
              size: 'sm',
              variant: 'ghost',
              disabled: !hasUnread.value,
              class: classNames(
                notificationCenterMarkAllBaseClasses,
                hasUnread.value
                  ? notificationCenterMarkAllEnabledClasses
                  : notificationCenterMarkAllDisabledClasses
              ),
              onClick: handleMarkAllRead
            },
            {
              default: () => resolveLocaleText(labels.value.markAllReadText, props.markAllReadText)
            }
          )
        ]),
        renderReadFilterButtons()
      ])

      const listBody = shouldUseNotificationTabs(props.groups, props.groupBy)
        ? resolvedGroups.value.length > 0
          ? h('div', { class: '-mx-4 -mb-4' }, [renderTabs()])
          : h('div', { class: '-mx-4 -mb-4 max-h-[380px] overflow-y-auto' }, [renderList([])])
        : h('div', { class: '-mx-4 -mb-4 max-h-[380px] overflow-y-auto' }, [
            renderList(filteredFlatItems.value)
          ])
      const hasList = shouldUseNotificationTabs(props.groups, props.groupBy)
        ? resolvedGroups.value.length > 0 || filteredFlatItems.value.length > 0
        : filteredFlatItems.value.length > 0
      const content =
        props.loading && !hasList
          ? h('div', { class: 'flex items-center justify-center py-16' }, [
              h(Loading, {
                text: resolveLocaleText(labels.value.loadingText, props.loadingText),
                class: notificationCenterLoadingClasses
              })
            ])
          : h('div', { class: 'relative', 'aria-busy': props.loading ? 'true' : undefined }, [
              listBody,
              props.loading
                ? h(
                    'div',
                    {
                      class:
                        'absolute inset-0 flex items-center justify-center bg-[var(--tiger-surface,#ffffff)]/70'
                    },
                    [
                      h(Loading, {
                        text: resolveLocaleText(labels.value.loadingText, props.loadingText),
                        class: notificationCenterLoadingClasses
                      })
                    ]
                  )
                : null
            ])

      const ariaLabel =
        (attrs['aria-label'] as string | undefined) ??
        (attrs['aria-labelledby'] ? undefined : resolveLocaleText(labels.value.title, props.title))

      return h(
        'div',
        {
          ...attrs,
          class: wrapperClasses.value,
          style: wrapperStyle.value,
          role: (attrs.role as string | undefined) ?? 'region',
          'aria-busy': props.loading ? 'true' : undefined,
          'aria-label': ariaLabel,
          'data-tiger-notification-center': true
        },
        [
          h(
            Card,
            {
              variant: 'bordered',
              className: notificationCenterCardClasses
            },
            {
              header: () => header,
              default: () => content
            }
          )
        ]
      )
    }
  }
})

export default NotificationCenter
