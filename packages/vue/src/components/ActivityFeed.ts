import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  buildActivityGroups,
  coerceClassValue,
  formatActivityTime,
  mergeStyleValues,
  toActivityTimelineItems,
  activityItemClasses,
  activityItemLayoutClasses,
  activityItemBodyClasses,
  activityItemHeaderClasses,
  activityItemTitleGroupClasses,
  activityItemDescriptionClasses,
  activityItemActionsClasses,
  type ActivityFeedProps as CoreActivityFeedProps,
  type ActivityGroup,
  type ActivityItem,
  type ActivityAction,
  type ActivityTimelineItem
} from '@expcat/tigercat-core'
import { Timeline } from './Timeline'
import { Avatar } from './Avatar'
import { Tag } from './Tag'
import { Card } from './Card'
import { Text } from './Text'
import { Link } from './Link'
import { Loading } from './Loading'

type HChildren = Parameters<typeof h>[2]

export interface VueActivityFeedProps extends Omit<
  CoreActivityFeedProps,
  'renderItem' | 'renderGroupHeader'
> {
  className?: string
  style?: Record<string, string | number>
}

const renderAction = (item: ActivityItem, action: ActivityAction, index: number) => {
  const key = action.key ?? `${item.id}-action-${index}`
  return h(
    Link,
    {
      key,
      size: 'sm',
      variant: 'primary',
      underline: false,
      href: action.href,
      target: action.target,
      disabled: action.disabled,
      className:
        'inline-flex items-center px-2.5 py-1 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-xs font-semibold transition-all duration-200',
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
      buildActivityGroups(props.items, props.groups, props.groupBy, props.groupOrder)
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
      const timeText = props.showTime ? formatActivityTime(item.time) : ''
      const actionNodes = item.actions?.map((action, actionIndex) =>
        renderAction(item, action, actionIndex)
      )

      return h(
        'div',
        {
          class: classNames(
            activityItemClasses,
            'p-4 rounded-2xl border border-gray-100/70 dark:border-gray-800/40 bg-white/40 dark:bg-gray-900/15 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-gray-100/30 dark:hover:shadow-none hover:bg-white dark:hover:bg-gray-900/30 hover:-translate-y-0.5 w-full'
          )
        },
        [
          h('div', { class: activityItemLayoutClasses }, [
            props.showAvatar && item.user
              ? h(Avatar, {
                  size: 'sm',
                  src: item.user.avatar,
                  text: item.user.name,
                  className:
                    'shrink-0 ring-2 ring-white dark:ring-gray-900 shadow-sm transition-transform hover:scale-105 duration-200'
                })
              : null,
            h('div', { class: activityItemBodyClasses }, [
              h('div', { class: activityItemHeaderClasses }, [
                h('div', { class: activityItemTitleGroupClasses }, [
                  titleText
                    ? h(
                        Text,
                        {
                          tag: 'div',
                          size: 'sm',
                          weight: 'semibold',
                          class:
                            'text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer truncate'
                        },
                        { default: () => titleText }
                      )
                    : null,
                  item.status
                    ? h(
                        Tag,
                        {
                          variant: item.status.variant ?? 'default',
                          size: 'sm',
                          className:
                            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase border border-current bg-opacity-10 shadow-sm'
                        },
                        { default: () => item.status?.label }
                      )
                    : null
                ]),
                timeText
                  ? h(
                      Text,
                      {
                        tag: 'div',
                        size: 'xs',
                        color: 'muted',
                        class:
                          'shrink-0 whitespace-nowrap font-medium text-gray-400 dark:text-gray-500'
                      },
                      { default: () => timeText }
                    )
                  : null
              ]),
              descriptionText
                ? h(
                    Text,
                    {
                      tag: 'div',
                      size: 'sm',
                      color: 'muted',
                      class: classNames(
                        activityItemDescriptionClasses,
                        'text-gray-600 dark:text-gray-300 leading-relaxed pl-0.5 mt-1'
                      )
                    },
                    { default: () => descriptionText }
                  )
                : null,
              actionNodes?.length
                ? h(
                    'div',
                    { class: classNames(activityItemActionsClasses, 'mt-2.5') },
                    actionNodes as HChildren
                  )
                : null
            ])
          ])
        ]
      )
    }

    const feedRole = computed(() => (attrs.role as string | undefined) ?? 'feed')
    const feedAriaLabel = computed(
      () =>
        (attrs['aria-label'] as string | undefined) ??
        (attrs['aria-labelledby'] ? undefined : '动态')
    )
    const feedAriaBusy = computed(() => attrs['aria-busy'] ?? (props.loading ? 'true' : undefined))

    return () => {
      if (props.loading) {
        const loadingNode = slots.loading
          ? slots.loading()
          : h(Loading, {
              text: props.loadingText,
              class: 'text-blue-500 dark:text-blue-400 font-medium'
            })

        return h(
          'div',
          {
            ...attrs,
            class: wrapperClasses.value,
            style: wrapperStyle.value,
            role: feedRole.value,
            'aria-label': feedAriaLabel.value,
            'aria-busy': feedAriaBusy.value,
            'data-tiger-activity-feed': true
          },
          [
            h(
              Card,
              {
                variant: 'bordered',
                size: 'sm',
                className:
                  'tiger-activity-feed-loading bg-white/40 dark:bg-gray-900/20 border-gray-100 dark:border-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden'
              },
              {
                default: () =>
                  h('div', { class: 'flex items-center justify-center py-8' }, loadingNode)
              }
            )
          ]
        )
      }

      if (resolvedGroups.value.length === 0) {
        const emptyNode = slots.empty
          ? slots.empty()
          : h('div', { class: 'flex flex-col items-center justify-center py-12 px-4' }, [
              h(
                'svg',
                {
                  class: 'w-12 h-12 text-gray-300 dark:text-gray-600 mb-3 animate-pulse',
                  fill: 'none',
                  viewBox: '0 0 24 24',
                  stroke: 'currentColor',
                  strokeWidth: '1.5'
                },
                [
                  h('path', {
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    d: 'M12 7.5h1.5m-1.5 3h1.5m-7.5 3h10.5m-10.5 3h10.5m-13.5-9h16.5M3 5.25h18M3 18.75h18'
                  })
                ]
              ),
              h(
                Text,
                { tag: 'div', size: 'sm', color: 'muted', class: 'font-medium' },
                { default: () => props.emptyText }
              )
            ])

        return h(
          'div',
          {
            ...attrs,
            class: wrapperClasses.value,
            style: wrapperStyle.value,
            role: feedRole.value,
            'aria-label': feedAriaLabel.value,
            'data-tiger-activity-feed': true
          },
          [
            h(
              Card,
              {
                variant: 'bordered',
                size: 'sm',
                className:
                  'tiger-activity-feed-empty bg-white/40 dark:bg-gray-900/20 border-gray-100 dark:border-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden'
              },
              {
                default: () => emptyNode
              }
            )
          ]
        )
      }

      return h(
        'div',
        {
          ...attrs,
          class: wrapperClasses.value,
          style: wrapperStyle.value,
          role: feedRole.value,
          'aria-label': feedAriaLabel.value,
          'data-tiger-activity-feed': true
        },
        resolvedGroups.value.map((group, groupIndex) => {
          const headerNode = slots.groupTitle ? slots.groupTitle({ group }) : undefined
          const groupTitle = group.title
          const timelineItems = toActivityTimelineItems(group.items)

          return h('div', { key: group.key ?? groupIndex, class: 'space-y-3' }, [
            props.showGroupTitle && groupTitle
              ? (headerNode ??
                h('div', { class: 'flex items-center gap-2 mb-2' }, [
                  h('span', {
                    class:
                      'w-1.5 h-3.5 bg-blue-500 rounded-full dark:bg-blue-400 shadow-sm shadow-blue-500/20'
                  }),
                  h(
                    Text,
                    {
                      tag: 'span',
                      size: 'sm',
                      weight: 'bold',
                      class: 'text-gray-900 dark:text-gray-100 uppercase tracking-wider'
                    },
                    { default: () => groupTitle }
                  )
                ]))
              : null,
            h(
              Timeline,
              {
                items: timelineItems,
                style: {
                  '--tiger-border': 'rgba(156, 163, 175, 0.18)'
                },
                renderDot: (timelineItem: ActivityTimelineItem) => {
                  const activity = timelineItem.activity
                  const statusVariant = (activity?.status?.variant ?? 'default') as string

                  const baseDotClass =
                    'w-3 h-3 rounded-full border-2 border-white dark:border-gray-950 shadow-sm'
                  let colorClass = 'bg-gray-300 dark:bg-gray-700'
                  let pulseClass = ''

                  if (statusVariant === 'success') {
                    colorClass = 'bg-emerald-500'
                    pulseClass = 'bg-emerald-500/30'
                  } else if (statusVariant === 'warning') {
                    colorClass = 'bg-amber-500'
                    pulseClass = 'bg-amber-500/30'
                  } else if (statusVariant === 'error' || statusVariant === 'danger') {
                    colorClass = 'bg-rose-500'
                    pulseClass = 'bg-rose-500/30'
                  } else if (statusVariant === 'primary' || statusVariant === 'info') {
                    colorClass = 'bg-blue-500'
                    pulseClass = 'bg-blue-500/30'
                  }

                  return h('div', { class: 'relative flex items-center justify-center w-4 h-4' }, [
                    pulseClass
                      ? h('span', {
                          class: `absolute inline-flex h-full w-full rounded-full animate-ping opacity-75 ${pulseClass}`
                        })
                      : null,
                    h('span', { class: `${baseDotClass} ${colorClass} relative z-10` })
                  ])
                }
              },
              {
                item: ({ item, index }: { item: ActivityTimelineItem; index: number }) => {
                  const activity = item.activity
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
