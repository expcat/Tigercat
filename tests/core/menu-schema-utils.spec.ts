/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  filterMenuByPermission,
  menuSchemaToMenuItems,
  type MenuSchema,
  type MenuSchemaNode
} from '@expcat/tigercat-core'

const allow =
  (...codes: string[]) =>
  (code: string): boolean =>
    codes.includes(code)

const denyAll = (): boolean => false

function node(partial: MenuSchemaNode): MenuSchemaNode {
  return partial
}

describe('filterMenuByPermission', () => {
  it('keeps unrestricted nodes and drops nodes missing a required permission', () => {
    const schema: MenuSchema = [
      node({ key: 'home', label: 'Home', path: '/home' }),
      node({ key: 'users', label: 'Users', path: '/users', permission: 'user:list' }),
      node({ key: 'secret', label: 'Secret', path: '/secret', permission: 'secret:read' })
    ]

    const filtered = filterMenuByPermission(schema, allow('user:list'))

    expect(filtered.map((item) => item.key)).toEqual(['home', 'users'])
  })

  it('requires every code when permission is an array', () => {
    const schema: MenuSchema = [
      node({ key: 'a', label: 'A', permission: ['user:list', 'user:edit'] }),
      node({ key: 'b', label: 'B', permission: ['user:list'] }),
      node({ key: 'empty', label: 'Empty', permission: [] })
    ]

    expect(filterMenuByPermission(schema, allow('user:list')).map((item) => item.key)).toEqual([
      'b',
      'empty'
    ])
    expect(
      filterMenuByPermission(schema, allow('user:list', 'user:edit')).map((item) => item.key)
    ).toEqual(['a', 'b', 'empty'])
  })

  it('prunes empty groups after children are unauthorized', () => {
    const schema: MenuSchema = [
      node({
        key: 'system',
        type: 'group',
        label: 'System',
        children: [
          node({ key: 'roles', label: 'Roles', permission: 'role:list' }),
          node({ key: 'logs', label: 'Logs', permission: 'log:list' })
        ]
      }),
      node({ key: 'dashboard', label: 'Dashboard' })
    ]

    const filtered = filterMenuByPermission(schema, allow('none'))

    expect(filtered.map((item) => item.key)).toEqual(['dashboard'])
  })

  it('prunes a group that only retains dividers', () => {
    const schema: MenuSchema = [
      node({
        key: 'ops',
        type: 'group',
        label: 'Ops',
        children: [
          node({ key: 'div-1', type: 'divider' }),
          node({ key: 'jobs', label: 'Jobs', permission: 'job:list' }),
          node({ key: 'div-2', type: 'divider' })
        ]
      })
    ]

    expect(filterMenuByPermission(schema, denyAll)).toEqual([])
  })

  it('omits hideInMenu nodes from menu output and promotes visible children', () => {
    const schema: MenuSchema = [
      node({
        key: 'layout',
        path: '/app',
        hideInMenu: true,
        children: [
          node({ key: 'workbench', label: 'Workbench', path: '/app/workbench' }),
          node({ key: 'hidden-page', label: 'Hidden', path: '/app/hidden', hideInMenu: true })
        ]
      }),
      node({ key: 'about', label: 'About', hideInMenu: true, path: '/about' })
    ]

    const filtered = filterMenuByPermission(schema, allow())

    expect(filtered.map((item) => item.key)).toEqual(['workbench'])
  })

  it('filters nested trees and keeps authorized subtrees', () => {
    const schema: MenuSchema = [
      node({
        key: 'system',
        label: 'System',
        children: [
          node({
            key: 'user',
            label: 'User',
            permission: 'user:menu',
            children: [
              node({ key: 'user-list', label: 'List', permission: 'user:list' }),
              node({ key: 'user-audit', label: 'Audit', permission: 'user:audit' })
            ]
          }),
          node({
            key: 'dept',
            label: 'Dept',
            permission: 'dept:menu',
            children: [node({ key: 'dept-list', label: 'List', permission: 'dept:list' })]
          })
        ]
      })
    ]

    const filtered = filterMenuByPermission(schema, allow('user:menu', 'user:list'))

    expect(filtered).toEqual([
      {
        key: 'system',
        label: 'System',
        children: [
          {
            key: 'user',
            label: 'User',
            permission: 'user:menu',
            children: [{ key: 'user-list', label: 'List', permission: 'user:list' }]
          }
        ]
      }
    ])
  })

  it('drops an unauthorized parent including its children', () => {
    const schema: MenuSchema = [
      node({
        key: 'admin',
        label: 'Admin',
        permission: 'admin:menu',
        children: [node({ key: 'admin-users', label: 'Users' })]
      })
    ]

    expect(filterMenuByPermission(schema, allow())).toEqual([])
  })

  it('keeps dividers and groups that still have visible items', () => {
    const schema: MenuSchema = [
      node({
        key: 'main',
        type: 'group',
        label: 'Main',
        children: [
          node({ key: 'home', label: 'Home' }),
          node({ key: 'split', type: 'divider' }),
          node({ key: 'settings', label: 'Settings', permission: 'settings:read' })
        ]
      })
    ]

    const filtered = filterMenuByPermission(schema, allow())

    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.type).toBe('group')
    expect(filtered[0]?.children?.map((item) => item.key)).toEqual(['home', 'split'])
  })

  it('prunes empty submenus after nested filtering', () => {
    const schema: MenuSchema = [
      node({
        key: 'reports',
        label: 'Reports',
        children: [node({ key: 'finance', label: 'Finance', permission: 'report:finance' })]
      }),
      node({ key: 'inbox', label: 'Inbox' })
    ]

    expect(filterMenuByPermission(schema, allow()).map((item) => item.key)).toEqual(['inbox'])
  })

  it('does not mutate the input tree', () => {
    const child = node({ key: 'users', label: 'Users', permission: 'user:list' })
    const schema: MenuSchema = [
      node({
        key: 'system',
        type: 'group',
        label: 'System',
        children: [child]
      })
    ]

    filterMenuByPermission(schema, denyAll)

    expect(schema).toHaveLength(1)
    expect(schema[0]?.children).toEqual([child])
  })
})

