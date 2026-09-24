/**
 * Framework-agnostic helpers for backend-style dynamic menus.
 * Filter and convert {@link MenuSchemaNode} trees onto existing {@link MenuItem}
 * or framework-agnostic {@link MenuRouteRecord} trees.
 */

import type { MenuItem, MenuRouteMeta, MenuRouteRecord, MenuSchemaNode } from '../types/menu'
import { isInternalLinkPath, resolveLinkHref } from './link-utils'

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

function asLeafSchemaNode(node: MenuSchemaNode): MenuSchemaNode {
  if (!node.children) return { ...node }
  const next = { ...node }
  delete next.children
  return next
}

function shouldEmitFlatMenuLeaf(node: MenuSchemaNode): boolean {
  if (isGroupNode(node) || isDividerNode(node) || node.hideInMenu) return false
  return node.label != null || node.path != null || node.href != null
}

/**
 * Drop unauthorized nodes, omit `hideInMenu` nodes from menu output, flatten
 * `flatMenu` nodes, and prune empty groups / submenus (including groups that
 * only retain dividers).
 *
 * Hidden nodes are not rendered, but their visible descendants are promoted so
 * layout-only parents still contribute children. `flatMenu` keeps a visible
 * parent as a leaf and promotes children beside it. A parent that fails
 * permission drops its whole subtree.
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

    if (node.flatMenu) {
      if (shouldEmitFlatMenuLeaf(node)) result.push(asLeafSchemaNode(node))
      if (filteredChildren) result.push(...filteredChildren)
      continue
    }

    if (shouldPruneEmptyContainer(node, filteredChildren)) continue

    result.push(withFilteredChildren(node, filteredChildren))
  }

  return result
}

function safeInternalPath(value: string | undefined): string | undefined {
  if (!isInternalLinkPath(value)) return undefined
  return value!.trim()
}

/**
 * Menu links use `href` for an external or explicit address.
 * `path` is only a site-internal route and is not treated as an external URL.
 */
function schemaMenuHref(node: MenuSchemaNode): string | undefined {
  if (node.href != null) return resolveLinkHref(node.href)
  return safeInternalPath(node.path)
}

function schemaNodeToMenuItem(node: MenuSchemaNode): MenuItem {
  const item: MenuItem = { key: node.key }
  if (node.type != null) item.type = node.type
  if (node.label != null) item.label = node.label
  if (isGroupNode(node) && node.label != null) item.title = node.label
  if (node.icon != null) item.icon = node.icon
  const href = schemaMenuHref(node)
  if (href != null) item.href = href
  if (node.children && node.children.length > 0) {
    item.children = menuSchemaToMenuItems(node.children)
  }
  if (node.badge != null) item.badge = node.badge
  return item
}

/**
 * Convert schema nodes to {@link MenuItem} trees.
 * Icon stays a registered name string. An internal `path` becomes the menu
 * href only when `href` is omitted. An explicit `href` is gated on its own
 * and does not fall back to `path` when it is rejected.
 * Schema-only fields (`permission`, `hideInMenu`, `hideInBreadcrumb`, `flatMenu`,
 * `iframeSrc`) are not copied onto {@link MenuItem}. `badge` is copied so the
 * menu can render it. Permission filtering and route records stay pure.
 */
export function menuSchemaToMenuItems(nodes: readonly MenuSchemaNode[]): MenuItem[] {
  return nodes.map(schemaNodeToMenuItem)
}

function isNonEmptyString(value: string | undefined): value is string {
  return value != null && value !== ''
}

function isRoutableNode(node: MenuSchemaNode): boolean {
  if (isDividerNode(node) || isGroupNode(node)) return false
  return safeInternalPath(node.path) != null || resolveLinkHref(node.iframeSrc) != null
}

function schemaNodeToRouteMeta(node: MenuSchemaNode): MenuRouteMeta {
  const meta: MenuRouteMeta = { key: node.key }
  if (node.label != null) meta.title = node.label
  if (node.icon != null) meta.icon = node.icon
  const href = resolveLinkHref(node.href)
  if (href != null) meta.href = href
  if (node.permission != null) meta.permission = node.permission
  if (node.hideInMenu != null) meta.hideInMenu = node.hideInMenu
  if (node.hideInBreadcrumb != null) meta.hideInBreadcrumb = node.hideInBreadcrumb
  if (node.flatMenu != null) meta.flatMenu = node.flatMenu
  if (node.badge != null) meta.badge = node.badge
  const iframeSrc = resolveLinkHref(node.iframeSrc)
  if (iframeSrc != null) meta.iframeSrc = iframeSrc
  if (node.type != null) meta.type = node.type
  return meta
}

function schemaNodeToRouteRecord(
  node: MenuSchemaNode,
  children: MenuRouteRecord[] | undefined
): MenuRouteRecord {
  const record: MenuRouteRecord = {
    name: node.key,
    path: safeInternalPath(node.path) ?? '',
    meta: schemaNodeToRouteMeta(node)
  }
  if (children && children.length > 0) record.children = children
  return record
}

/**
 * Convert schema nodes to framework-agnostic route records.
 *
 * Pure: does not call `addRoute` or touch a router. The host binds `name` /
 * `path` / `meta` to vue-router, react-router, or a pageMap.
 *
 * - Dividers and groups are not records; their visible children are lifted.
 * - `hideInMenu` nodes are still emitted when they are routable.
 * - `flatMenu` emits the parent as a leaf (when routable) and lifts children.
 * - Path-less nodes (except iframe-only) lift children instead of nesting.
 * - Href-only nodes without `path` / `iframeSrc` are menu links, not records.
 * - When `hasPermission` is passed, unauthorized nodes drop their subtree.
 */
export function schemaToRouteRecords(
  nodes: readonly MenuSchemaNode[],
  hasPermission?: MenuPermissionChecker
): MenuRouteRecord[] {
  const result: MenuRouteRecord[] = []

  for (const node of nodes) {
    if (hasPermission && !nodeAllowedByPermission(node, hasPermission)) continue
    if (isDividerNode(node)) continue

    const childRecords = node.children ? schemaToRouteRecords(node.children, hasPermission) : []

    const liftChildren = isGroupNode(node) || node.flatMenu || !isRoutableNode(node)
    if (liftChildren) {
      if (isRoutableNode(node)) result.push(schemaNodeToRouteRecord(node, undefined))
      result.push(...childRecords)
      continue
    }

    result.push(schemaNodeToRouteRecord(node, childRecords.length > 0 ? childRecords : undefined))
  }

  return result
}
