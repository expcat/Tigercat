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
import {
  activityFeedActionClasses,
  activityFeedItemSurfaceClasses,
  activityFeedAvatarClasses,
  activityFeedTitleClasses,
  activityFeedTimeClasses,
  activityFeedDescriptionClasses,
  activityFeedStateCardClasses,
  activityFeedLoadingClasses,
  activityFeedEmptyIconClasses,
  activityFeedGroupMarkerClasses,
  activityFeedGroupTitleClasses,
  activityFeedDotBaseClasses,
  activityFeedDotPulseBaseClasses,
  getActivityFeedDotClasses
} from '../../../core/src/internal/activity-feed-styles'
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
      className: activityFeedActionClasses,
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
          class: classNames(activityItemClasses, activityFeedItemSurfaceClasses)
        },
        [
          h('div', { class: activityItemLayoutClasses }, [
            props.showAvatar && item.user
              ? h(Avatar, {
                  size: 'sm',
                  src: item.user.avatar,
                  text: item.user.name,
                  className: activityFeedAvatarClasses
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
                          class: activityFeedTitleClasses
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
                            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase border border-current bg-current/10 shadow-sm'
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
                        class: activityFeedTimeClasses
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
                        activityFeedDescriptionClasses
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
              class: activityFeedLoadingClasses
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
                className: classNames('tiger-activity-feed-loading', activityFeedStateCardClasses)
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
                  class: activityFeedEmptyIconClasses,
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
                className: classNames('tiger-activity-feed-empty', activityFeedStateCardClasses)
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
                    class: activityFeedGroupMarkerClasses
                  }),
                  h(
                    Text,
                    {
                      tag: 'span',
                      size: 'sm',
                      weight: 'bold',
                      class: activityFeedGroupTitleClasses
                    },
                    { default: () => groupTitle }
                  )
                ]))
              : null,
            h(
              Timeline,
              {
                items: timelineItems,
                renderDot: (timelineItem: ActivityTimelineItem) => {
                  const activity = timelineItem.activity
                  const statusVariant = (activity?.status?.variant ?? 'default') as string
                  const dotClasses = getActivityFeedDotClasses(statusVariant)

                  return h('div', { class: 'relative flex items-center justify-center w-4 h-4' }, [
                    dotClasses.pulse
                      ? h('span', {
                          class: `${activityFeedDotPulseBaseClasses} ${dotClasses.pulse}`
                        })
                      : null,
                    h('span', { class: `${activityFeedDotBaseClasses} ${dotClasses.dot}` })
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
