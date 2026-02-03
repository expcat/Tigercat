import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  type ActivityFeedProps as CoreActivityFeedProps,
  type ActivityGroup,
  type ActivityItem,
  type ActivityAction,
  type TimelineItem
} from '@expcat/tigercat-core'
import { Timeline } from './Timeline'
import { Avatar } from './Avatar'
import { Tag } from './Tag'
import { Card } from './Card'
import { Text } from './Text'
import { Link } from './Link'
import { Loading } from './Loading'

type HChildren = Parameters<typeof h>[2]

export interface VueActivityFeedProps
  extends Omit<CoreActivityFeedProps, 'renderItem' | 'renderGroupHeader'> {
  className?: string
  style?: Record<string, string | number>
}

const formatTime = (value?: string | number | Date): string => {
  if (!value) return ''
  if (value instanceof Date) return value.toLocaleString()
  if (typeof value === 'number') return new Date(value).toLocaleString()
  return value
}

const sortGroups = (groups: ActivityGroup[], groupOrder?: string[]) => {
  if (!groupOrder || groupOrder.length === 0) return groups
  const orderMap = new Map(groupOrder.map((key, index) => [key, index]))
  return [...groups].sort((a, b) => {
    const aKey = String(a.key ?? a.title ?? '')
    const bKey = String(b.key ?? b.title ?? '')
    const aIndex = orderMap.has(aKey) ? (orderMap.get(aKey) as number) : Number.POSITIVE_INFINITY
    const bIndex = orderMap.has(bKey) ? (orderMap.get(bKey) as number) : Number.POSITIVE_INFINITY
    if (aIndex === bIndex) return 0
    return aIndex - bIndex
  })
}

const buildGroups = (
  items?: ActivityItem[],
  groups?: ActivityGroup[],
  groupBy?: (item: ActivityItem) => string,
  groupOrder?: string[]
): ActivityGroup[] => {
  if (groups && groups.length > 0) {
    return sortGroups(groups, groupOrder)
  }

  if (!items || items.length === 0) return []

  if (groupBy) {
    const groupMap = new Map<string, ActivityItem[]>()
    items.forEach((item) => {
      const key = groupBy(item) || '其他'
      const bucket = groupMap.get(key) ?? []
      bucket.push(item)
      groupMap.set(key, bucket)
    })

    const mappedGroups = Array.from(groupMap.entries()).map(([title, groupItems]) => ({
      key: title,
      title,
      items: groupItems
    }))

    return sortGroups(mappedGroups, groupOrder)
  }

  return [{ key: 'default', title: '', items }]
}

const getTimelineItems = (items: ActivityItem[], showTime: boolean): TimelineItem[] => {
  return items.map((item, index) => ({
    key: item.id ?? index,
    label: showTime ? formatTime(item.time) : undefined,
    content: undefined,
    activity: item
  }))
}

const renderAction = (item: ActivityItem, action: ActivityAction, index: number) => {
  const key = action.key ?? `${item.id}-action-${index}`
  return h(
    Link,
    {
      key,
      size: 'sm',
      variant: 'primary',
      href: action.href,
      target: action.target,
      disabled: action.disabled,
      onClick: () => action.onClick?.(item, action)
    },
    {
      default: () => action.label
    }
  )
}

