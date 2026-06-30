/**
 * CommentThread composite component types
 */

import type { TagVariant } from './tag'
import type { ButtonVariant } from './button'

/**
 * Comment user info
 */
export interface CommentUser {
  /**
   * User id
   */
  id?: string | number
  /**
   * Display name
   */
  name?: string
  /**
   * Avatar image url
   */
  avatar?: string
  /**
   * Optional title or role
   */
  title?: string
}

/**
 * Comment tag definition
 */
export interface CommentTag {
  /**
   * Tag label
   */
  label: string
  /**
   * Tag variant
   * @default 'default'
   */
  variant?: TagVariant
}

/**
 * Comment action definition
 */
export interface CommentAction {
  /**
   * Action key
   */
  key?: string | number
  /**
   * Action label
   */
  label: string
  /**
   * Button variant
   * @default 'ghost'
   */
  variant?: ButtonVariant
  /**
   * Whether the action is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Click handler
   */
  onClick?: (node: CommentNode, action: CommentAction) => void
}

/**
 * Comment node definition
 */
export interface CommentNode {
  /**
   * Unique comment id
   */
  id: string | number
  /**
   * Parent id (flat data)
   */
  parentId?: string | number
  /**
   * Comment content
   */
  content: string | number
  /**
   * Comment user
   */
  user?: CommentUser
  /**
   * Comment time
   */
  time?: string | number | Date
  /**
   * Like count
   */
  likes?: number
  /**
   * Whether liked
   */
  liked?: boolean
  /**
   * Single tag
   */
  tag?: CommentTag
  /**
   * Additional tags
   */
  tags?: CommentTag[]
  /**
   * Custom actions
   */
  actions?: CommentAction[]
  /**
   * Nested replies
   */
  children?: CommentNode[]
  /**
   * Custom metadata
   */
  meta?: Record<string, unknown>
  /**
   * Custom data
   */
  [key: string]: unknown
}

/**
 * Comment thread props interface
 */
export interface CommentThreadProps {
  /**
   * Comment nodes (tree)
   */
  nodes?: CommentNode[]
  /**
   * Comment items (flat list)
   */
  items?: CommentNode[]
  /**
   * Maximum nesting depth
   * @default 3
   */
  maxDepth?: number
  /**
   * Maximum replies to show per node
   * @default 3
   */
  maxReplies?: number
  /**
   * Default expanded reply keys
   */
  defaultExpandedKeys?: Array<string | number>
  /**
   * Expanded reply keys (controlled)
   */
  expandedKeys?: Array<string | number>
  /**
   * Empty state text
   */
  emptyText?: string
  /**
   * Reply input placeholder
   */
  replyPlaceholder?: string
  /**
   * Reply submit button text
   */
  replyButtonText?: string
  /**
   * Reply cancel button text
   */
  cancelReplyText?: string
  /**
   * Like button text
   */
  likeText?: string
  /**
   * Liked button text
   */
  likedText?: string
  /**
   * Reply action text
   */
  replyText?: string
  /**
   * More action text
   */
  moreText?: string
  /**
   * Load more text
   */
  loadMoreText?: string
  /**
   * Show avatar
   * @default true
   */
  showAvatar?: boolean
  /**
   * Show divider
   * @default true
   */
  showDivider?: boolean
  /**
   * Show like action
   * @default true
   */
  showLike?: boolean
  /**
   * Show reply action
   * @default true
   */
  showReply?: boolean
  /**
   * Show more action
   * @default true
   */
  showMore?: boolean
  /**
   * Like callback
   */
  onLike?: (node: CommentNode, liked: boolean) => void
  /**
   * Reply submit callback
   */
  onReply?: (node: CommentNode, value: string) => void
  /**
   * More action callback
   */
  onMore?: (node: CommentNode) => void
  /**
   * Custom action callback
   */
  onAction?: (node: CommentNode, action: CommentAction) => void
  /**
   * Expanded keys change callback
   */
  onExpandedChange?: (keys: Array<string | number>) => void
  /**
   * Load more callback
   */
  onLoadMore?: (node: CommentNode) => void
}
