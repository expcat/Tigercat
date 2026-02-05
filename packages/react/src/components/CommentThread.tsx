import React, { useMemo, useState } from 'react'
import {
  classNames,
  buildCommentTree,
  clipCommentTreeDepth,
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

export interface CommentThreadProps
  extends CoreCommentThreadProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {}

const formatCommentTime = (value?: string | number | Date): string => {
  if (value == null || value === '') return ''
  if (value instanceof Date) return value.toLocaleString()
  if (typeof value === 'number') return new Date(value).toLocaleString()
  return value
}

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
  }

  const renderActionButton = (
    label: string,
    key: string,
    onClick: () => void,
    active?: boolean
  ) => (
    <Button
      key={key}
      size="sm"
      variant="link"
      className={classNames(active && 'text-[var(--tiger-primary,#2563eb)]')}
      onClick={onClick}>
      {label}
    </Button>
  )

  const renderNode = (node: CommentNode, depth: number, isLast: boolean) => {
    const hasChildren = !!node.children && node.children.length > 0
    const isExpanded = expandedSet.has(node.id)
    const showReplies = hasChildren && isExpanded
    const showAllReplies = expandedAllKeys.has(node.id)
    const visibleChildren = showReplies
      ? maxReplies > 0 && !showAllReplies
        ? node.children!.slice(0, maxReplies)
        : node.children!
      : []
    const showLoadMore =
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
      <div key={node.id} className="tiger-comment-thread-item">
        <div className="flex gap-3">
          {showAvatar && node.user ? (
            <Avatar size="sm" src={node.user.avatar} text={node.user.name} className="shrink-0" />
          ) : null}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {node.user?.name ? (
                <Text tag="div" size="sm" weight="medium">
                  {node.user.name}
                </Text>
              ) : null}
              {node.user?.title ? (
                <Text tag="div" size="xs" color="muted">
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
                <Text tag="div" size="xs" color="muted">
                  {formatCommentTime(node.time)}
                </Text>
              ) : null}
            </div>
            <Text tag="div" size="sm">
              {node.content}
            </Text>
            {actions.length > 0 ? <div className="flex flex-wrap gap-2">{actions}</div> : null}

            {replyingTo === node.id ? (
              <div className="space-y-2">
                <Textarea
                  rows={3}
                  value={replyValue}
                  placeholder={replyPlaceholder}
                  onChange={(event) => setReplyValue(event.target.value)}
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="primary" onClick={() => handleReplySubmit(node)}>
                    {replyButtonText}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyValue('')
                    }}>
                    {cancelReplyText}
                  </Button>
                </div>
              </div>
            ) : null}

            {hasChildren ? (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="link" onClick={() => toggleExpanded(node.id)}>
                  {isExpanded ? '收起回复' : `展开 ${node.children!.length} 条回复`}
                </Button>
                {showLoadMore ? (
                  <Button size="sm" variant="link" onClick={() => handleLoadMore(node)}>
                    {loadMoreText}
                  </Button>
                ) : null}
              </div>
            ) : null}

            {showReplies ? (
              <div className="mt-3 pl-6 border-l border-gray-100 space-y-3">
                {visibleChildren.map((child, index) =>
                  renderNode(child, depth + 1, index === visibleChildren.length - 1)
                )}
              </div>
            ) : null}
          </div>
        </div>
        {showDivider && depth === 1 && !isLast ? <Divider className="my-4" /> : null}
      </div>
    )
  }

  return (
    <div
      className={classNames('tiger-comment-thread', 'flex', 'flex-col', 'gap-4', className)}
      data-tiger-comment-thread
      {...divProps}>
      {resolvedNodes.length === 0 ? (
        <Text tag="div" size="sm" color="muted" className="text-center py-6">
          {emptyText}
        </Text>
      ) : (
        <List
          dataSource={resolvedNodes}
          split={false}
          bordered="none"
          renderItem={(item, index) =>
            renderNode(item as CommentNode, 1, index === resolvedNodes.length - 1)
          }
        />
      )}
    </div>
  )
}

export default CommentThread
