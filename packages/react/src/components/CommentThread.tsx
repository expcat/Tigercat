import React, { useMemo, useState } from 'react'
import {
  classNames,
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

export interface CommentThreadProps
  extends CoreCommentThreadProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {}

export const CommentThread: React.FC<CommentThreadProps> = ({
  nodes,
  items,
  maxDepth = 3,
  maxReplies = 3,
  defaultExpandedKeys = [],
  expandedKeys,
  emptyText = '暂无评论',
  replyPlaceholder = '写下回复...',
  replyButtonText = '回复',
  cancelReplyText = '取消',
  likeText = '点赞',
  likedText = '已赞',
  replyText = '回复',
  moreText = '更多',
  loadMoreText = '加载更多',
  showAvatar = true,
  showDivider = true,
  showLike = true,
  showReply = true,
  showMore = true,
  onLike,
  onReply,
  onMore,
  onAction,
  onExpandedChange,
  onLoadMore,
  className,
  ...divProps
}) => {
  const [innerExpandedKeys, setInnerExpandedKeys] =
    useState<Array<string | number>>(defaultExpandedKeys)
  const [expandedAllKeys, setExpandedAllKeys] = useState<Set<string | number>>(new Set())
  const [replyingTo, setReplyingTo] = useState<string | number | null>(null)
  const [replyValue, setReplyValue] = useState('')

  const mergedExpandedKeys = expandedKeys ?? innerExpandedKeys
  const expandedSet = useMemo(
    () => new Set<string | number>(mergedExpandedKeys),
    [mergedExpandedKeys]
  )

  const resolvedNodes = useMemo(() => {
    const tree = nodes && nodes.length > 0 ? nodes : buildCommentTree(items ?? [])
    return clipCommentTreeDepth(tree, maxDepth)
  }, [nodes, items, maxDepth])

  const updateExpandedKeys = (next: Array<string | number>) => {
    if (!expandedKeys) {
      setInnerExpandedKeys(next)
    }
    onExpandedChange?.(next)
  }

  const toggleExpanded = (id: string | number) => {
    const next = expandedSet.has(id)
      ? mergedExpandedKeys.filter((key) => key !== id)
      : [...mergedExpandedKeys, id]
    updateExpandedKeys(next)
  }

  const handleLoadMore = (node: CommentNode) => {
    setExpandedAllKeys((prev) => {
      const next = new Set(prev)
      next.add(node.id)
      return next
    })
    onLoadMore?.(node)
  }

  const handleReplySubmit = (node: CommentNode) => {
    const trimmed = replyValue.trim()
    if (!trimmed) return
    onReply?.(node, replyValue)
    setReplyValue('')
    setReplyingTo(null)
    if (!expandedSet.has(node.id)) {
      const next = [...mergedExpandedKeys, node.id]
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
  ) => (
    <Button
      key={key}
      size="sm"
      variant="ghost"
      className={classNames(
        ACTION_BTN,
        active &&
          'text-[var(--tiger-primary,#2563eb)] hover:text-[var(--tiger-primary,#2563eb)] font-medium'
      )}
      onClick={onClick}>
      {label}
    </Button>
  )

  const renderNode = (node: CommentNode, depth: number, isLast: boolean) => {
    const hasChildren = !!node.children && node.children.length > 0
    const isExpanded = expandedSet.has(node.id)
    const showReplies = hasChildren && isExpanded
    const showAllReplies = expandedAllKeys.has(node.id)
    const repliesId = `tiger-comment-replies-${node.id}`
    const visibleChildren = showReplies
      ? maxReplies > 0 && !showAllReplies
        ? node.children!.slice(0, maxReplies)
        : node.children!
      : []
    const showLoadMoreBtn =
      showReplies && maxReplies > 0 && node.children!.length > maxReplies && !showAllReplies

    const actions: React.ReactNode[] = []

    if (showLike) {
      const likeLabel = node.liked ? likedText : likeText
      const likeCount = node.likes ? ` ${node.likes}` : ''
      actions.push(
        renderActionButton(
          `${likeLabel}${likeCount}`,
          'like',
          () => onLike?.(node, !node.liked),
          node.liked
        )
      )
    }

    if (showReply) {
      actions.push(
        renderActionButton(replyText, 'reply', () => {
          setReplyingTo((prev) => (prev === node.id ? null : node.id))
          setReplyValue('')
        })
      )
    }

    if (showMore) {
      actions.push(renderActionButton(moreText, 'more', () => onMore?.(node)))
    }

    if (node.actions && node.actions.length > 0) {
      node.actions.forEach((action, index) => {
        const actionKey = action.key ?? `${node.id}-action-${index}`
        actions.push(
          <Button
            key={actionKey}
            size="sm"
            variant={action.variant ?? 'ghost'}
            className={ACTION_BTN}
            disabled={action.disabled}
            onClick={() => {
              action.onClick?.(node, action)
              onAction?.(node, action as CommentAction)
            }}>
            {action.label}
          </Button>
        )
      })
    }

    return (
      <div
        key={node.id}
        className={classNames(
          'tiger-comment-thread-item',
          depth === 1 && 'py-4',
          depth === 1 && !isLast && showDivider && 'border-b border-[var(--tiger-border,#e5e7eb)]'
        )}>
        <div className="flex gap-3">
          {showAvatar && node.user ? (
            <Avatar
              size={depth === 1 ? 'md' : 'sm'}
              src={node.user.avatar}
              text={node.user.name}
              className="shrink-0 mt-0.5"
            />
          ) : null}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {node.user?.name ? (
                <Text tag="span" size="sm" weight="bold">
                  {node.user.name}
                </Text>
              ) : null}
              {node.user?.title ? (
                <Text tag="span" size="xs" color="muted">
                  {node.user.title}
                </Text>
              ) : null}
              {node.tag ? (
                <Tag size="sm" variant={node.tag.variant ?? 'default'}>
                  {node.tag.label}
                </Tag>
              ) : null}
              {node.tags?.map((tag, index) => (
                <Tag key={`${node.id}-tag-${index}`} size="sm" variant={tag.variant ?? 'default'}>
                  {tag.label}
                </Tag>
              ))}
              {node.time ? (
                <Text tag="span" size="xs" color="muted" className="ml-auto">
                  {formatCommentTime(node.time)}
                </Text>
              ) : null}
            </div>

            <div className="text-sm text-[var(--tiger-text-secondary,#4b5563)] leading-relaxed break-words mt-1.5 mb-2">
              {node.content}
            </div>

            {actions.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1">{actions}</div>
            ) : null}

            {replyingTo === node.id ? (
              <div className="mt-3 space-y-2 bg-[var(--tiger-surface-muted,#f9fafb)] p-3 rounded-lg">
                <Textarea
                  rows={2}
                  value={replyValue}
                  placeholder={replyPlaceholder}
                  className="bg-[var(--tiger-surface,#ffffff)]"
                  onChange={(event) => setReplyValue(event.target.value)}
                />
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyValue('')
                    }}>
                    {cancelReplyText}
                  </Button>
                  <Button size="sm" variant="primary" onClick={() => handleReplySubmit(node)}>
                    {replyButtonText}
                  </Button>
                </div>
              </div>
            ) : null}

            {hasChildren ? (
              <Button
                size="sm"
                variant="ghost"
                className={classNames('mt-2', PRIMARY_BTN)}
                aria-expanded={isExpanded}
                aria-controls={repliesId}
                onClick={() => toggleExpanded(node.id)}>
                {isExpanded ? '▾ 收起回复' : `▸ 展开 ${node.children!.length} 条回复`}
              </Button>
            ) : null}

            {showReplies ? (
              <div
                id={repliesId}
                className="mt-3 ml-1 pl-4 border-l-2 border-[var(--tiger-border,#e5e7eb)] space-y-3">
                {visibleChildren.map((child, index) =>
                  renderNode(child, depth + 1, index === visibleChildren.length - 1)
                )}
                {showLoadMoreBtn ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className={PRIMARY_BTN}
                    onClick={() => handleLoadMore(node)}>
                    {loadMoreText}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={classNames('tiger-comment-thread flex flex-col', className)}
      data-tiger-comment-thread
      aria-label={divProps['aria-label'] ?? (divProps['aria-labelledby'] ? undefined : '评论线程')}
      {...divProps}>
      {resolvedNodes.length === 0 ? (
        <Text tag="div" size="sm" color="muted" className="text-center py-8">
          {emptyText}
        </Text>
      ) : (
        resolvedNodes.map((node, index) => renderNode(node, 1, index === resolvedNodes.length - 1))
      )}
    </div>
  )
}

export default CommentThread