export const ActivityFeed = defineComponent({
  name: 'TigerActivityFeed',
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<ActivityItem[]>,
      default: () => []
    },
    groups: {
      type: Array as PropType<ActivityGroup[]>,
      default: undefined
    },
    groupBy: {
      type: Function as PropType<(item: ActivityItem) => string>,
      default: undefined
    },
    groupOrder: {
      type: Array as PropType<string[]>,
      default: undefined
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
      default: '暂无动态'
    },
    showAvatar: {
      type: Boolean,
      default: true
    },
    showTime: {
      type: Boolean,
      default: true
    },
    showGroupTitle: {
      type: Boolean,
      default: true
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
  setup(props, { slots, attrs }) {
    const resolvedGroups = computed(() =>
      buildGroups(props.items, props.groups, props.groupBy, props.groupOrder)
    )

    const wrapperClasses = computed(() =>
      classNames(
        'tiger-activity-feed',
        'flex',
        'flex-col',
        'gap-6',
        'w-full',
        props.className,
        coerceClassValue(attrs.class)
      )
    )

    const wrapperStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    const renderDefaultItem = (item: ActivityItem, index: number, group?: ActivityGroup) => {
      if (slots.item) {
        const slotContent = slots.item({ item, index, group })
        if (slotContent) return slotContent
      }

      const titleText =
        item.title ??
        (typeof item.content === 'string' || typeof item.content === 'number'
          ? String(item.content)
          : '')
      const descriptionText = item.description
      const timeText = props.showTime ? formatTime(item.time) : ''
      const actionNodes = item.actions?.map((action, actionIndex) =>
        renderAction(item, action, actionIndex)
      )

      return h(
        Card,
        {
          variant: 'bordered',
          size: 'sm',
          className: 'tiger-activity-item'
        },
        {
          default: () => [
            h('div', { class: 'flex gap-3' }, [
              props.showAvatar && item.user
                ? h(Avatar, {
                    size: 'sm',
                    src: item.user.avatar,
                    text: item.user.name,
                    className: 'shrink-0'
                  })
                : null,
              h('div', { class: 'flex-1 space-y-2' }, [
                h('div', { class: 'flex items-center gap-2 flex-wrap' }, [
                  titleText
                    ? h(
                        Text,
                        { tag: 'div', size: 'sm', weight: 'medium' },
                        { default: () => titleText }
                      )
                    : null,
                  item.status
                    ? h(
                        Tag,
                        { variant: item.status.variant ?? 'default', size: 'sm' },
                        { default: () => item.status?.label }
                      )
                    : null
                ]),
                descriptionText
                  ? h(
                      Text,
                      { tag: 'div', size: 'sm', color: 'muted' },
                      { default: () => descriptionText }
                    )
                  : null,
                timeText
                  ? h(
                      Text,
                      { tag: 'div', size: 'xs', color: 'muted' },
                      { default: () => timeText }
                    )
                  : null,
                actionNodes && actionNodes.length > 0
                  ? h('div', { class: 'flex flex-wrap gap-3' }, actionNodes as HChildren)
                  : null
              ])
            ])
          ]
        }
      )
    }

    return () => {
      if (props.loading) {
        const loadingNode = slots.loading
          ? slots.loading()
          : h(Loading, { text: props.loadingText })

        return h(
          'div',
          {
            class: wrapperClasses.value,
            style: wrapperStyle.value,
            'data-tiger-activity-feed': true,
            ...attrs
          },
          [
            h(
              Card,
              { variant: 'bordered', size: 'sm', className: 'tiger-activity-feed-loading' },
              {
                default: () => h('div', { class: 'flex items-center justify-center py-4' }, loadingNode)
              }
            )
          ]
        )
      }

      if (resolvedGroups.value.length === 0) {
        const emptyNode = slots.empty
          ? slots.empty()
          : h(
              Text,
              { tag: 'div', size: 'sm', color: 'muted' },
              { default: () => props.emptyText }
            )

        return h(
          'div',
          {
            class: wrapperClasses.value,
            style: wrapperStyle.value,
            'data-tiger-activity-feed': true,
            ...attrs
          },
          [
            h(
              Card,
              { variant: 'bordered', size: 'sm', className: 'tiger-activity-feed-empty' },
              {
                default: () => h('div', { class: 'flex items-center justify-center py-6' }, emptyNode)
              }
            )
          ]
        )
      }

      return h(
        'div',
        {
          class: wrapperClasses.value,
          style: wrapperStyle.value,
          'data-tiger-activity-feed': true,
          ...attrs
        },
        resolvedGroups.value.map((group, groupIndex) => {
          const headerNode = slots.groupTitle ? slots.groupTitle({ group }) : undefined
          const groupTitle = group.title
          const timelineItems = getTimelineItems(group.items, props.showTime)

          return h('div', { key: group.key ?? groupIndex, class: 'space-y-3' }, [
            props.showGroupTitle && groupTitle
              ? headerNode ??
                h(
                  Text,
                  { tag: 'div', size: 'sm', weight: 'medium', color: 'muted' },
                  { default: () => groupTitle }
                )
              : null,
            h(
              Timeline,
              { items: timelineItems },
              {
                item: ({ item, index }: { item: TimelineItem; index: number }) => {
                  const activity = (item as TimelineItem & { activity?: ActivityItem }).activity
                  if (!activity) return null
                  return renderDefaultItem(activity, index, group)
                }
              }
            )
          ])
        }) as HChildren
      )
    }
  }
})

export default ActivityFeed
