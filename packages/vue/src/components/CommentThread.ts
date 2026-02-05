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
import { List } from './List'
import { Avatar } from './Avatar'
import { Tag } from './Tag'
import { Button } from './Button'
import { Textarea } from './Textarea'
import { Divider } from './Divider'
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
        'tiger-comment-thread',
        'flex',
        'flex-col',
        'gap-4',
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
    }

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
          variant: 'link',
          className: classNames(active && 'text-[var(--tiger-primary,#2563eb)]'),
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

      return h('div', { class: 'tiger-comment-thread-item', key: node.id }, [
        h('div', { class: 'flex gap-3' }, [
          props.showAvatar && node.user
            ? h(Avatar, {
                size: 'sm',
                src: node.user.avatar,
                text: node.user.name,
                className: 'shrink-0'
              })
            : null,
          h('div', { class: 'flex-1 space-y-2' }, [
            h('div', { class: 'flex items-center gap-2 flex-wrap' }, [
              node.user?.name
                ? h(
                    Text,
                    { tag: 'div', size: 'sm', weight: 'medium' },
                    { default: () => node.user?.name }
                  )
                : null,
              node.user?.title
                ? h(
                    Text,
                    { tag: 'div', size: 'xs', color: 'muted' },
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
                  { key: `${node.id}-tag-${index}`, size: 'sm', variant: tag.variant ?? 'default' },
                  { default: () => tag.label }
                )
              ),
              node.time
                ? h(
                    Text,
                    { tag: 'div', size: 'xs', color: 'muted' },
                    { default: () => formatCommentTime(node.time) }
                  )
                : null
            ]),
            h(Text, { tag: 'div', size: 'sm' }, { default: () => node.content }),
            actions.length > 0 ? h('div', { class: 'flex flex-wrap gap-2' }, actions) : null,
            replyingTo.value === node.id
              ? h('div', { class: 'space-y-2' }, [
                  h(Textarea, {
                    rows: 3,
                    modelValue: replyValue.value,
                    placeholder: props.replyPlaceholder,
                    'onUpdate:modelValue': (value: string) => {
                      replyValue.value = value
                    }
                  }),
                  h('div', { class: 'flex items-center gap-2' }, [
                    h(
                      Button,
                      { size: 'sm', variant: 'primary', onClick: () => handleReplySubmit(node) },
                      { default: () => props.replyButtonText }
                    ),
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
                    )
                  ])
                ])
              : null,
            hasChildren
              ? h('div', { class: 'flex items-center gap-2' }, [
                  h(
                    Button,
                    {
                      size: 'sm',
                      variant: 'link',
                      'aria-expanded': isExpanded,
                      'aria-controls': repliesId,
                      onClick: () => toggleExpanded(node.id)
                    },
                    {
                      default: () =>
                        isExpanded ? '收起回复' : `展开 ${node.children!.length} 条回复`
                    }
                  ),
                  showLoadMore
                    ? h(
                        Button,
                        { size: 'sm', variant: 'link', onClick: () => handleLoadMore(node) },
                        { default: () => props.loadMoreText }
                      )
                    : null
                ])
              : null,
            showReplies
              ? h('div', { id: repliesId, class: 'mt-3 pl-6 border-l border-gray-100 space-y-3' }, [
                  ...visibleChildren.map((child, index) =>
                    renderNode(child, depth + 1, index === visibleChildren.length - 1)
                  )
                ])
              : null
          ])
        ]),
        props.showDivider && depth === 1 && !isLast ? h(Divider, { className: 'my-4' }) : null
      ])
    }

    return () => {
      const ariaLabel =
        (attrs['aria-label'] as string | undefined) ??
        (attrs['aria-labelledby'] ? undefined : '评论线程')

      if (resolvedNodes.value.length === 0) {
        return h(
          'div',
          {
            ...attrs,
            class: wrapperClasses.value,
            style: wrapperStyle.value,
            'data-tiger-comment-thread': true,
            'aria-label': ariaLabel
          },
          h(
            Text,
            { tag: 'div', size: 'sm', color: 'muted', className: 'text-center py-6' },
            { default: () => props.emptyText }
          )
        )
      }

      return h(
        'div',
        {
          ...attrs,
          class: wrapperClasses.value,
          style: wrapperStyle.value,
          'data-tiger-comment-thread': true,
          'aria-label': ariaLabel
        },
        h(
          List,
          { dataSource: resolvedNodes.value, split: false, bordered: 'none' },
          {
            renderItem: ({
              item,
              index
            }: {
              item: CommentNode
              index: number
            }): ReturnType<typeof h> =>
              renderNode(item, 1, index === resolvedNodes.value.length - 1)
          }
        )
      )
    }
  }
})

export default CommentThread
