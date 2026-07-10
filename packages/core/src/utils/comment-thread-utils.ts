import type { CommentNode } from '../types/composite'

// Visual recipes stay local to CommentThread and are shared by its two bindings.
export const commentThreadButtonBaseClasses =
  'tiger-motion-aware px-2 py-0.5 h-auto min-h-0 text-xs rounded-[var(--tiger-radius-md,0.5rem)] [transition:var(--tiger-transition-base,all_200ms_cubic-bezier(0.4,0,0.2,1))]'
export const commentThreadActionButtonClasses = `${commentThreadButtonBaseClasses} text-[var(--tiger-text-muted,#6b7280)] font-medium flex items-center gap-1.5`
export const commentThreadPrimaryButtonClasses = `${commentThreadButtonBaseClasses} text-[var(--tiger-primary,#2563eb)] hover:text-[var(--tiger-primary-hover,#1d4ed8)] font-semibold hover:bg-[var(--tiger-outline-bg-hover,#eff6ff)]`

export const commentThreadLikeButtonClasses =
  'hover:text-[var(--tiger-primary,#2563eb)] hover:bg-[var(--tiger-outline-bg-hover,#eff6ff)]'
export const commentThreadLikedButtonClasses =
  'text-[var(--tiger-primary,#2563eb)] bg-[var(--tiger-outline-bg-hover,#eff6ff)] font-semibold border-[var(--tiger-primary,#2563eb)]/40'
export const commentThreadReplyButtonClasses =
  'hover:text-[var(--tiger-success,#16a34a)] hover:bg-[var(--tiger-surface-muted,#f9fafb)]'
export const commentThreadNeutralButtonClasses =
  'hover:text-[var(--tiger-text,#111827)] hover:bg-[var(--tiger-surface-muted,#f3f4f6)]'
export const commentThreadLikeIconClasses =
  'tiger-motion-aware w-3.5 h-3.5 transition-transform active:scale-125'

export const commentThreadDividerClasses = 'border-b border-[var(--tiger-border,#e5e7eb)]'
export const commentThreadAvatarClasses =
  'tiger-motion-aware shrink-0 mt-0.5 ring-1 ring-[var(--tiger-border,#e5e7eb)] shadow-sm [transition:var(--tiger-transition-base,all_200ms_cubic-bezier(0.4,0,0.2,1))] hover:scale-105'
export const commentThreadAuthorClasses =
  'tiger-motion-aware text-[var(--tiger-text,#111827)] hover:text-[var(--tiger-primary,#2563eb)] transition-colors cursor-pointer'
export const commentThreadUserTitleClasses =
  'bg-[var(--tiger-surface-muted,#f3f4f6)] px-1.5 py-0.5 rounded text-[var(--tiger-text-muted,#6b7280)] font-medium'
export const commentThreadTimeClasses =
  'ml-auto text-[var(--tiger-text-muted,#6b7280)] font-normal'
export const commentThreadContentClasses =
  'text-sm text-[var(--tiger-text-secondary,#4b5563)] leading-relaxed break-words mt-2 mb-3 pr-2'

export const commentThreadReplyEditorClasses =
  'tiger-motion-aware mt-3 space-y-3 bg-[var(--tiger-surface-muted,#f9fafb)] border border-[var(--tiger-border,#e5e7eb)] p-4 rounded-[var(--tiger-radius-lg,0.75rem)] shadow-sm [transition:var(--tiger-transition-base,all_200ms_cubic-bezier(0.4,0,0.2,1))]'
export const commentThreadReplyTextareaClasses =
  'tiger-motion-aware bg-[var(--tiger-surface,#ffffff)] border-[var(--tiger-border,#d1d5db)] focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)]/20 focus:border-[var(--tiger-primary,#2563eb)] rounded-[var(--tiger-radius-md,0.5rem)] shadow-inner [transition:var(--tiger-transition-base,all_200ms_cubic-bezier(0.4,0,0.2,1))]'
export const commentThreadCancelButtonClasses =
  'tiger-motion-aware px-3 py-1.5 text-xs text-[var(--tiger-text-muted,#6b7280)] hover:text-[var(--tiger-text,#111827)] rounded-[var(--tiger-radius-md,0.5rem)] transition-colors'
export const commentThreadSubmitButtonClasses =
  'tiger-motion-aware px-3 py-1.5 text-xs font-semibold shadow-sm hover:shadow rounded-[var(--tiger-radius-md,0.5rem)] [transition:var(--tiger-transition-base,all_200ms_cubic-bezier(0.4,0,0.2,1))]'
export const commentThreadRepliesClasses =
  'tiger-motion-aware mt-4 ml-1 pl-4 border-l-2 border-[var(--tiger-border,#e5e7eb)] hover:border-[var(--tiger-primary,#2563eb)]/40 space-y-4 transition-colors'

export const commentThreadEmptyClasses =
  'tiger-motion-aware flex flex-col items-center justify-center border border-dashed border-[var(--tiger-border,#d1d5db)] rounded-[var(--tiger-radius-lg,0.75rem)] py-12 px-4 bg-[var(--tiger-surface-muted,#f9fafb)] transition-colors'
export const commentThreadEmptyIconClasses =
  'w-10 h-10 text-[var(--tiger-text-muted,#9ca3af)] mb-3'

export const buildCommentTree = (items: CommentNode[] = []): CommentNode[] => {
  if (!items || items.length === 0) return []

  const nodeMap = new Map<string | number, CommentNode>()
  const order: Array<string | number> = []

  items.forEach((item) => {
    nodeMap.set(item.id, {
      ...item,
      children: []
    })
    order.push(item.id)
  })

  const roots: CommentNode[] = []

  order.forEach((id) => {
    const node = nodeMap.get(id)
    if (!node) return

    if (node.parentId === undefined || node.parentId === null) {
      roots.push(node)
      return
    }

    const parent = nodeMap.get(node.parentId)
    if (!parent) {
      roots.push(node)
      return
    }

    if (!parent.children) parent.children = []
    parent.children.push(node)
  })

  return roots
}

export const clipCommentTreeDepth = (nodes: CommentNode[] = [], maxDepth = 3): CommentNode[] => {
  if (!nodes || nodes.length === 0) return []
  if (maxDepth <= 0) return []

  const cloneNode = (node: CommentNode, depth: number): CommentNode => {
    const next: CommentNode = { ...node }
    if (node.children && node.children.length > 0 && depth < maxDepth) {
      next.children = node.children.map((child) => cloneNode(child, depth + 1))
    } else {
      next.children = []
    }
    return next
  }

  return nodes.map((node) => cloneNode(node, 1))
}
