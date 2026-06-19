import { defineComponent, computed, h, ref, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  buildCommentTree,
  clipCommentTreeDepth,
  formatCommentTime,
  type CommentAction,
  type CommentNode,
  type CommentThreadProps as CoreCommentThreadProps
} from '@expcat/tigercat-core'
import { Avatar } from './Avatar'
import { Tag } from './Tag'
import { Button } from './Button'
import { Textarea } from './Textarea'
import { Text } from './Text'

export interface VueCommentThreadProps extends CoreCommentThreadProps {
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
      default: '暂无评论'
    },
    replyPlaceholder: {
      type: String,
      default: '写下回复...'
    },
    replyButtonText: {
      type: String,
      default: '回复'
    },
    cancelReplyText: {
      type: String,
      default: '取消'
    },
    likeText: {
      type: String,
      default: '点赞'
    },
    likedText: {
      type: String,
      default: '已赞'
    },
    replyText: {
      type: String,
      default: '回复'
    },
    moreText: {
      type: String,
      default: '更多'
    },
    loadMoreText: {
      type: String,
      default: '加载更多'
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
  emits: ['like', 'reply', 'more', 'action', 'expand-change', 'load-more'],
  setup(props, { emit, attrs }) {
    const innerExpandedKeys = ref<Array<string | number>>([...props.defaultExpandedKeys])
    const expandedAllKeys = ref(new Set<string | number>())
    const replyingTo = ref<string | number | null>(null)
    const replyValue = ref('')

    const mergedExpandedKeys = computed(() => props.expandedKeys ?? innerExpandedKeys.value)

    const expandedSet = computed(() => new Set<string | number>(mergedExpandedKeys.value))

    const resolvedNodes = computed(() => {
      const tree =
        props.nodes && props.nodes.length > 0 ? props.nodes : buildCommentTree(props.items ?? [])
      return clipCommentTreeDepth(tree, props.maxDepth)
    })

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
      emit('expand-change', next)
    }

    const toggleExpanded = (id: string | number) => {
      const current = mergedExpandedKeys.value
      const next = expandedSet.value.has(id)
        ? current.filter((key) => key !== id)
        : [...current, id]
      updateExpandedKeys(next)
    }

    const handleLoadMore = (node: CommentNode) => {
      expandedAllKeys.value = new Set([...expandedAllKeys.value, node.id])
      emit('load-more', node)
    }

    const handleReplySubmit = (node: CommentNode) => {
      const trimmed = replyValue.value.trim()
      if (!trimmed) return
      emit('reply', node, replyValue.value)
      replyValue.value = ''
      replyingTo.value = null
      if (!expandedSet.value.has(node.id)) {
        const next = [...mergedExpandedKeys.value, node.id]
        updateExpandedKeys(next)
      }
    }

    const BTN_BASE = 'px-2 py-0.5 h-auto min-h-0 text-xs rounded-md transition-all duration-200 ease-out'
    const ACTION_BTN = `${BTN_BASE} text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5`
    const PRIMARY_BTN = `${BTN_BASE} text-[var(--tiger-primary,#2563eb)] hover:text-[var(--tiger-primary-hover,#1d4ed8)] dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:bg-[var(--tiger-primary,#2563eb)]/10 dark:hover:bg-blue-400/10`

    const renderNode = (
      node: CommentNode,
      depth: number,
      isLast: boolean
    ): ReturnType<typeof h> => {
      const children = node.children ?? []
      const hasChildren = children.length > 0
      const isExpanded = expandedSet.value.has(node.id)
      const showReplies = hasChildren && isExpanded
      const showAllReplies = expandedAllKeys.value.has(node.id)
      const repliesId = `tiger-comment-replies-${node.id}`
      const visibleChildren = showReplies
        ? props.maxReplies > 0 && !showAllReplies
          ? children.slice(0, props.maxReplies)
          : children
        : []
      const showLoadMore =
        showReplies &&
        props.maxReplies > 0 &&
        children.length > props.maxReplies &&
        !showAllReplies

      const actions: Array<ReturnType<typeof h>> = []

      if (props.showLike) {
        const likeLabel = node.liked ? props.likedText : props.likeText
        const likeCount = node.likes ? ` ${node.likes}` : ''
        actions.push(
          h(
            Button,
            {
              key: 'like',
              size: 'sm',
              variant: 'ghost',
              className: classNames(
                ACTION_BTN,
                'hover:text-blue-600 hover:bg-blue-50/50 dark:hover:text-blue-400 dark:hover:bg-blue-950/20',
                node.liked &&
                  'text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/10 font-semibold border-blue-200/40 dark:border-blue-800/30'
              ),
              onClick: () => emit('like', node, !node.liked)
            },
            {
              default: () =>
                h('span', { class: 'flex items-center gap-1.5' }, [
                  h('svg', {
                    class: classNames("w-3.5 h-3.5 transition-transform duration-200 active:scale-125", node.liked ? "fill-current" : "stroke-current fill-none"),
                    viewBox: "0 0 24 24",
                    strokeWidth: "2"
                  }, [
                    h('path', {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      d: "M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.421.068.848.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 010-7.764c.26-.85.1083-1.368 1.972-1.368h.908c.445 0 .72.498.523.898a8.963 8.963 0 00-.27.602"
                    })
                  ]),
                  h('span', `${likeLabel}${likeCount}`)
                ])
            }
          )
        )
      }

      if (props.showReply) {
        actions.push(
          h(
            Button,
            {
              key: 'reply',
              size: 'sm',
              variant: 'ghost',
              className: classNames(
                ACTION_BTN,
                'hover:text-emerald-600 hover:bg-emerald-50/50 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/20'
              ),
              onClick: () => {
                replyingTo.value = replyingTo.value === node.id ? null : node.id
                replyValue.value = ''
              }
            },
            {
              default: () =>
                h('span', { class: 'flex items-center gap-1.5' }, [
                  h('svg', {
                    class: 'w-3.5 h-3.5',
                    viewBox: '0 0 24 24',
                    fill: 'none',
                    stroke: 'currentColor',
                    strokeWidth: '2'
                  }, [
                    h('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      d: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                    })
                  ]),
                  h('span', props.replyText)
                ])
            }
          )
        )
      }

      if (props.showMore) {
        actions.push(
          h(
            Button,
            {
              key: 'more',
              size: 'sm',
              variant: 'ghost',
              className: classNames(
                ACTION_BTN,
                'hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              ),
              onClick: () => emit('more', node)
            },
            {
              default: () =>
                h('span', { class: 'flex items-center gap-1.5' }, [
                  h('svg', {
                    class: 'w-3.5 h-3.5',
                    viewBox: '0 0 24 24',
                    fill: 'none',
                    stroke: 'currentColor',
                    strokeWidth: '2'
                  }, [
                    h('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      d: 'M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z'
                    })
                  ]),
                  h('span', props.moreText)
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
                  ACTION_BTN,
                  'hover:bg-gray-100 dark:hover:bg-gray-800'
                ),
                disabled: action.disabled,
                onClick: () => {
                  action.onClick?.(node, action)
                  emit('action', node, action as CommentAction)
                }
              },
              { default: () => action.label }
            )
          )
        })
      }

      return h(
        'div',
        {
          class: classNames(
            'tiger-comment-thread-item',
            depth === 1 && 'py-5',
            depth === 1 &&
              !isLast &&
              props.showDivider &&
              'border-b border-gray-100 dark:border-gray-800/80'
          ),
          key: node.id
        },
        [
          h('div', { class: 'flex gap-3' }, [
            props.showAvatar && node.user
              ? h(Avatar, {
                  size: depth === 1 ? 'md' : 'sm',
                  src: node.user.avatar,
                  text: node.user.name,
                  className: 'shrink-0 mt-0.5 ring-1 ring-black/5 dark:ring-white/10 shadow-sm transition-transform hover:scale-105 duration-200'
                })
              : null,
            h('div', { class: 'flex-1 min-w-0' }, [
              h('div', { class: 'flex items-center gap-2 flex-wrap' }, [
                node.user?.name
                  ? h(
                      Text,
                      { tag: 'span', size: 'sm', weight: 'bold', class: 'text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer' },
                      { default: () => node.user?.name }
                    )
                  : null,
                node.user?.title
                  ? h(
                      Text,
                      { tag: 'span', size: 'xs', color: 'muted', class: 'bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400 font-medium' },
                      { default: () => node.user?.title }
                    )
                  : null,
                node.tag
                  ? h(
                      Tag,
                      { size: 'sm', variant: node.tag.variant ?? 'default', className: 'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase border border-current bg-opacity-10' },
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
                      className: 'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase border border-current bg-opacity-10'
                    },
                    { default: () => tag.label }
                  )
                ),
                node.time
                  ? h(
                      Text,
                      { tag: 'span', size: 'xs', color: 'muted', class: 'ml-auto text-gray-400 dark:text-gray-500 font-normal' },
                      { default: () => formatCommentTime(node.time) }
                    )
                  : null
              ]),
              h(
                'div',
                {
                  class:
                    'text-sm text-gray-600 dark:text-gray-300 leading-relaxed break-words mt-2 mb-3 pr-2'
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
                      class:
                        'mt-3 space-y-3 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800/80 p-4 rounded-xl shadow-sm backdrop-blur-sm transition-all duration-300'
                    },
                    [
                      h(Textarea, {
                        rows: 3,
                        modelValue: replyValue.value,
                        placeholder: props.replyPlaceholder,
                        className: 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg shadow-inner transition-all duration-200',
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
                            className: 'px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg transition-colors',
                            onClick: () => {
                              replyingTo.value = null
                              replyValue.value = ''
                            }
                          },
                          { default: () => props.cancelReplyText }
                        ),
                        h(
                          Button,
                          {
                            size: 'sm',
                            variant: 'primary',
                            className: 'px-3 py-1.5 text-xs font-semibold shadow-sm hover:shadow transition-all duration-200 rounded-lg',
                            onClick: () => handleReplySubmit(node)
                          },
                          { default: () => props.replyButtonText }
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
                      className: classNames('mt-2 font-semibold hover:bg-[var(--tiger-primary,#2563eb)]/10 dark:hover:bg-blue-400/10 transition-colors', PRIMARY_BTN),
                      'aria-expanded': isExpanded,
                      'aria-controls': repliesId,
                      onClick: () => toggleExpanded(node.id)
                    },
                    {
                      default: () =>
                        isExpanded ? '▾ 收起回复' : `▸ 展开 ${children.length} 条回复`
                    }
                  )
                : null,
              showReplies
                ? h(
                    'div',
                    {
                      id: repliesId,
                      class:
                        'mt-4 ml-1 pl-4 border-l-2 border-gray-100 dark:border-gray-800 hover:border-blue-500/40 dark:hover:border-blue-400/40 space-y-4 transition-colors duration-300'
                    },
                    [
                      ...visibleChildren.map((child, index) =>
                        renderNode(child, depth + 1, index === visibleChildren.length - 1)
                      ),
                      showLoadMore
                        ? h(
                            Button,
                            {
                              size: 'sm',
                              variant: 'ghost',
                              className: PRIMARY_BTN,
                              onClick: () => handleLoadMore(node)
                            },
                            { default: () => props.loadMoreText }
                          )
                        : null
                    ]
                  )
                : null
            ])
          ])
        ]
      )
    }

    return () => {
      const ariaLabel =
        (attrs['aria-label'] as string | undefined) ??
        (attrs['aria-labelledby'] ? undefined : '评论线程')

      const children =
        resolvedNodes.value.length === 0
          ? [
              h(
                'div',
                { class: 'flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-gray-800/80 rounded-xl py-12 px-4 bg-gray-50/20 dark:bg-gray-900/5 transition-colors' },
                [
                  h('svg', {
                    class: 'w-10 h-10 text-gray-300 dark:text-gray-600 mb-3',
                    fill: 'none',
                    viewBox: '0 0 24 24',
                    stroke: 'currentColor',
                    strokeWidth: '1.5'
                  }, [
                    h('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      d: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                    })
                  ]),
                  h(
                    Text,
                    { tag: 'div', size: 'sm', color: 'muted', class: 'font-medium' },
                    { default: () => props.emptyText }
                  )
                ]
              )
            ]
          : resolvedNodes.value.map((node, index) =>
              renderNode(node, 1, index === resolvedNodes.value.length - 1)
            )

      return h(
        'div',
        {
          ...attrs,
          class: wrapperClasses.value,
          style: wrapperStyle.value,
          role: (attrs.role as string | undefined) ?? 'feed',
          'data-tiger-comment-thread': true,
          'aria-label': ariaLabel
        },
        children
      )
    }
  }
})

export default CommentThread
