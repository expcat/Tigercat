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

    const filterItems = (items: NotificationItem[]) => {
      const filter = currentReadFilter.value
      return items.filter((item) => {
        const isRead = Boolean(item.read)
        if (filter === 'read') return isRead
        if (filter === 'unread') return !isRead
        return true
      })
    }

    const hasUnread = computed(() => currentGroupItems.value.some((item) => !item.read))

    const wrapperClasses = computed(() =>
      classNames(
        'tiger-notification-center',
        'w-full',
        'flex',
        'flex-col',
        'gap-4',
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
      emit('mark-all-read', currentGroupKey.value, currentGroupItems.value)
    }

    const handleItemClick = (item: NotificationItem, index: number) => {
      emit('item-click', item, index)
    }

    const handleItemReadChange = (item: NotificationItem, nextRead: boolean) => {
      emit('item-read-change', item, nextRead)
    }

    const renderReadFilterButtons = () => {
      const options: ReadFilterOption[] = [
        { key: 'all', label: props.allLabel },
        { key: 'unread', label: props.unreadLabel },
        { key: 'read', label: props.readLabel }
      ]

      return options.map((option) =>
        h(
          Button,
          {
            key: option.key,
            size: 'sm',
            variant: currentReadFilter.value === option.key ? 'primary' : 'outline',
            onClick: () => handleReadFilterChange(option.key)
          },
          { default: () => option.label }
        )
      )
    }

    const renderListItem = (item: NotificationItem, index: number) => {
      const isRead = Boolean(item.read)
      const timeText = item.time ? formatActivityTime(item.time) : ''

      return h('div', { class: 'flex items-start gap-3 w-full' }, [
        h('span', {
          class: classNames(
            'mt-2 h-2 w-2 rounded-full',
            isRead ? 'bg-gray-300' : 'bg-[var(--tiger-primary,#2563eb)]'
          ),
          'aria-hidden': 'true'
        }),
        h('div', { class: 'flex-1 space-y-1' }, [
          h(Text, { tag: 'div', size: 'sm', weight: 'medium' }, { default: () => item.title }),
          item.description
            ? h(
                Text,
                { tag: 'div', size: 'sm', color: 'muted' },
                { default: () => item.description }
              )
            : null,
          timeText
            ? h(Text, { tag: 'div', size: 'xs', color: 'muted' }, { default: () => timeText })
            : null
        ]),
        h(
          Button,
          {
            size: 'sm',
            variant: 'outline',
            onClick: (event: MouseEvent) => {
              event.stopPropagation()
              handleItemReadChange(item, !isRead)
            }
          },
          { default: () => (isRead ? props.markUnreadText : props.markReadText) }
        )
      ])
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
              const unreadCount = group.items.filter((item) => !item.read).length
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
                  default: () => renderList(filterItems(group.items))
                }
              )
            })
        }
      )

    return () => {
      const header = h('div', { class: 'flex items-center justify-between gap-3' }, [
        h(Text, { tag: 'div', size: 'sm', weight: 'medium' }, { default: () => props.title }),
        h('div', { class: 'flex items-center gap-2 flex-wrap' }, [
          h('div', { class: 'flex items-center gap-2' }, renderReadFilterButtons()),
          h(
            Button,
            {
              size: 'sm',
              variant: 'outline',
              disabled: !hasUnread.value,
              onClick: handleMarkAllRead
            },
            { default: () => props.markAllReadText }
          )
        ])
      ])

      const content = props.loading
        ? h('div', { class: 'flex items-center justify-center py-6' }, [
            h(Loading, { text: props.loadingText })
          ])
        : resolvedGroups.value.length > 0
          ? renderTabs()
          : renderList(filterItems(props.items))

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
