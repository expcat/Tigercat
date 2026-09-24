import { defineComponent, computed, h, onBeforeUnmount, onMounted, PropType, ref, watch } from 'vue'
import {
  classNames,
  buildActivityGroups,
  coerceClassValue,
  COMPOSITE_LIST_ESTIMATED_ITEM_HEIGHT,
  COMPOSITE_LIST_VIEWPORT,
  compositeListUsesWindow,
  createInfiniteScrollFlight,
  createInfiniteScrollObserver,
  flattenCompositeGroupRows,
  formatActivityTime,
  infiniteScrollSentinelClasses,
  readDocumentTimeZone,
  mergeStyleValues,
  getActivityFeedLabels,
  mergeTigerLocale,
  resolveLocaleText,
  resolveActivityCopy,
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
  type ActivityTimelineItem,
  type TigerLocale,
  type TigerLocaleActivityFeed
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
import { VirtualList } from './VirtualList'
import { Avatar } from './Avatar'
import { Tag } from './Tag'
import { Card } from './Card'
import { Text } from './Text'
import { Link } from './Link'
import { Button } from './Button'
import { Loading } from './Loading'
import { useTigerConfig } from './ConfigProvider'

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
  const onClick = (event?: Event) => {
    if (action.href === '#' || action.onClick) event?.preventDefault()
    if (action.disabled) return
    action.onClick?.(item, action)
  }
  if (!action.href) {
    return h(
      Button,
      {
        key,
        size: 'sm',
        variant: 'ghost',
        disabled: action.disabled,
        class: activityFeedActionClasses,
        onClick
      },
      { default: () => action.label }
    )
  }
  return h(
    Link,
    {
      key,
      size: 'sm',
      variant: 'primary',
      underline: false,
      href: action.disabled ? undefined : action.href,
      target: action.target,
      disabled: action.disabled,
      class: activityFeedActionClasses,
      tabindex: action.disabled ? -1 : undefined,
      onClick
    },
    { default: () => action.label }
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
      default: undefined
    },
    emptyText: {
      type: String,
      default: undefined
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    labels: {
      type: Object as PropType<Partial<TigerLocaleActivityFeed>>,
      default: undefined
    },
    showAvatar: {
      type: Boolean,
      default: true
    },
    showTime: {
      type: Boolean,
      default: true
    },
    timeZone: { type: String, default: undefined },
    hasMore: { type: Boolean, default: false },
    loadError: { type: Boolean, default: false },
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
  emits: ['load-more'],
  setup(props, { slots, attrs, emit }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getActivityFeedLabels(mergedLocale.value, props.labels))

    const documentTimeZone = ref<string | null>(props.timeZone ?? null)
    const flight = createInfiniteScrollFlight()
    const sentinelRef = ref<HTMLElement | null>(null)
    const listRef = ref<{ getScrollElement: () => HTMLElement | null } | null>(null)
    let wasLoading = props.loading
    onMounted(() => {
      documentTimeZone.value = props.timeZone || readDocumentTimeZone()
    })
    watch(
      () => props.timeZone,
      (zone) => {
        documentTimeZone.value = zone || readDocumentTimeZone()
      }
    )
    watch(
      () => props.loading,
      (loading) => {
        flight.noteLoading(loading, wasLoading)
        wasLoading = loading
      }
    )
    watch(
      () => props.loadError,
      (error) => {
        if (error) flight.noteError()
      }
    )
    const announcement = ref('')
    const seenIds = ref<Set<string> | null>(null)

    const resolvedGroups = computed(() =>
      buildActivityGroups(
        props.items,
        props.groups,
        props.groupBy,
        props.groupOrder,
        labels.value.otherGroupTitle
      )
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

    const windowRows = computed(() =>
      flattenCompositeGroupRows(resolvedGroups.value, props.showGroupTitle)
    )
    let stopObserver: (() => void) | null = null
    function bindSentinel() {
      stopObserver?.()
      stopObserver = null
      const sentinel = sentinelRef.value
      if (!props.hasMore || !sentinel) return
      const windowed = compositeListUsesWindow(windowRows.value.length)
      const root = windowed ? (listRef.value?.getScrollElement() ?? null) : null
      const teardown = createInfiniteScrollObserver(sentinel, {
        root,
        onLoadMore: () => {
          flight.noteSentinel(true)
          if (
            !flight.canRequest({
              hasMore: props.hasMore,
              error: props.loadError,
              loading: props.loading
            })
          ) {
            return
          }
          const returned = emit('load-more') as unknown
          const tasks = Array.isArray(returned) ? returned : [returned]
          const pending = tasks.filter(
            (task) => task && typeof (task as { then?: unknown }).then === 'function'
          )
          flight.begin(pending.length > 0 ? Promise.all(pending) : undefined)
        },
        onLeave: () => flight.noteSentinel(false)
      })
      stopObserver = teardown
    }
    onMounted(bindSentinel)
    watch(() => [props.hasMore, props.loading, props.loadError, windowRows.value.length], bindSentinel, {
      flush: 'post'
    })
    onBeforeUnmount(() => stopObserver?.())

    watch(resolvedGroups, (groups) => {
      const flat = groups.flatMap((group) => group.items ?? [])
      const ids = flat.map((item) => String(item.id ?? ''))
      if (seenIds.value === null) {
        seenIds.value = new Set(ids)
        return
      }
      const fresh = flat.filter((item) => item.id != null && !seenIds.value!.has(String(item.id)))
      seenIds.value = new Set(ids)
      const newest = fresh[fresh.length - 1]
      if (!newest) return
      const copy = resolveActivityCopy(newest)
      const title = copy.title || copy.body || ''
      announcement.value = labels.value.newItemText.split('{title}').join(title)
    })

    const liveRegion = () =>
      h('div', { class: 'sr-only', 'aria-live': 'polite' }, announcement.value)

    const renderDefaultItem = (item: ActivityItem, index: number, group?: ActivityGroup) => {
      if (slots.item) {
        const slotContent = slots.item({ item, index, group })
        if (slotContent) return slotContent
      }

      const copy = resolveActivityCopy(item)
      const titleText = copy.title ?? ''
      const descriptionText = copy.body
      const timeText = props.showTime
        ? formatActivityTime(
            item.time,
            mergedLocale.value,
            documentTimeZone.value ? { timeZone: documentTimeZone.value } : undefined
          )
        : ''
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

    const feedRole = computed(() => (attrs.role as string | undefined) ?? 'region')
    const feedAriaLabel = computed(
      () =>
        (attrs['aria-label'] as string | undefined) ??
        (attrs['aria-labelledby'] ? undefined : labels.value.listAriaLabel)
    )
    const feedAriaBusy = computed(() => attrs['aria-busy'] ?? (props.loading ? 'true' : undefined))

    return () => {
      if (props.loading && resolvedGroups.value.length === 0) {
        const loadingNode = slots.loading
          ? slots.loading()
          : h(Loading, {
              text: resolveLocaleText(labels.value.loadingText, props.loadingText),
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
            liveRegion(),
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
                  'aria-hidden': 'true',
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
                { default: () => resolveLocaleText(labels.value.emptyText, props.emptyText) }
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
            'aria-busy': feedAriaBusy.value,
            'data-tiger-activity-feed': true
          },
          [
            liveRegion(),
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
          'aria-busy': feedAriaBusy.value,
          'data-tiger-activity-feed': true
        },
        [
          liveRegion(),
          props.loading
            ? h(
                'p',
                null,
                resolveLocaleText(labels.value.loadingText, props.loadingText)
              )
            : null,
          ...(compositeListUsesWindow(windowRows.value.length)
            ? [
                h(
                  VirtualList,
                  {
                    ref: listRef,
                    'data-tiger-activity-window': '',
                    itemCount: windowRows.value.length,
                    estimatedItemHeight: COMPOSITE_LIST_ESTIMATED_ITEM_HEIGHT,
                    height: COMPOSITE_LIST_VIEWPORT,
                    getItemKey: (index: number) => windowRows.value[index]?.key ?? index,
                    role: 'presentation'
                  },
                  {
                    default: ({ index }: { index: number }) => {
                      const row = windowRows.value[index]
                      const group = resolvedGroups.value[row?.groupIndex]
                      if (!row || !group) return null
                      if (row.kind === 'header') {
                        return h('div', { class: 'flex items-center gap-2 mb-2' }, [
                          h('span', { class: activityFeedGroupMarkerClasses }),
                          h(
                            Text,
                            {
                              tag: 'span',
                              size: 'sm',
                              weight: 'bold',
                              class: activityFeedGroupTitleClasses
                            },
                            { default: () => group.title }
                          )
                        ])
                      }
                      const item = group.items?.[row.itemIndex]
                      return item ? renderDefaultItem(item, row.itemIndex, group) : null
                    },
                    footer: () =>
                      props.hasMore
                        ? h('div', {
                            ref: sentinelRef,
                            class: infiniteScrollSentinelClasses,
                            'aria-hidden': 'true'
                          })
                        : null
                  }
                )
              ]
            : resolvedGroups.value.map((group, groupIndex) => {
          const headerNode = slots.groupHeader?.({ group }) ?? slots.groupTitle?.({ group })
          const groupTitle = group.title
          const timelineItems = toActivityTimelineItems(group.items)
          const renderDot = (timelineItem: ActivityTimelineItem) => {
            const activity = timelineItem.activity
            const statusVariant = (activity?.status?.variant ?? 'default') as string
            const dotClasses = getActivityFeedDotClasses(statusVariant)
            return h('div', { class: 'relative flex items-center justify-center w-2.5 h-2.5' }, [
              dotClasses.pulse
                ? h('span', {
                    class: `${activityFeedDotPulseBaseClasses} ${dotClasses.pulse}`
                  })
                : null,
              h('span', { class: `${activityFeedDotBaseClasses} ${dotClasses.dot}` })
            ])
          }

          return h('div', { key: group.key ?? groupIndex, class: 'space-y-3' }, [
            props.showGroupTitle
              ? (headerNode ??
                (groupTitle
                  ? h('div', { class: 'flex items-center gap-2 mb-2' }, [
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
                    ])
                  : null))
              : null,
            h(
              Timeline,
              { items: timelineItems },
              {
                dot: ({ item }: { item: ActivityTimelineItem }) => renderDot(item),
                item: ({ item, index }: { item: ActivityTimelineItem; index: number }) => {
                  const activity = item.activity
                  if (!activity) return null
                  return renderDefaultItem(activity, index, group)
                }
              }
            )
          ])
        }))
          ,
          !compositeListUsesWindow(windowRows.value.length) && props.hasMore
            ? h('div', {
                ref: sentinelRef,
                class: infiniteScrollSentinelClasses,
                'aria-hidden': 'true'
              })
            : null
        ] as HChildren
      )
    }
  }
})

export default ActivityFeed
