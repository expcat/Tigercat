import { defineComponent, computed, ref, watch, PropType, h } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
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
      default: '加载中...'
    },
    emptyText: {
      type: String,
      default: '暂无通知'
    },
    title: {
      type: String,
      default: '通知中心'
    },
    allLabel: {
      type: String,
      default: '全部'
    },
    unreadLabel: {
      type: String,
      default: '未读'
    },
    readLabel: {
      type: String,
      default: '已读'
    },
    markAllReadText: {
      type: String,
      default: '全部标记已读'
    },
    markReadText: {
      type: String,
      default: '标记已读'
    },
    markUnreadText: {
      type: String,
      default: '标记未读'
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
    const resolvedGroups = computed(() =>
      buildNotificationGroups(props.items, props.groups, props.groupBy, props.groupOrder)
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

    const _currentGroup = computed(() => {
      const groups = resolvedGroups.value
      if (groups.length === 0) return undefined
      const activeKey = currentGroupKey.value
      if (activeKey === undefined) return groups[0]
      const matchedIndex = groups.findIndex(
        (group, index) => getGroupKey(group, index) === activeKey
      )
      return matchedIndex >= 0 ? groups[matchedIndex] : groups[0]
    })

    // --- Internal read-state management ---
    const readStateOverrides = ref(new Map<string | number, boolean>())

    const applyReadOverrides = (items: NotificationItem[]): NotificationItem[] => {
      if (!props.manageReadState || readStateOverrides.value.size === 0) return items
      return items.map((item) => {
        const override = readStateOverrides.value.get(item.id)
        return override !== undefined ? { ...item, read: override } : item
      })
    }

    // Reset overrides when source items change
    watch(
      () => props.items,
      () => {
        if (props.manageReadState) readStateOverrides.value = new Map()
      }
    )

    const effectiveGroups = computed(() =>
      resolvedGroups.value.map((group) => ({
        ...group,
        items: applyReadOverrides(group.items)
      }))
    )

    const effectiveCurrentGroup = computed(() => {
      const groups = effectiveGroups.value
      if (groups.length === 0) return undefined
      const activeKey = currentGroupKey.value
      if (activeKey === undefined) return groups[0]
      const matchedIndex = groups.findIndex(
        (group, index) => getGroupKey(group, index) === activeKey
      )
      return matchedIndex >= 0 ? groups[matchedIndex] : groups[0]
    })

    const effectiveCurrentGroupItems = computed(() => effectiveCurrentGroup.value?.items ?? [])

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

    const hasUnread = computed(() => effectiveCurrentGroupItems.value.some((item) => !item.read))

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
      const items = effectiveCurrentGroupItems.value
      if (props.manageReadState) {
        const next = new Map(readStateOverrides.value)
        items.forEach((item) => next.set(item.id, true))
        readStateOverrides.value = next
      }
      emit('mark-all-read', currentGroupKey.value, items)
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
        { key: 'all', label: props.allLabel },
        { key: 'unread', label: props.unreadLabel },
        { key: 'read', label: props.readLabel }
      ]

      return h(
        'div',
        {
          class:
            'inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-gray-100/80 dark:bg-gray-800/60 self-start'
        },
        options.map((option) =>
          h(
            'button',
            {
              key: option.key,
              class: classNames(
                'px-3.5 py-1 text-xs font-semibold rounded-md transition-all duration-200',
                currentReadFilter.value === option.key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm scale-102'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
      const timeText = item.time ? formatActivityTime(item.time) : ''

      return h(
        'div',
        {
          class: classNames(
            'group relative flex items-start gap-3.5 w-full p-3.5 rounded-xl transition-all duration-300 hover:bg-gray-50/60 dark:hover:bg-gray-800/30',
            !isRead
              ? 'bg-blue-50/20 dark:bg-blue-950/5 hover:bg-blue-50/40 dark:hover:bg-blue-950/10 border-l-[3px] border-l-blue-500/80 -ml-[3px] pl-[calc(0.875rem-3px)]'
              : 'border-l-[3px] border-l-transparent -ml-[3px] pl-[calc(0.875rem-3px)]'
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
                      ? 'text-gray-600 dark:text-gray-400'
                      : 'text-gray-900 dark:text-gray-100'
                  },
                  { default: () => item.title }
                ),
                !isRead
                  ? h('span', {
                      class:
                        'w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 shrink-0 shadow-sm shadow-blue-500/40 animate-pulse'
                    })
                  : null
              ]),
              timeText
                ? h(
                    'span',
                    {
                      class:
                        'text-[11px] text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap flex-shrink-0 self-center'
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
                        ? 'text-gray-500 dark:text-gray-400'
                        : 'text-gray-600 dark:text-gray-300'
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
              class:
                'opacity-0 group-hover:opacity-100 focus:opacity-100 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all duration-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-0 flex-shrink-0 self-center',
              onClick: (event: MouseEvent) => {
                event.stopPropagation()
                handleItemReadChange(item, !isRead)
              }
            },
            { default: () => (isRead ? props.markUnreadText : props.markReadText) }
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
                class: 'p-3.5 bg-gray-50 dark:bg-gray-900 rounded-full mb-3 shadow-inner'
              },
              [
                h(
                  'svg',
                  {
                    class: 'w-8 h-8 text-gray-400 dark:text-gray-600 animate-pulse',
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
                class: 'font-semibold text-gray-400 dark:text-gray-500'
              },
              { default: () => props.emptyText }
            )
          ]
        )
      }

      return h(
        List,
        {
          dataSource: items,
          split: true,
          bordered: 'divided',
          hoverable: true,
          emptyText: props.emptyText,
          onItemClick: handleItemClick
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
                class: 'text-gray-900 dark:text-gray-100'
              },
              { default: () => props.title }
            ),
            totalUnread.value > 0
              ? h(
                  'span',
                  {
                    class:
                      'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/20 animate-pulse'
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
                'text-xs font-semibold transition-colors duration-200',
                hasUnread.value
                  ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                  : 'text-gray-400 dark:text-gray-600'
              ),
              onClick: handleMarkAllRead
            },
            { default: () => props.markAllReadText }
          )
        ]),
        renderReadFilterButtons()
      ])

      const content = props.loading
        ? h('div', { class: 'flex items-center justify-center py-16' }, [
            h(Loading, {
              text: props.loadingText,
              class: 'text-blue-500 dark:text-blue-400 font-medium'
            })
          ])
        : resolvedGroups.value.length > 0
          ? h('div', { class: '-mx-4 -mb-4' }, [renderTabs()])
          : h('div', { class: '-mx-4 -mb-4 max-h-[380px] overflow-y-auto' }, [
              renderList(filteredFlatItems.value)
            ])

      const ariaLabel =
        (attrs['aria-label'] as string | undefined) ??
        (attrs['aria-labelledby'] ? undefined : props.title)

      return h(
        'div',
        {
          ...attrs,
          class: wrapperClasses.value,
          style: wrapperStyle.value,
          role: (attrs.role as string | undefined) ?? 'region',
          'aria-label': ariaLabel,
          'data-tiger-notification-center': true
        },
        [
          h(
            Card,
            {
              variant: 'bordered',
              className:
                'w-full rounded-2xl border border-gray-100/80 dark:border-gray-800/80 bg-white/95 dark:bg-gray-950/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 overflow-hidden'
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
