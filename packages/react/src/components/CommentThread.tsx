import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  classNames,
  commentDisplayHtml,
  commentEditRequest,
  sanitizeHtml,
  canSubmitCommentReply,
  clipCommentTreeDepth,
  commentIdKey,
  commentNodeAcceptsReply,
  formatCommentTreeError,
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
  commentThreadListClasses,
  getCommentThreadItemClasses,
  getCommentThreadItemStyle,
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
import { useTigerConfig } from './tiger-config'
import { VirtualList, type VirtualListHandle } from './VirtualList'

export interface CommentThreadProps
  extends CoreCommentThreadProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  editable?: boolean
  rich?: boolean
  onEdit?: (request: { id: string | number; body: string }) => void
  onDelete?: (id: string | number) => void
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  nodes,
  items,
  maxDepth = 3,
  maxReplies = 3,
  defaultExpandedKeys = [],
  expandedKeys,
  emptyText,
  replyPlaceholder,
  replyButtonText,
  cancelReplyText,
  likeText,
  likedText,
  replyText,
  moreText,
  loadMoreText,
  collapseRepliesText,
  expandRepliesText,
  locale,
  labels: labelsOverride,
  showAvatar = true,
  showDivider = true,
  showLike = true,
  showReply = true,
  showMore = false,
  showComposer = true,
  onLike,
  onReply,
  onMore,
  onAction,
  onUserClick,
  onExpandedChange,
  onLoadMore,
  timeZone,
  hasMore = false,
  loadError = false,
  onLoadRoot,
  className,
  editable = false,
  rich = false,
  onEdit,
  onDelete,
  ...divProps
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getCommentThreadLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )

  const [innerExpandedKeys, setInnerExpandedKeys] =
    useState<Array<string | number>>(defaultExpandedKeys)
  const [revealedCounts, setRevealedCounts] = useState<Map<string | number, number>>(
    () => new Map()
  )
  const [likeOverlay, setLikeOverlay] = useState<CommentLikeOverlay>(() => new Map())
  const [replyingTo, setReplyingTo] = useState<string | number | null>(null)
  const [replyValue, setReplyValue] = useState('')
  const [composerValue, setComposerValue] = useState('')
  const [replyInFlight, setReplyInFlight] = useState(false)
  const [documentTimeZone, setDocumentTimeZone] = useState<string | null>(timeZone ?? null)
  const flightRef = useRef(createInfiniteScrollFlight())
  const sentinelRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<VirtualListHandle | null>(null)
  const onLoadRootRef = useRef(onLoadRoot)
  onLoadRootRef.current = onLoadRoot
  useEffect(() => {
    setDocumentTimeZone(timeZone || readDocumentTimeZone())
  }, [timeZone])
  useEffect(() => {
    if (loadError) flightRef.current.noteError()
  }, [loadError])

  const mergedExpandedKeys = expandedKeys ?? innerExpandedKeys
  const expandedSet = useMemo(
    () => new Set<string | number>(mergedExpandedKeys),
    [mergedExpandedKeys]
  )

  const { resolvedNodes, clippedIds, treeErrors } = useMemo(() => {
    const clipped = new Set<string | number>()
    const tree = resolveCommentNodes(nodes, items)
    return {
      resolvedNodes: clipCommentTreeDepth(tree.roots, maxDepth, clipped),
      clippedIds: clipped,
      treeErrors: tree.errors
    }
  }, [items, maxDepth, nodes])

  useEffect(() => {
    setLikeOverlay(new Map())
    setRevealedCounts(new Map())
  }, [nodes, items])

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

  const hasLoadMoreHandler = typeof onLoadMore === 'function'
  const hasReplyHandler = typeof onReply === 'function'

  const handleLoadMore = (node: CommentNode) => {
    const children = node.children ?? []
    const current = revealedCounts.get(node.id) ?? maxReplies
    const view = getCommentRepliesView(children, {
      maxReplies,
      revealedCount: current,
      hasLoadMoreHandler
    })
    if (view.loadMoreKind === 'remaining') {
      setRevealedCounts((prev) => {
        const next = new Map(prev)
        next.set(node.id, nextCommentRevealedCount(current, maxReplies, children.length))
        return next
      })
      return
    }
    onLoadMore?.(node)
  }

  const handleLike = (node: CommentNode) => {
    const next = nextCommentLikeState(node, likeOverlay)
    setLikeOverlay(writeCommentLikeOverlay(likeOverlay, node.id, next))
    onLike?.(node, next.liked)
  }

  const handleReplySubmit = async (node?: CommentNode) => {
    const source = node ? replyValue : composerValue
    if (
      !canSubmitCommentReply({
        value: source,
        inFlight: replyInFlight,
        hasReplyHandler
      })
    ) {
      return
    }
    const text = source.trim()
    setReplyInFlight(true)
    try {
      await Promise.resolve(onReply?.(node, text))
      if (node) {
        setReplyValue('')
        setReplyingTo(null)
        if (!expandedSet.has(node.id)) updateExpandedKeys([...mergedExpandedKeys, node.id])
      } else {
        setComposerValue('')
      }
    } catch {
      // Keep the draft so the same reply can be sent again.
    } finally {
      setReplyInFlight(false)
    }
  }

  const instanceId = useId()
  const positionMap = useMemo(() => {
    const into = new Map<string, number>()
    const walk = (list: CommentNode[]) => {
      for (const node of list) {
        into.set(commentIdKey(node.id), into.size + 1)
        walk(node.children ?? [])
      }
    }
    walk(resolvedNodes)
    return into
  }, [resolvedNodes])

  const renderNode = (node: CommentNode, depth: number, hasPreviousRoot: boolean) => {
    const children = node.children ?? []
    const hasChildren = children.length > 0 || clippedIds.has(node.id)
    const isExpanded = expandedSet.has(node.id)
    const repliesView = getCommentRepliesView(children, {
      maxReplies,
      revealedCount: revealedCounts.get(node.id) ?? maxReplies,
      hasLoadMoreHandler
    })
    const showReplies = hasChildren && isExpanded && children.length > 0
    const articleId = `${instanceId}-article-${commentIdKey(node.id)}`
    const visibleChildren = showReplies ? repliesView.visible : []
    const firstReply = visibleChildren[0]
    const controlsId = firstReply
      ? `${instanceId}-article-${commentIdKey(firstReply.id)}`
      : undefined
    const showLoadMoreBtn = showReplies && repliesView.loadMoreKind != null
    const posinset = positionMap.get(commentIdKey(node.id)) ?? 1

    const actions: React.ReactNode[] = []

    if (showLike) {
      const { liked, likes } = resolveCommentLikeState(node, likeOverlay)
      const likeLabel = liked
        ? resolveLocaleText(labels.likedText, likedText)
        : resolveLocaleText(labels.likeText, likeText)
      const likeCount = likes ? ` ${likes}` : ''
      actions.push(
        <Button
          key="like"
          size="sm"
          variant="ghost"
          aria-pressed={liked}
          className={classNames(
            commentThreadActionButtonClasses,
            commentThreadLikeButtonClasses,
            liked && commentThreadLikedButtonClasses
          )}
          onClick={() => handleLike(node)}>
          <svg
            aria-hidden="true"
            className={classNames(
              commentThreadLikeIconClasses,
              liked ? 'fill-current' : 'stroke-current fill-none'
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

    if (showReply && commentNodeAcceptsReply(depth, maxDepth)) {
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
            aria-hidden="true"
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
          <span>{resolveLocaleText(labels.replyText, replyText)}</span>
        </Button>
      )
    }

    if (showMore && (onMore || (node.actions && node.actions.length > 0))) {
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
            aria-hidden="true"
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
          <span>{resolveLocaleText(labels.moreText, moreText)}</span>
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
              if (action.onClick) action.onClick(node, action)
              else onAction?.(node, action as CommentAction)
            }}>
            {action.label}
          </Button>
        )
      })
    }

    return (
      <article
        key={node.id}
        id={articleId}
        className={getCommentThreadItemClasses({
          depth,
          showDivider,
          hasPreviousRoot
        })}
        style={getCommentThreadItemStyle(depth)}
        aria-posinset={posinset}
        aria-setsize={positionMap.size}>
        <div className="flex gap-3">
          {showAvatar && node.user ? (
            <Avatar
              size={depth === 1 ? 'md' : 'sm'}
              src={node.user.avatar}
              text={node.user.name}
              className={commentThreadAvatarClasses}
              aria-hidden={Boolean(node.user.name)}
            />
          ) : null}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {node.user?.name ? (
                onUserClick ? (
                  <button
                    type="button"
                    className={commentThreadAuthorClasses}
                    onClick={() => onUserClick(node)}>
                    <Text tag="span" size="sm" weight="bold">
                      {node.user.name}
                    </Text>
                  </button>
                ) : (
                  <Text
                    tag="span"
                    size="sm"
                    weight="bold"
                    className={commentThreadAuthorClasses.replace('cursor-pointer', '')}>
                    {node.user.name}
                  </Text>
                )
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
              {formatCommentTime(
                node.time,
                mergedLocale,
                documentTimeZone ? { timeZone: documentTimeZone } : undefined
              ) ? (
                <Text tag="span" size="xs" color="muted" className={commentThreadTimeClasses}>
                  {formatCommentTime(
                    node.time,
                    mergedLocale,
                    documentTimeZone ? { timeZone: documentTimeZone } : undefined
                  )}
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
                  placeholder={resolveLocaleText(labels.replyPlaceholder, replyPlaceholder)}
                  className={commentThreadReplyTextareaClasses}
                  aria-label={resolveLocaleText(labels.replyText, replyText)}
                  onChange={setReplyValue}
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
                    {resolveLocaleText(labels.cancelReplyText, cancelReplyText)}
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    className={commentThreadSubmitButtonClasses}
                    disabled={
                      !canSubmitCommentReply({
                        value: replyValue,
                        inFlight: replyInFlight,
                        hasReplyHandler
                      })
                    }

                    onClick={() => handleReplySubmit(node)}>
                    {resolveLocaleText(labels.replySubmitText, replyButtonText)}
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
                aria-controls={controlsId}
                disabled={clippedIds.has(node.id) && children.length === 0}
                onClick={() => {
                  if (clippedIds.has(node.id) && children.length === 0) return
                  toggleExpanded(node.id)
                }}>
                {clippedIds.has(node.id) && children.length === 0
                  ? labels.maxDepthReachedText
                  : isExpanded
                    ? resolveLocaleText(labels.collapseRepliesText, collapseRepliesText)
                    : formatBadgeCountLabel(
                        resolveLocaleText(labels.expandRepliesText, expandRepliesText),
                        children.length,
                        mergedLocale?.locale
                      )}
              </Button>
            ) : null}

            {showLoadMoreBtn ? (
              <div className={commentThreadRepliesClasses}>
                {showLoadMoreBtn ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className={commentThreadPrimaryButtonClasses}
                    onClick={() => handleLoadMore(node)}>
                    {repliesView.loadMoreKind === 'remaining'
                      ? formatBadgeCountLabel(
                          labels.remainingRepliesText,
                          repliesView.remaining,
                          mergedLocale?.locale
                        )
                      : resolveLocaleText(labels.loadMoreText, loadMoreText)}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </article>
    )
  }

  const flatComments: Array<{ node: CommentNode; depth: number }> = []
  const flattenVisible = (list: CommentNode[], depth: number) => {
    for (const node of list) {
      flatComments.push({ node, depth })
      if (!expandedSet.has(node.id)) continue
      const view = getCommentRepliesView(node.children, {
        maxReplies,
        revealedCount: revealedCounts.get(node.id) ?? maxReplies,
        hasLoadMoreHandler
      })
      flattenVisible(view.visible, depth + 1)
    }
  }
  flattenVisible(resolvedNodes, 1)
  const windowed = compositeListUsesWindow(flatComments.length)
  useEffect(() => {
    if (!hasMore || !onLoadRoot) return undefined
    const sentinel = sentinelRef.current
    if (!sentinel) return undefined
    const root = windowed ? (listRef.current?.getScrollElement() ?? null) : null
    return (
      createInfiniteScrollObserver(sentinel, {
        root,
        onLoadMore: () => {
          flightRef.current.noteSentinel(true)
          const start = onLoadRootRef.current
          if (!start || !flightRef.current.canRequest({ hasMore, error: loadError })) return
          flightRef.current.begin(start())
        },
        onLeave: () => flightRef.current.noteSentinel(false)
      }) ?? undefined
    )
  }, [flatComments.length, hasMore, loadError, onLoadRoot, windowed])

  const pageSentinel = hasMore ? (
    <div ref={sentinelRef} className={infiniteScrollSentinelClasses} aria-hidden="true" />
  ) : null

  const composer = showComposer ? (
    <div className={commentThreadReplyEditorClasses}>
      <Textarea
        rows={3}
        value={composerValue}
        placeholder={resolveLocaleText(labels.replyPlaceholder, replyPlaceholder)}
        className={commentThreadReplyTextareaClasses}
        aria-label={resolveLocaleText(labels.replyPlaceholder, replyPlaceholder)}
        onChange={setComposerValue}
      />
      <div className="flex items-center gap-2 justify-end">
        <Button
          size="sm"
          variant="primary"
          className={commentThreadSubmitButtonClasses}
          disabled={
            !canSubmitCommentReply({
              value: composerValue,
              inFlight: replyInFlight,
              hasReplyHandler
            })
          }
          onClick={() => handleReplySubmit()}>
          {resolveLocaleText(labels.replySubmitText, replyButtonText)}
        </Button>
      </div>
    </div>
  ) : null

  return (
    <div
      className={classNames(
        'tiger-comment-thread flex flex-col',
        commentThreadListClasses,
        className
      )}
      role="region"
      data-tiger-comment-thread
      aria-label={
        divProps['aria-label'] ?? (divProps['aria-labelledby'] ? undefined : labels.listAriaLabel)
      }
      {...divProps}>
      {editable ? (
        <div data-tiger-comment-manage="">
          {(items ?? nodes ?? []).map((comment) => {
            const raw = String(comment.content ?? '')
            const sanitized = sanitizeHtml(raw)
            const display = commentDisplayHtml(rich ? 'rich' : 'plain', sanitized)
            return (
              <div key={String(comment.id)}>
                {display === 'fragment' ? (
                  <span data-comment-html="" dangerouslySetInnerHTML={{ __html: sanitized }} />
                ) : (
                  <span data-comment-text="">{raw}</span>
                )}
                <button
                  type="button"
                  data-comment-edit={String(comment.id)}
                  onClick={() => onEdit?.(commentEditRequest(comment.id, rich ? sanitized : raw))}>
                  edit
                </button>
                <button
                  type="button"
                  data-comment-delete={String(comment.id)}
                  onClick={() => onDelete?.(comment.id)}>
                  delete
                </button>
              </div>
            )
          })}
        </div>
      ) : null}
      {treeErrors.length > 0 ? (
        <div role="alert">
          {treeErrors.map((error) => (
            <p key={`${error.code}-${error.id}`}>{formatCommentTreeError(error, labels)}</p>
          ))}
        </div>
      ) : null}
      {composer}
      {resolvedNodes.length === 0 ? (
        <div className={commentThreadEmptyClasses}>
          <svg
            aria-hidden="true"
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
            {resolveLocaleText(labels.emptyText, emptyText)}
          </Text>
        </div>
      ) : windowed ? (
        <VirtualList
          ref={listRef}
          data-tiger-comment-window=""
          itemCount={flatComments.length}
          estimatedItemHeight={COMPOSITE_LIST_ESTIMATED_ITEM_HEIGHT}
          height={COMPOSITE_LIST_VIEWPORT}
          getItemKey={(index) => String(flatComments[index]?.node.id ?? index)}
          renderItem={({ index }) => {
            const entry = flatComments[index]
            return entry
              ? renderNode(
                  entry.node,
                  entry.depth,
                  entry.depth === 1 && flatComments.slice(0, index).some((item) => item.depth === 1)
                )
              : null
          }}
          role="presentation"
          footer={pageSentinel}
        />
      ) : (
        <>
          <div
            role="feed"
            aria-label={
              divProps['aria-label'] ??
              (divProps['aria-labelledby'] ? undefined : labels.listAriaLabel)
            }>
            {flatComments.map(({ node, depth }, index) =>
              renderNode(
                node,
                depth,
                depth === 1 && flatComments.slice(0, index).some((item) => item.depth === 1)
              )
            )}
          </div>
          {pageSentinel}
        </>
      )}
    </div>
  )
}

export default CommentThread
