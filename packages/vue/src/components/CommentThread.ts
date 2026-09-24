import {
  defineComponent,
  computed,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  getCurrentInstance,
  PropType
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  canSubmitCommentReply,
  commentIdKey,
  formatCommentTreeError,
  commentNodeAcceptsReply,
  clipCommentTreeDepth,
  formatBadgeCountLabel,
  COMPOSITE_LIST_ESTIMATED_ITEM_HEIGHT,
  COMPOSITE_LIST_VIEWPORT,
  compositeListUsesWindow,
  createInfiniteScrollFlight,
  createInfiniteScrollObserver,
  formatCommentTime,
  infiniteScrollSentinelClasses,
  readDocumentTimeZone,
  getCommentRepliesView,
  getTextClasses,
  nextCommentRevealedCount,
  resolveCommentNodes,
  getCommentThreadLabels,
  mergeTigerLocale,
  nextCommentLikeState,
  resolveCommentLikeState,
  resolveLocaleText,
  writeCommentLikeOverlay,
  type CommentAction,
  type CommentLikeOverlay,
  type CommentNode,
  type CommentThreadProps as CoreCommentThreadProps,
  type TigerLocale,
  type TigerLocaleCommentThread
} from '@expcat/tigercat-core'
import {
  commentThreadActionButtonClasses,
  commentThreadPrimaryButtonClasses,
  commentThreadLikeButtonClasses,
  commentThreadLikedButtonClasses,
  commentThreadReplyButtonClasses,
  commentThreadNeutralButtonClasses,
  commentThreadLikeIconClasses,
  commentThreadDividerClasses,
  commentThreadAvatarClasses,
  commentThreadAuthorClasses,
  commentThreadUserTitleClasses,
  commentThreadTimeClasses,
  commentThreadContentClasses,
  commentThreadReplyEditorClasses,
  commentThreadReplyTextareaClasses,
  commentThreadCancelButtonClasses,
  commentThreadSubmitButtonClasses,
  commentThreadRepliesClasses,
  commentThreadEmptyClasses,
  commentThreadEmptyIconClasses
} from '../../../core/src/internal/comment-thread-styles'
import { Avatar } from './Avatar'
import { Tag } from './Tag'
import { Button } from './Button'
import { Textarea } from './Textarea'
import { Text } from './Text'
import { useTigerConfig } from './ConfigProvider'
import { VirtualList } from './VirtualList'

/**
 * Vue CommentThread props. The React-only `onExpandedChange` callback is
 * omitted — Vue emits `update:expandedKeys` (`v-model:expanded-keys`) instead.
 */
export interface VueCommentThreadProps extends Omit<CoreCommentThreadProps, 'onExpandedChange'> {
  className?: string
  style?: Record<string, string | number>
}