describe('menuSchemaToMenuItems', () => {
  it('maps schema fields onto MenuItem and keeps icon as a string name', () => {
    const items = menuSchemaToMenuItems([
      node({
        key: 'users',
        label: 'Users',
        icon: 'user',
        path: '/users',
        children: [node({ key: 'profile', label: 'Profile', href: 'https://example.test/me' })]
      })
    ])

    expect(items).toEqual([
      {
        key: 'users',
        label: 'Users',
        icon: 'user',
        href: '/users',
        children: [{ key: 'profile', label: 'Profile', href: 'https://example.test/me' }]
      }
    ])
    expect(typeof items[0]?.icon).toBe('string')
  })

  it('prefers href over path and copies group label onto title', () => {
    const items = menuSchemaToMenuItems([
      node({
        key: 'docs',
        type: 'group',
        label: 'Docs',
        children: [
          node({
            key: 'guide',
            label: 'Guide',
            path: '/guide',
            href: 'https://docs.example/guide'
          }),
          node({ key: 'split', type: 'divider' })
        ]
      })
    ])

    expect(items).toEqual([
      {
        key: 'docs',
        type: 'group',
        label: 'Docs',
        title: 'Docs',
        children: [
          { key: 'guide', label: 'Guide', href: 'https://docs.example/guide' },
          { key: 'split', type: 'divider' }
        ]
      }
    ])
  })

  it('converts a filtered nested schema for menu output', () => {
    const schema: MenuSchema = [
      node({
        key: 'root',
        hideInMenu: true,
        children: [
          node({
            key: 'nav',
            type: 'group',
            label: 'Nav',
            children: [
              node({ key: 'home', label: 'Home', icon: 'home', path: '/' }),
              node({ key: 'admin', label: 'Admin', permission: 'admin:menu' })
            ]
          })
        ]
      })
    ]

    const items = menuSchemaToMenuItems(filterMenuByPermission(schema, allow()))

    expect(items).toEqual([
      {
        key: 'nav',
        type: 'group',
        label: 'Nav',
        title: 'Nav',
        children: [{ key: 'home', label: 'Home', icon: 'home', href: '/' }]
      }
    ])
  })
})
