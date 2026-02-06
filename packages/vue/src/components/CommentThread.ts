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

    const BTN_BASE = 'px-1.5 py-0.5 h-auto min-h-0 text-xs rounded'
    const ACTION_BTN = `${BTN_BASE} text-gray-400 hover:text-gray-600 font-normal hover:bg-gray-50`
    const PRIMARY_BTN = `${BTN_BASE} text-[var(--tiger-primary,#2563eb)] hover:text-[var(--tiger-primary-hover,#1d4ed8)] font-medium hover:bg-[var(--tiger-primary,#2563eb)]/5`

    const renderActionButton = (
      label: string,
      key: string,
      onClick: () => void,
      active?: boolean
    ) =>
      h(
        Button,
        {
          key,
          size: 'sm',
          variant: 'ghost',
          className: classNames(
            ACTION_BTN,
            active &&
              'text-[var(--tiger-primary,#2563eb)] hover:text-[var(--tiger-primary,#2563eb)] font-medium'
          ),
          onClick
        },
        { default: () => label }
      )

    const renderNode = (
      node: CommentNode,
      depth: number,
      isLast: boolean
    ): ReturnType<typeof h> => {
      const hasChildren = !!node.children && node.children.length > 0
      const isExpanded = expandedSet.value.has(node.id)
      const showReplies = hasChildren && isExpanded
      const showAllReplies = expandedAllKeys.value.has(node.id)
      const repliesId = `tiger-comment-replies-${node.id}`
      const visibleChildren = showReplies
        ? props.maxReplies > 0 && !showAllReplies
          ? node.children!.slice(0, props.maxReplies)
          : node.children!
        : []
      const showLoadMore =
        showReplies &&
        props.maxReplies > 0 &&
        node.children!.length > props.maxReplies &&
        !showAllReplies

      const actions: Array<ReturnType<typeof h>> = []

      if (props.showLike) {
        const likeLabel = node.liked ? props.likedText : props.likeText
        const likeCount = node.likes ? ` ${node.likes}` : ''
        actions.push(
          renderActionButton(
            `${likeLabel}${likeCount}`,
            'like',
            () => emit('like', node, !node.liked),
            node.liked
          )
        )
      }

      if (props.showReply) {
        actions.push(
          renderActionButton(props.replyText, 'reply', () => {
            replyingTo.value = replyingTo.value === node.id ? null : node.id
            replyValue.value = ''
          })
        )
      }

      if (props.showMore) {
        actions.push(renderActionButton(props.moreText, 'more', () => emit('more', node)))
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
                className: ACTION_BTN,
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
            depth === 1 && 'py-4',
            depth === 1 &&
              !isLast &&
              props.showDivider &&
              'border-b border-[var(--tiger-border,#e5e7eb)]'
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
                  className: 'shrink-0 mt-0.5'
                })
              : null,
            h('div', { class: 'flex-1 min-w-0' }, [
              h('div', { class: 'flex items-center gap-2 flex-wrap' }, [
                node.user?.name
                  ? h(
                      Text,
                      { tag: 'span', size: 'sm', weight: 'bold' },
                      { default: () => node.user?.name }
                    )
                  : null,
                node.user?.title
                  ? h(
                      Text,
                      { tag: 'span', size: 'xs', color: 'muted' },
                      { default: () => node.user?.title }
                    )
                  : null,
                node.tag
                  ? h(
                      Tag,
                      { size: 'sm', variant: node.tag.variant ?? 'default' },
                      { default: () => node.tag?.label }
                    )
                  : null,
                ...(node.tags ?? []).map((tag, index) =>
                  h(
                    Tag,
                    {
                      key: `${node.id}-tag-${index}`,
                      size: 'sm',
                      variant: tag.variant ?? 'default'
                    },
                    { default: () => tag.label }
                  )
                ),
                node.time
                  ? h(
                      Text,
                      { tag: 'span', size: 'xs', color: 'muted', class: 'ml-auto' },
                      { default: () => formatCommentTime(node.time) }
                    )
                  : null
              ]),
              h(
                'div',
                {
                  class:
                    'text-sm text-[var(--tiger-text-secondary,#4b5563)] leading-relaxed break-words mt-1.5 mb-2'
                },
                String(node.content)
              ),
              actions.length > 0
                ? h('div', { class: 'flex flex-wrap items-center gap-1' }, actions)
                : null,
              replyingTo.value === node.id
                ? h(
                    'div',
                    {
                      class: 'mt-3 space-y-2 bg-[var(--tiger-surface-muted,#f9fafb)] p-3 rounded-lg'
                    },
                    [
                      h(Textarea, {
                        rows: 2,
                        modelValue: replyValue.value,
                        placeholder: props.replyPlaceholder,
                        className: 'bg-[var(--tiger-surface,#ffffff)]',
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
                      className: classNames('mt-2', PRIMARY_BTN),
                      'aria-expanded': isExpanded,
                      'aria-controls': repliesId,
                      onClick: () => toggleExpanded(node.id)
                    },
                    {
                      default: () =>
                        isExpanded ? '▾ 收起回复' : `▸ 展开 ${node.children!.length} 条回复`
                    }
                  )
                : null,
              showReplies
                ? h(
                    'div',
                    {
                      id: repliesId,
                      class:
                        'mt-3 ml-1 pl-4 border-l-2 border-[var(--tiger-border,#e5e7eb)] space-y-3'
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
                Text,
                { tag: 'div', size: 'sm', color: 'muted', class: 'text-center py-8' },
                { default: () => props.emptyText }
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
          'data-tiger-comment-thread': true,
          'aria-label': ariaLabel
        },
        children
      )
    }
  }
})

export default CommentThread
