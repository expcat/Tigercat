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
import { Tabs } from './Tabs'
import { TabPane } from './TabPane'
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

    const currentGroup = computed(() => {
      const groups = resolvedGroups.value
      if (groups.length === 0) return undefined
      const activeKey = currentGroupKey.value
      if (activeKey === undefined) return groups[0]
      const matchedIndex = groups.findIndex(
        (group, index) => getGroupKey(group, index) === activeKey
      )
      return matchedIndex >= 0 ? groups[matchedIndex] : groups[0]
    })

    const currentGroupItems = computed(() => currentGroup.value?.items ?? [])

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
            'inline-flex self-start rounded-md border border-[var(--tiger-border,#e5e7eb)] overflow-hidden'
        },
        options.map((option) =>
          h(
            'button',
            {
              key: option.key,
              class: classNames(
                'px-3 py-1 text-xs font-medium transition-colors',
                'border-r border-[var(--tiger-border,#e5e7eb)] last:border-r-0',
                currentReadFilter.value === option.key
                  ? 'bg-[var(--tiger-primary,#2563eb)] text-white'
                  : 'bg-[var(--tiger-surface,#ffffff)] text-[var(--tiger-text-muted,#6b7280)] hover:bg-[var(--tiger-surface-muted,#f9fafb)]'
              ),
              onClick: () => handleReadFilterChange(option.key)
            },
            option.label
          )
        )
      )
    }

    const renderListItem = (item: NotificationItem, index: number) => {
      const isRead = Boolean(item.read)
      const timeText = item.time ? formatActivityTime(item.time) : ''

      return h(
        'div',
        {
          class: classNames(
            'flex items-start gap-3 w-full py-0.5 transition-colors',
            !isRead &&
              'border-l-2 border-l-[var(--tiger-primary,#2563eb)] -ml-[2px] pl-[calc(0.75rem-2px)]'
          )
        },
        [
          h('div', { class: 'flex-1 min-w-0' }, [
            h('div', { class: 'flex items-baseline justify-between gap-2' }, [
              h(
                Text,
                {
                  tag: 'span',
                  size: 'sm',
                  weight: isRead ? 'normal' : 'semibold'
                },
                { default: () => item.title }
              ),
              timeText
                ? h(
                    'span',
                    {
                      class:
                        'text-xs text-[var(--tiger-text-muted,#6b7280)] whitespace-nowrap flex-shrink-0'
                    },
                    timeText
                  )
                : null
            ]),
            item.description
              ? h(
                  'div',
                  {
                    class:
                      'mt-0.5 text-xs text-[var(--tiger-text-muted,#6b7280)] line-clamp-2 leading-relaxed'
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

    const renderList = (items: NotificationItem[]) =>
      h(
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
            resolvedGroups.value.map((group, index) => {
              const effectiveGroup = effectiveGroups.value.find(
                (eg, ei) => getGroupKey(eg, ei) === getGroupKey(group, index)
              )
              const groupItems = effectiveGroup?.items ?? group.items
              const unreadCount = groupItems.filter((item) => !item.read).length
              const labelBase = group.title || String(group.key ?? index)
              const label = unreadCount > 0 ? `${labelBase} (${unreadCount})` : labelBase

              return h(
                TabPane,
                {
                  key: getGroupKey(group, index),
                  tabKey: getGroupKey(group, index),
                  label
                },
                {
                  default: () =>
                    h(
                      'div',
                      { class: 'max-h-[380px] overflow-y-auto' },
                      renderList(filterItems(groupItems))
                    )
                }
              )
            })
        }
      )

    return () => {
      const header = h('div', { class: 'flex flex-col gap-3' }, [
        h('div', { class: 'flex items-center justify-between' }, [
          h('div', { class: 'flex items-center gap-2.5' }, [
            h(Text, { tag: 'div', size: 'base', weight: 'bold' }, { default: () => props.title }),
            totalUnread.value > 0
              ? h(
                  'span',
                  {
                    class:
                      'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold rounded-full bg-[var(--tiger-primary,#2563eb)] text-white'
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
              onClick: handleMarkAllRead
            },
            { default: () => props.markAllReadText }
          )
        ]),
        renderReadFilterButtons()
      ])

      const content = props.loading
        ? h('div', { class: 'flex items-center justify-center py-12' }, [
            h(Loading, { text: props.loadingText })
          ])
        : resolvedGroups.value.length > 0
          ? h('div', { class: '-mx-4 -mb-4' }, [renderTabs()])
          : h('div', { class: '-mx-4 -mb-4 max-h-[380px] overflow-y-auto' }, [
              renderList(filterItems(effectiveItems.value))
            ])

      return h(
        'div',
        {
          ...attrs,
          class: wrapperClasses.value,
          style: wrapperStyle.value,
          'data-tiger-notification-center': true
        },
        [
          h(
            Card,
            { variant: 'bordered', className: 'w-full' },
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
