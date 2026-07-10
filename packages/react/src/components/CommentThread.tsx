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

  const renderNode = (node: CommentNode, depth: number, isLast: boolean) => {
    const children = node.children ?? []
    const hasChildren = children.length > 0
    const isExpanded = expandedSet.has(node.id)
    const showReplies = hasChildren && isExpanded
    const showAllReplies = expandedAllKeys.has(node.id)
    const repliesId = `tiger-comment-replies-${node.id}`
    const visibleChildren = showReplies
      ? maxReplies > 0 && !showAllReplies
        ? children.slice(0, maxReplies)
        : children
      : []
    const showLoadMoreBtn =
      showReplies && maxReplies > 0 && children.length > maxReplies && !showAllReplies

    const actions: React.ReactNode[] = []

    if (showLike) {
      const likeLabel = node.liked ? likedText : likeText
      const likeCount = node.likes ? ` ${node.likes}` : ''
      actions.push(
        <Button
          key="like"
          size="sm"
          variant="ghost"
          className={classNames(
            commentThreadActionButtonClasses,
            commentThreadLikeButtonClasses,
            node.liked && commentThreadLikedButtonClasses
          )}
          onClick={() => onLike?.(node, !node.liked)}>
          <svg
            className={classNames(
              commentThreadLikeIconClasses,
              node.liked ? 'fill-current' : 'stroke-current fill-none'
            )}
            viewBox="0 0 24 24"
            strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.421.068.848.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 010-7.764c.26-.85.1083-1.368 1.972-1.368h.908c.445 0 .72.498.523.898a8.963 8.963 0 00-.27.602"
            />
          </svg>
          <span>{`${likeLabel}${likeCount}`}</span>
        </Button>
      )
    }

    if (showReply) {
      actions.push(
        <Button
          key="reply"
          size="sm"
          variant="ghost"
          className={classNames(commentThreadActionButtonClasses, commentThreadReplyButtonClasses)}
          onClick={() => {
            setReplyingTo((prev) => (prev === node.id ? null : node.id))
            setReplyValue('')
          }}>
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>{replyText}</span>
        </Button>
      )
    }

    if (showMore) {
      actions.push(
        <Button
          key="more"
          size="sm"
          variant="ghost"
          className={classNames(
            commentThreadActionButtonClasses,
            commentThreadNeutralButtonClasses
          )}
          onClick={() => onMore?.(node)}>
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
          <span>{moreText}</span>
        </Button>
      )
    }

    if (node.actions && node.actions.length > 0) {
      node.actions.forEach((action, index) => {
        const actionKey = action.key ?? `${node.id}-action-${index}`
        actions.push(
          <Button
            key={actionKey}
            size="sm"
            variant={action.variant ?? 'ghost'}
            className={classNames(
              commentThreadActionButtonClasses,
              commentThreadNeutralButtonClasses
            )}
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
          depth === 1 && 'py-5',
          depth === 1 && !isLast && showDivider && commentThreadDividerClasses
        )}>
        <div className="flex gap-3">
          {showAvatar && node.user ? (
            <Avatar
              size={depth === 1 ? 'md' : 'sm'}
              src={node.user.avatar}
              text={node.user.name}
              className={commentThreadAvatarClasses}
            />
          ) : null}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {node.user?.name ? (
                <Text tag="span" size="sm" weight="bold" className={commentThreadAuthorClasses}>
                  {node.user.name}
                </Text>
              ) : null}
              {node.user?.title ? (
                <Text tag="span" size="xs" color="muted" className={commentThreadUserTitleClasses}>
                  {node.user.title}
                </Text>
              ) : null}
              {node.tag ? (
                <Tag
                  size="sm"
                  variant={node.tag.variant ?? 'default'}
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase border border-current bg-current/10">
                  {node.tag.label}
                </Tag>
              ) : null}
              {node.tags?.map((tag, index) => (
                <Tag
                  key={`${node.id}-tag-${index}`}
                  size="sm"
                  variant={tag.variant ?? 'default'}
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase border border-current bg-current/10">
                  {tag.label}
                </Tag>
              ))}
              {node.time ? (
                <Text tag="span" size="xs" color="muted" className={commentThreadTimeClasses}>
                  {formatCommentTime(node.time)}
                </Text>
              ) : null}
            </div>

            <div className={commentThreadContentClasses}>{node.content}</div>

            {actions.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5">{actions}</div>
            ) : null}

            {replyingTo === node.id ? (
              <div className={commentThreadReplyEditorClasses}>
                <Textarea
                  rows={3}
                  value={replyValue}
                  placeholder={replyPlaceholder}
                  className={commentThreadReplyTextareaClasses}
                  onChange={(event) => setReplyValue(event.target.value)}
                />
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    className={commentThreadCancelButtonClasses}
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyValue('')
                    }}>
                    {cancelReplyText}
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    className={commentThreadSubmitButtonClasses}
                    onClick={() => handleReplySubmit(node)}>
                    {replyButtonText}
                  </Button>
                </div>
              </div>
            ) : null}

            {hasChildren ? (
              <Button
                size="sm"
                variant="ghost"
                className={classNames('mt-2 font-semibold', commentThreadPrimaryButtonClasses)}
                aria-expanded={isExpanded}
                aria-controls={repliesId}
                onClick={() => toggleExpanded(node.id)}>
                {isExpanded ? '▾ 收起回复' : `▸ 展开 ${children.length} 条回复`}
              </Button>
            ) : null}

            {showReplies ? (
              <div id={repliesId} className={commentThreadRepliesClasses}>
                {visibleChildren.map((child, index) =>
                  renderNode(child, depth + 1, index === visibleChildren.length - 1)
                )}
                {showLoadMoreBtn ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className={commentThreadPrimaryButtonClasses}
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
      role={divProps.role ?? 'feed'}
      data-tiger-comment-thread
      aria-label={divProps['aria-label'] ?? (divProps['aria-labelledby'] ? undefined : '评论线程')}
      {...divProps}>
      {resolvedNodes.length === 0 ? (
        <div className={commentThreadEmptyClasses}>
          <svg
            className={commentThreadEmptyIconClasses}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <Text tag="div" size="sm" color="muted" className="font-medium">
            {emptyText}
          </Text>
        </div>
      ) : (
        resolvedNodes.map((node, index) => renderNode(node, 1, index === resolvedNodes.length - 1))
      )}
    </div>
  )
}

export default CommentThread