export const CommentThread = defineComponent({
  name: 'TigerCommentThread',
  inheritAttrs: false,
  props: {
    nodes: {
      type: Array as PropType<CommentNode[]>,
      default: undefined
    },
    items: {
      type: Array as PropType<CommentNode[]>,
      default: undefined
    },
    maxDepth: {
      type: Number,
      default: 3
    },
    maxReplies: {
      type: Number,
      default: 3
    },
    defaultExpandedKeys: {
      type: Array as PropType<Array<string | number>>,
      default: () => []
    },
    expandedKeys: {
      type: Array as PropType<Array<string | number>>,
      default: undefined
    },
    emptyText: {
      type: String,
      default: undefined
    },
    replyPlaceholder: {
      type: String,
      default: undefined
    },
    replyButtonText: {
      type: String,
      default: undefined
    },
    cancelReplyText: {
      type: String,
      default: undefined
    },
    likeText: {
      type: String,
      default: undefined
    },
    likedText: {
      type: String,
      default: undefined
    },
    replyText: {
      type: String,
      default: undefined
    },
    moreText: {
      type: String,
      default: undefined
    },
    loadMoreText: {
      type: String,
      default: undefined
    },
    timeZone: { type: String, default: undefined },
    hasMore: { type: Boolean, default: false },
    loadError: { type: Boolean, default: false },
    collapseRepliesText: {
      type: String,
      default: undefined
    },
    expandRepliesText: {
      type: String,
      default: undefined
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    labels: {
      type: Object as PropType<Partial<TigerLocaleCommentThread>>,
      default: undefined
    },
    showAvatar: {
      type: Boolean,
      default: true
    },
    showDivider: {
      type: Boolean,
      default: true
    },
    showLike: {
      type: Boolean,
      default: true
    },
    showReply: {
      type: Boolean,
      default: true
    },
    showMore: {
      type: Boolean,
      default: false
    },
    showComposer: {
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
  emits: ['like', 'reply', 'more', 'action', 'update:expandedKeys', 'load-more', 'load-root', 'user-click'],
  setup(props, { emit, attrs }) {
    const instance = getCurrentInstance()
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getCommentThreadLabels(mergedLocale.value, props.labels))
    const vnodeProps = () => (instance?.vnode.props ?? {}) as Record<string, unknown>

    const innerExpandedKeys = ref<Array<string | number>>([...props.defaultExpandedKeys])
    const revealedCounts = ref(new Map<string | number, number>())
    const likeOverlay = ref<CommentLikeOverlay>(new Map())
    const replyingTo = ref<string | number | null>(null)
    const replyValue = ref('')
    const composerValue = ref('')
    const replyInFlight = ref(false)
    const clippedIds = ref(new Set<string | number>())
    const documentTimeZone = ref<string | null>(props.timeZone ?? null)
    const flight = createInfiniteScrollFlight()
    const sentinelRef = ref<HTMLElement | null>(null)
    const listRef = ref<{ getScrollElement: () => HTMLElement | null } | null>(null)
    const flatCount = ref(0)
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
      () => props.loadError,
      (error) => {
        if (error) flight.noteError()
      }
    )
    let stopObserver: (() => void) | null = null
    function bindSentinel() {
      stopObserver?.()
      stopObserver = null
      const sentinel = sentinelRef.value
      if (!props.hasMore || !sentinel) return
      const windowed = compositeListUsesWindow(flatCount.value)
      const teardown = createInfiniteScrollObserver(sentinel, {
        root: windowed ? (listRef.value?.getScrollElement() ?? null) : null,
        onLoadMore: () => {
          flight.noteSentinel(true)
          if (!flight.canRequest({ hasMore: props.hasMore, error: props.loadError })) return
          const returned = emit('load-root') as unknown
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
    watch(() => [props.hasMore, props.loadError, flatCount.value], bindSentinel, { flush: 'post' })
    onBeforeUnmount(() => stopObserver?.())

    const mergedExpandedKeys = computed(() => props.expandedKeys ?? innerExpandedKeys.value)

    const expandedSet = computed(() => new Set<string | number>(mergedExpandedKeys.value))

    const treeBuild = computed(() => resolveCommentNodes(props.nodes, props.items))
    const resolvedNodes = computed(() => {
      const clipped = new Set<string | number>()
      const next = clipCommentTreeDepth(treeBuild.value.roots, props.maxDepth, clipped)
      clippedIds.value = clipped
      return next
    })
    const treeErrors = computed(() => treeBuild.value.errors)
    let positionMap = new Map<string, { pos: number; depth: number }>()

    watch(
      () => [props.nodes, props.items],
      () => {
        likeOverlay.value = new Map()
        revealedCounts.value = new Map()
      }
    )

    const hasLoadMoreHandler = computed(() => typeof vnodeProps().onLoadMore === 'function')
    const hasReplyHandler = () => typeof vnodeProps().onReply === 'function'
    const hasMoreHandler = computed(() => typeof vnodeProps().onMore === 'function')
    const hasUserClickHandler = computed(() => typeof vnodeProps().onUserClick === 'function')

    const wrapperClasses = computed(() =>
      classNames(
        'tiger-comment-thread flex flex-col',
        props.className,
        coerceClassValue(attrs.class)
      )
    )

    const wrapperStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    const updateExpandedKeys = (next: Array<string | number>) => {
      if (!props.expandedKeys) {
        innerExpandedKeys.value = next
      }
      emit('update:expandedKeys', next)
    }

    const toggleExpanded = (id: string | number) => {
      const current = mergedExpandedKeys.value
      const next = expandedSet.value.has(id)
        ? current.filter((key) => key !== id)
        : [...current, id]
      updateExpandedKeys(next)
    }

    const handleLoadMore = (node: CommentNode) => {
      const children = node.children ?? []
      const current = revealedCounts.value.get(node.id) ?? props.maxReplies
      const view = getCommentRepliesView(children, {
        maxReplies: props.maxReplies,
        revealedCount: current,
        hasLoadMoreHandler: hasLoadMoreHandler.value
      })
      if (view.loadMoreKind === 'remaining') {
        const next = new Map(revealedCounts.value)
        next.set(node.id, nextCommentRevealedCount(current, props.maxReplies, children.length))
        revealedCounts.value = next
        return
      }
      emit('load-more', node)
    }

    const handleLike = (node: CommentNode) => {
      const next = nextCommentLikeState(node, likeOverlay.value)
      likeOverlay.value = writeCommentLikeOverlay(likeOverlay.value, node.id, next)
      emit('like', node, next.liked)
    }

    const handleReplySubmit = async (node?: CommentNode) => {
      const source = node ? replyValue.value : composerValue.value
      if (
        !canSubmitCommentReply({
          value: source,
          inFlight: replyInFlight.value,
          hasReplyHandler: hasReplyHandler()
        })
      ) {
        return
      }
      const text = source.trim()
      replyInFlight.value = true
      try {
        const returned = emit('reply', node, text) as unknown
        const tasks = Array.isArray(returned) ? returned : [returned]
        await Promise.all(tasks.map((task) => Promise.resolve(task)))
        if (node) {
          replyValue.value = ''
          replyingTo.value = null
          if (!expandedSet.value.has(node.id)) {
            updateExpandedKeys([...mergedExpandedKeys.value, node.id])
          }
        } else {
          composerValue.value = ''
        }
      } catch {
        // Keep the draft so the same reply can be sent again.
      } finally {
        replyInFlight.value = false
      }
    }

    const renderNode = (
      node: CommentNode,
      depth: number,
      isLast: boolean,
      pos: { current: number; total: number }
    ): ReturnType<typeof h> => {
      const children = node.children ?? []
      const hasChildren = children.length > 0 || clippedIds.value.has(node.id)
      const isExpanded = expandedSet.value.has(node.id)
      const repliesView = getCommentRepliesView(children, {
        maxReplies: props.maxReplies,
        revealedCount: revealedCounts.value.get(node.id) ?? props.maxReplies,
        hasLoadMoreHandler: hasLoadMoreHandler.value
      })
      const showReplies = hasChildren && isExpanded && children.length > 0
      const articleId = `tiger-comment-${instance?.uid ?? 0}-article-${commentIdKey(node.id)}`
      const visibleChildren = showReplies ? repliesView.visible : []
      const firstReply = visibleChildren[0]
      const controlsId = firstReply
        ? `tiger-comment-${instance?.uid ?? 0}-article-${commentIdKey(firstReply.id)}`
        : undefined
      const showLoadMore = showReplies && repliesView.loadMoreKind != null
      const placed = positionMap.get(commentIdKey(node.id))
      const posinset = placed?.pos ?? 1

      const actions: Array<ReturnType<typeof h>> = []

      if (props.showLike) {
        const { liked, likes } = resolveCommentLikeState(node, likeOverlay.value)
        const likeLabel = liked
          ? resolveLocaleText(labels.value.likedText, props.likedText)
          : resolveLocaleText(labels.value.likeText, props.likeText)
        const likeCount = likes ? ` ${likes}` : ''
        actions.push(
          h(
            Button,
            {
              key: 'like',
              size: 'sm',
              variant: 'ghost',
              'aria-pressed': liked,
              className: classNames(
                commentThreadActionButtonClasses,
                commentThreadLikeButtonClasses,
                liked && commentThreadLikedButtonClasses
              ),
              onClick: () => handleLike(node)
            },
            {
              default: () =>
                h('span', { class: 'flex items-center gap-1.5' }, [
                  h(
                    'svg',
                    {
                      class: classNames(
                        commentThreadLikeIconClasses,
                        liked ? 'fill-current' : 'stroke-current fill-none'
                      ),
                      viewBox: '0 0 24 24',
                      strokeWidth: '2'
                    },
                    [
                      h('path', {
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        d: 'M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.421.068.848.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 010-7.764c.26-.85.1083-1.368 1.972-1.368h.908c.445 0 .72.498.523.898a8.963 8.963 0 00-.27.602'
                      })
                    ]
                  ),
                  h('span', `${likeLabel}${likeCount}`)
                ])
            }
          )
        )
      }

      if (props.showReply && commentNodeAcceptsReply(depth, props.maxDepth)) {
        actions.push(
          h(
            Button,
            {
              key: 'reply',
              size: 'sm',
              variant: 'ghost',
              className: classNames(
                commentThreadActionButtonClasses,
                commentThreadReplyButtonClasses
              ),
              onClick: () => {
                replyingTo.value = replyingTo.value === node.id ? null : node.id
                replyValue.value = ''
              }
            },
            {
              default: () =>
                h('span', { class: 'flex items-center gap-1.5' }, [
                  h(
                    'svg',
                    {
                      class: 'w-3.5 h-3.5',
                      viewBox: '0 0 24 24',
                      fill: 'none',
                      stroke: 'currentColor',
                      strokeWidth: '2'
                    },
                    [
                      h('path', {
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        d: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                      })
                    ]
                  ),
                  h('span', resolveLocaleText(labels.value.replyText, props.replyText))
                ])
            }
          )
        )
      }

      if (props.showMore && (hasMoreHandler.value || (node.actions && node.actions.length > 0))) {
        actions.push(
          h(
            Button,
            {
              key: 'more',
              size: 'sm',
              variant: 'ghost',
              className: classNames(
                commentThreadActionButtonClasses,
                commentThreadNeutralButtonClasses
              ),
              onClick: () => emit('more', node)
            },
            {
              default: () =>
                h('span', { class: 'flex items-center gap-1.5' }, [
                  h(
                    'svg',
                    {
                      class: 'w-3.5 h-3.5',
                      viewBox: '0 0 24 24',
                      fill: 'none',
                      stroke: 'currentColor',
                      strokeWidth: '2'
                    },
                    [
                      h('path', {
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        d: 'M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z'
                      })
                    ]
                  ),
                  h('span', resolveLocaleText(labels.value.moreText, props.moreText))
                ])
            }
          )
        )
      }

      if (node.actions && node.actions.length > 0) {
        node.actions.forEach((action, index) => {
          const actionKey = action.key ?? `${node.id}-action-${index}`
          actions.push(
            h(
              Button,
              {
                key: actionKey,
                size: 'sm',
                variant: action.variant ?? 'ghost',
                className: classNames(
                  commentThreadActionButtonClasses,
                  commentThreadNeutralButtonClasses
                ),
                disabled: action.disabled,
                onClick: () => {
                  if (action.onClick) action.onClick(node, action)
                  else emit('action', node, action as CommentAction)
                }
              },
              { default: () => action.label }
            )
          )
        })
      }

      return h(
        'article',
        {
          class: classNames(
            'tiger-comment-thread-item',
            depth === 1 && 'py-5',
            depth === 1 && !isLast && props.showDivider && commentThreadDividerClasses
          ),
          key: node.id,
          id: articleId,
          'aria-posinset': posinset,
          'aria-setsize': pos.total
        },
        [
          h('div', { class: 'flex gap-3' }, [
            props.showAvatar && node.user
              ? h(Avatar, {
                  size: depth === 1 ? 'md' : 'sm',
                  src: node.user.avatar,
                  text: node.user.name,
                  className: commentThreadAvatarClasses,
                  'aria-hidden': Boolean(node.user.name)
                })
              : null,
            h('div', { class: 'flex-1 min-w-0' }, [
              h('div', { class: 'flex items-center gap-2 flex-wrap' }, [
                node.user?.name
                  ? hasUserClickHandler.value
                    ? h(
                        'button',
                        {
                          type: 'button',
                          class: classNames(
                            getTextClasses({ size: 'sm', weight: 'bold' }),
                            commentThreadAuthorClasses
                          ),
                          onClick: () => emit('user-click', node)
                        },
                        node.user.name
                      )
                    : h(
                        Text,
                        {
                          tag: 'span',
                          size: 'sm',
                          weight: 'bold',
                          class: commentThreadAuthorClasses.replace('cursor-pointer', '')
                        },
                        { default: () => node.user?.name }
                      )
                  : null,
                node.user?.title
                  ? h(
                      Text,
                      {
                        tag: 'span',
                        size: 'xs',
                        color: 'muted',
                        class: commentThreadUserTitleClasses
                      },
                      { default: () => node.user?.title }
                    )
                  : null,
                node.tag
                  ? h(
                      Tag,
                      {
                        size: 'sm',
                        variant: node.tag.variant ?? 'default',
                        className:
                          'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase border border-current bg-current/10'
                      },
                      { default: () => node.tag?.label }
                    )
                  : null,
                ...(node.tags ?? []).map((tag, index) =>
                  h(
                    Tag,
                    {
                      key: `${node.id}-tag-${index}`,
                      size: 'sm',
                      variant: tag.variant ?? 'default',
                      className:
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase border border-current bg-current/10'
                    },
                    { default: () => tag.label }
                  )
                ),
                formatCommentTime(
                  node.time,
                  mergedLocale.value,
                  documentTimeZone.value ? { timeZone: documentTimeZone.value } : undefined
                )
                  ? h(
                      Text,
                      {
                        tag: 'span',
                        size: 'xs',
                        color: 'muted',
                        class: commentThreadTimeClasses
                      },
                      {
                        default: () =>
                          formatCommentTime(
                            node.time,
                            mergedLocale.value,
                            documentTimeZone.value ? { timeZone: documentTimeZone.value } : undefined
                          )
                      }
                    )
                  : null
              ]),
              h(
                'div',
                {
                  class: commentThreadContentClasses
                },
                String(node.content)
              ),
              actions.length > 0
                ? h('div', { class: 'flex flex-wrap items-center gap-1.5' }, actions)
                : null,
              replyingTo.value === node.id
                ? h(
                    'div',
                    {
                      class: commentThreadReplyEditorClasses
                    },
                    [
                      h(Textarea, {
                        rows: 3,
                        modelValue: replyValue.value,
                        placeholder: resolveLocaleText(
                          labels.value.replyPlaceholder,
                          props.replyPlaceholder
                        ),
                        className: commentThreadReplyTextareaClasses,
                        'aria-label': labels.value.replyPlaceholder,
                        'onUpdate:modelValue': (value: string) => {
                          replyValue.value = value
                        }
                      }),
                      h('div', { class: 'flex items-center gap-2 justify-end' }, [
                        h(
                          Button,
                          {
                            size: 'sm',
                            variant: 'ghost',
                            className: commentThreadCancelButtonClasses,
                            onClick: () => {
                              replyingTo.value = null
                              replyValue.value = ''
                            }
                          },
                          {
                            default: () =>
                              resolveLocaleText(labels.value.cancelReplyText, props.cancelReplyText)
                          }
                        ),
                        h(
                          Button,
                          {
                            size: 'sm',
                            variant: 'primary',
                            className: commentThreadSubmitButtonClasses,
                            disabled: !canSubmitCommentReply({
                              value: replyValue.value,
                              inFlight: replyInFlight.value,
                              hasReplyHandler: hasReplyHandler()
                            }),

                            onClick: () => handleReplySubmit(node)
                          },
                          {
                            default: () =>
                              resolveLocaleText(labels.value.replySubmitText, props.replyButtonText)
                          }
                        )
                      ])
                    ]
                  )
                : null,
              hasChildren
                ? h(
                    Button,
                    {
                      size: 'sm',
                      variant: 'ghost',
                      className: classNames(
                        'mt-2 font-semibold',
                        commentThreadPrimaryButtonClasses
                      ),
                      'aria-expanded': isExpanded,
                      'aria-controls': controlsId,
                      disabled: clippedIds.value.has(node.id) && children.length === 0,
                      onClick: () => {
                        if (clippedIds.value.has(node.id) && children.length === 0) return
                        toggleExpanded(node.id)
                      }
                    },
                    {
                      default: () =>
                        clippedIds.value.has(node.id) && children.length === 0
                          ? labels.value.maxDepthReachedText
                          : isExpanded
                            ? resolveLocaleText(
                                labels.value.collapseRepliesText,
                                props.collapseRepliesText
                              )
                            : formatBadgeCountLabel(
                                resolveLocaleText(
                                  labels.value.expandRepliesText,
                                  props.expandRepliesText
                                ),
                                children.length,
                                mergedLocale.value?.locale
                              )
                    }
                  )
                : null,
              showLoadMore
                ? h(
                    Button,
                    {
                      size: 'sm',
                      variant: 'ghost',
                      className: commentThreadPrimaryButtonClasses,
                      onClick: () => handleLoadMore(node)
                    },
                    {
                      default: () =>
                        repliesView.loadMoreKind === 'remaining'
                          ? formatBadgeCountLabel(
                              labels.value.remainingRepliesText,
                              repliesView.remaining,
                              mergedLocale.value?.locale
                            )
                          : resolveLocaleText(labels.value.loadMoreText, props.loadMoreText)
                    }
                  )
                : null
            ])
          ])
        ]
      )
    }

    const indexTree = (
      list: CommentNode[],
      depth: number,
      into: Map<string, { pos: number; depth: number }>
    ) => {
      for (const node of list) {
        into.set(commentIdKey(node.id), { pos: into.size + 1, depth })
        indexTree(node.children ?? [], depth + 1, into)
      }
    }

    const flattenVisible = (
      list: CommentNode[],
      depth: number,
      into: Array<{ node: CommentNode; depth: number }>
    ) => {
      for (const node of list) {
        into.push({ node, depth })
        if (!expandedSet.value.has(node.id)) continue
        const view = getCommentRepliesView(node.children, {
          maxReplies: props.maxReplies,
          revealedCount: revealedCounts.value.get(node.id) ?? props.maxReplies,
          hasLoadMoreHandler: hasLoadMoreHandler.value
        })
        flattenVisible(view.visible, depth + 1, into)
      }
    }

    return () => {
      const ariaLabel =
        (attrs['aria-label'] as string | undefined) ??
        (attrs['aria-labelledby'] ? undefined : labels.value.listAriaLabel)
      positionMap = new Map<string, { pos: number; depth: number }>()
      indexTree(resolvedNodes.value, 1, positionMap)
      const flat: Array<{ node: CommentNode; depth: number }> = []
      flattenVisible(resolvedNodes.value, 1, flat)
      const pos = { current: 0, total: positionMap.size }

      const composer = props.showComposer
        ? h('div', { class: commentThreadReplyEditorClasses }, [
            h(Textarea, {
              rows: 3,
              modelValue: composerValue.value,
              placeholder: resolveLocaleText(labels.value.replyPlaceholder, props.replyPlaceholder),
              className: commentThreadReplyTextareaClasses,
              'aria-label': resolveLocaleText(
                labels.value.replyPlaceholder,
                props.replyPlaceholder
              ),
              'onUpdate:modelValue': (value: string) => {
                composerValue.value = value
              }
            }),
            h('div', { class: 'flex items-center gap-2 justify-end' }, [
              h(
                Button,
                {
                  size: 'sm',
                  variant: 'primary',
                  className: commentThreadSubmitButtonClasses,
                  disabled: !canSubmitCommentReply({
                    value: composerValue.value,
                    inFlight: replyInFlight.value,
                    hasReplyHandler: hasReplyHandler()
                  }),
                  onClick: () => handleReplySubmit()
                },
                {
                  default: () =>
                    resolveLocaleText(labels.value.replySubmitText, props.replyButtonText)
                }
              )
            ])
          ])
        : null

      flatCount.value = flat.length
      const articles = flat.map(({ node, depth }, index) =>
        renderNode(node, depth, index === flat.length - 1, pos)
      )
      const pageSentinel = props.hasMore
        ? h('div', {
            ref: sentinelRef,
            class: infiniteScrollSentinelClasses,
            'aria-hidden': 'true'
          })
        : null
      const empty =
        flat.length === 0
          ? h('div', { class: commentThreadEmptyClasses }, [
              h(
                'svg',
                {
                  'aria-hidden': 'true',
                  class: commentThreadEmptyIconClasses,
                  fill: 'none',
                  viewBox: '0 0 24 24',
                  stroke: 'currentColor',
                  strokeWidth: '1.5'
                },
                [
                  h('path', {
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    d: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                  })
                ]
              ),
              h(
                Text,
                { tag: 'div', size: 'sm', color: 'muted', class: 'font-medium' },
                {
                  default: () => resolveLocaleText(labels.value.emptyText, props.emptyText)
                }
              )
            ])
          : null
      const errors =
        treeErrors.value.length > 0
          ? h(
              'div',
              { role: 'alert' },
              treeErrors.value.map((error) =>
                h(
                  'p',
                  { key: `${error.code}-${error.id}` },
                  formatCommentTreeError(error, labels.value)
                )
              )
            )
          : null

      return h(
        'div',
        {
          ...attrs,
          class: wrapperClasses.value,
          style: wrapperStyle.value,
          role: 'region',
          'data-tiger-comment-thread': true,
          'aria-label': ariaLabel
        },
        [
          errors,
          composer,
          empty,
          articles.length > 0
            ? compositeListUsesWindow(flat.length)
              ? h(
                  VirtualList,
                  {
                    ref: listRef,
                    'data-tiger-comment-window': '',
                    itemCount: flat.length,
                    estimatedItemHeight: COMPOSITE_LIST_ESTIMATED_ITEM_HEIGHT,
                    height: COMPOSITE_LIST_VIEWPORT,
                    getItemKey: (index: number) => String(flat[index]?.node.id ?? index),
                    role: 'presentation'
                  },
                  {
                    default: ({ index }: { index: number }) => articles[index],
                    footer: () => pageSentinel
                  }
                )
              : h('div', null, [
                  h('div', { role: 'feed', 'aria-label': ariaLabel }, articles),
                  pageSentinel
                ])
            : null
        ]
      )
    }
  }
})

export default CommentThread
