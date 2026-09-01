import type { CommentNode } from '../types/composite'

export const EMPTY_COMMENT_NODES: CommentNode[] = []

export interface CommentLikeState {
  liked: boolean
  likes: number
}

export type CommentLikeOverlay = Map<string | number, CommentLikeState>

type CommentLikeNode = Pick<CommentNode, 'id' | 'liked' | 'likes'>

export const resolveCommentLikeState = (
  node: CommentLikeNode,
  overlay?: ReadonlyMap<string | number, CommentLikeState> | null
): CommentLikeState => {
  const nodeState = { liked: !!node.liked, likes: node.likes ?? 0 }
  const entry = overlay?.get(node.id)
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
  const next = new Map(overlay ?? undefined)
  next.set(id, { liked: state.liked, likes: state.likes })
  return next
}

/**
 * `nodes` once passed (including `[]`) is the tree source. Flat `items` are
 * used only when `nodes == null`. Flattened items drop any nested `children`
 * and rebuild from `parentId`.
 */
export const resolveCommentNodes = (
  nodes?: CommentNode[] | null,
  items?: CommentNode[]
): CommentNode[] => {
  if (nodes != null) return nodes
  return buildCommentTree(items ?? EMPTY_COMMENT_NODES)
}

export const buildCommentTree = (items: CommentNode[] = []): CommentNode[] => {
  if (!items || items.length === 0) return []

  const nodeMap = new Map<string | number, CommentNode>()
  const order: Array<string | number> = []

  items.forEach((item) => {
    nodeMap.set(item.id, {
      ...item,
      children: []
    })
    if (!order.includes(item.id)) order.push(item.id)
  })

  const roots: CommentNode[] = []

  order.forEach((id) => {
    const node = nodeMap.get(id)
    if (!node) return

    if (node.parentId === undefined || node.parentId === null || node.parentId === node.id) {
      roots.push(node)
      return
    }

    const parent = nodeMap.get(node.parentId)
    if (!parent || parent === node) {
      roots.push(node)
      return
    }

    if (!parent.children) parent.children = []
    parent.children.push(node)
  })

  return roots
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

export function canSubmitCommentReply(value: string, inFlight: boolean): boolean {
  return !inFlight && value.trim().length > 0
}
