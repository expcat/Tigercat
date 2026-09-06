/**
 * Framework-agnostic helpers for backend-style dynamic menus.
 * Filter and convert {@link MenuSchemaNode} trees onto existing {@link MenuItem}.
 */

import type { MenuItem, MenuSchemaNode } from '../types/menu'

export type MenuPermissionChecker = (code: string) => boolean

function permissionCodes(permission: MenuSchemaNode['permission']): string[] {
  if (permission == null) return []
  const codes = Array.isArray(permission) ? permission : [permission]
  return codes.filter((code) => code !== '')
}

function nodeAllowedByPermission(
  node: MenuSchemaNode,
  hasPermission: MenuPermissionChecker
): boolean {
  const codes = permissionCodes(node.permission)
  if (codes.length === 0) return true
  return codes.every((code) => hasPermission(code))
}

function isGroupNode(node: MenuSchemaNode): boolean {
  return node.type === 'group'
}

function isDividerNode(node: MenuSchemaNode): boolean {
  return node.type === 'divider'
}

function hasMenuContent(nodes: MenuSchemaNode[]): boolean {
  return nodes.some((node) => !isDividerNode(node))
}

function shouldPruneEmptyContainer(
  node: MenuSchemaNode,
  children: MenuSchemaNode[] | undefined
): boolean {
  if (isDividerNode(node)) return false
  if (isGroupNode(node)) return !children || !hasMenuContent(children)
  if (node.children && node.children.length > 0) {
    return !children || !hasMenuContent(children)
  }
  return false
}

function withFilteredChildren(
  node: MenuSchemaNode,
  children: MenuSchemaNode[] | undefined
): MenuSchemaNode {
  if (!node.children) return { ...node }
  return { ...node, children: children ?? [] }
}

/**
 * Drop unauthorized nodes, omit `hideInMenu` nodes from menu output, and prune
 * empty groups / submenus (including groups that only retain dividers).
 *
 * Hidden nodes are not rendered, but their visible descendants are promoted so
 * layout-only parents still contribute children. A parent that fails permission
 * drops its whole subtree.
 *
 * When `permission` is an array, every remaining code must pass.
 */
export function filterMenuByPermission(
  nodes: readonly MenuSchemaNode[],
  hasPermission: MenuPermissionChecker
): MenuSchemaNode[] {
  const result: MenuSchemaNode[] = []

  for (const node of nodes) {
    if (!nodeAllowedByPermission(node, hasPermission)) continue

    const filteredChildren = node.children
      ? filterMenuByPermission(node.children, hasPermission)
      : undefined

    if (node.hideInMenu) {
      if (filteredChildren) result.push(...filteredChildren)
      continue
    }

    if (shouldPruneEmptyContainer(node, filteredChildren)) continue

    result.push(withFilteredChildren(node, filteredChildren))
  }

  return result
}

function schemaHref(node: MenuSchemaNode): string | undefined {
  return node.href ?? node.path
}

function schemaNodeToMenuItem(node: MenuSchemaNode): MenuItem {
  const item: MenuItem = { key: node.key }
  if (node.type != null) item.type = node.type
  if (node.label != null) item.label = node.label
  if (isGroupNode(node) && node.label != null) item.title = node.label
  if (node.icon != null) item.icon = node.icon
  const href = schemaHref(node)
  if (href != null) item.href = href
  if (node.children && node.children.length > 0) {
    item.children = menuSchemaToMenuItems(node.children)
  }
  return item
}

/**
 * Convert schema nodes to {@link MenuItem} trees.
 * Icon stays a registered name string; `path` maps to `href` when `href` is omitted.
 */
export function menuSchemaToMenuItems(nodes: readonly MenuSchemaNode[]): MenuItem[] {
  return nodes.map(schemaNodeToMenuItem)
}
