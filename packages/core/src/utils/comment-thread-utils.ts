import type { CommentNode } from '../types/composite'

export const buildCommentTree = (items: CommentNode[] = []): CommentNode[] => {
  if (!items || items.length === 0) return []

  const nodeMap = new Map<string | number, CommentNode>()
  const order: Array<string | number> = []

  items.forEach((item) => {
    nodeMap.set(item.id, {
      ...item,
      children: item.children ? [...item.children] : []
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
