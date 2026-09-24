import type { CommentNode } from '../types/comment-thread'

export const EMPTY_COMMENT_NODES: CommentNode[] = []

export interface CommentLikeState {
  liked: boolean
  likes: number
}

export type CommentLikeOverlay = Map<string | number, CommentLikeState>

type CommentLikeNode = Pick<CommentNode, 'id' | 'liked' | 'likes'>

export function commentIdKey(id: string | number): string {
  return String(id)
}

export const resolveCommentLikeState = (
  node: CommentLikeNode,
  overlay?: ReadonlyMap<string | number, CommentLikeState> | null
): CommentLikeState => {
  const nodeState = { liked: !!node.liked, likes: node.likes ?? 0 }
  const entry = overlay?.get(commentIdKey(node.id)) ?? overlay?.get(node.id)
  if (!entry) return nodeState
  if (entry.liked === nodeState.liked && entry.likes === nodeState.likes) return nodeState
  return { liked: entry.liked, likes: entry.likes }
}

export const nextCommentLikeState = (
  node: CommentLikeNode,
  overlay?: ReadonlyMap<string | number, CommentLikeState> | null
): CommentLikeState => {
  const current = resolveCommentLikeState(node, overlay)
  const liked = !current.liked
  return { liked, likes: Math.max(0, current.likes + (liked ? 1 : -1)) }
}

export const writeCommentLikeOverlay = (
  overlay: ReadonlyMap<string | number, CommentLikeState> | null | undefined,
  id: string | number,
  state: CommentLikeState
): CommentLikeOverlay => {
  const next = new Map<string | number, CommentLikeState>()
  overlay?.forEach((value, key) => {
    next.set(commentIdKey(key), value)
  })
  next.set(commentIdKey(id), { liked: state.liked, likes: state.likes })
  return next
}

export type CommentTreeErrorCode = 'duplicate-id' | 'cycle'

export interface CommentTreeError {
  code: CommentTreeErrorCode
  id: string
}

export interface CommentTreeBuild {
  roots: CommentNode[]
  errors: CommentTreeError[]
}

/**
 * `nodes` once passed (including `[]`) is the tree source. Flat `items` are
 * used only when `nodes == null`. Flattened items drop any nested `children`
 * and rebuild from `parentId`.
 */
export const resolveCommentNodes = (
  nodes?: CommentNode[] | null,
  items?: CommentNode[]
): CommentTreeBuild => {
  if (nodes != null) return { roots: nodes, errors: [] }
  return buildCommentTree(items ?? EMPTY_COMMENT_NODES)
}

export const buildCommentTree = (items: CommentNode[] = []): CommentTreeBuild => {
  if (!items || items.length === 0) return { roots: [], errors: [] }

  const nodeMap = new Map<string, CommentNode>()
  const order: string[] = []
  const errors: CommentTreeError[] = []

  items.forEach((item) => {
    const key = commentIdKey(item.id)
    if (nodeMap.has(key)) {
      errors.push({ code: 'duplicate-id', id: key })
      return
    }
    nodeMap.set(key, { ...item, children: [] })
    order.push(key)
  })

  const parentOf = new Map<string, string | null>()
  order.forEach((key) => {
    const node = nodeMap.get(key)
    if (!node) return
    if (node.parentId == null || commentIdKey(node.parentId) === key) {
      parentOf.set(key, null)
      return
    }
    const parentKey = commentIdKey(node.parentId)
    parentOf.set(key, nodeMap.has(parentKey) ? parentKey : null)
  })

  order.forEach((start) => {
    const seen = new Set<string>()
    let current: string | null = start
    while (current) {
      if (seen.has(current)) {
        errors.push({ code: 'cycle', id: current })
        parentOf.set(current, null)
        break
      }
      seen.add(current)
      current = parentOf.get(current) ?? null
    }
  })

  const roots: CommentNode[] = []
  order.forEach((key) => {
    const node = nodeMap.get(key)
    if (!node) return
    const parentKey = parentOf.get(key)
    const parent = parentKey ? nodeMap.get(parentKey) : undefined
    if (!parent) {
      roots.push(node)
      return
    }
    if (!parent.children) parent.children = []
    parent.children.push(node)
  })

  return { roots, errors }
}

export const clipCommentTreeDepth = (
  nodes: CommentNode[] = [],
  maxDepth = 3,
  clippedIds?: Set<string | number>
): CommentNode[] => {
  if (!nodes || nodes.length === 0) return []
  if (maxDepth <= 0) return []

  const cloneNode = (node: CommentNode, depth: number): CommentNode => {
    const next: CommentNode = { ...node }
    if (node.children && node.children.length > 0 && depth < maxDepth) {
      next.children = node.children.map((child) => cloneNode(child, depth + 1))
    } else {
      if (node.children && node.children.length > 0) clippedIds?.add(node.id)
      next.children = []
    }
    return next
  }

  return nodes.map((node) => cloneNode(node, 1))
}

export type CommentLoadMoreKind = 'remaining' | 'page' | null

export interface CommentRepliesView {
  visible: CommentNode[]
  remaining: number
  loadMoreKind: CommentLoadMoreKind
}

/**
 * Local remaining replies are revealed `maxReplies` at a time. True paging
 * (`onLoadMore`) is only offered after every local child is visible.
 */
export function getCommentRepliesView(
  children: CommentNode[] | undefined,
  options: {
    maxReplies: number
    revealedCount: number
    hasLoadMoreHandler: boolean
  }
): CommentRepliesView {
  const list = children ?? EMPTY_COMMENT_NODES
  const revealed = Math.max(options.maxReplies, options.revealedCount)
  const visible = list.slice(0, revealed)
  const remaining = Math.max(0, list.length - visible.length)
  if (remaining > 0) return { visible, remaining, loadMoreKind: 'remaining' }
  if (options.hasLoadMoreHandler) return { visible, remaining: 0, loadMoreKind: 'page' }
  return { visible, remaining: 0, loadMoreKind: null }
}

export function nextCommentRevealedCount(
  current: number,
  maxReplies: number,
  childCount: number
): number {
  const start = Math.max(maxReplies, current)
  return Math.min(childCount, start + Math.max(1, maxReplies))
}

export function canSubmitCommentReply(options: {
  value?: string | null
  inFlight?: boolean
  hasReplyHandler?: boolean
}): boolean {
  if (options.inFlight || options.hasReplyHandler === false) return false
  return String(options.value ?? '').trim().length > 0
}

/** A node at `maxDepth` has no reply control. Depth is 1-based. */
export function commentNodeAcceptsReply(depth: number, maxDepth: number): boolean {
  return depth < maxDepth
}

export function formatCommentTreeError(
  error: CommentTreeError,
  labels: { duplicateIdText?: string; cycleText?: string }
): string {
  const template =
    error.code === 'duplicate-id'
      ? (labels.duplicateIdText ?? 'Duplicate comment id {id}')
      : (labels.cycleText ?? 'Comment cycle at {id}')
  return template.split('{id}').join(error.id)
}
