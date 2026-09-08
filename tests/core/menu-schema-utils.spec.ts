/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  filterMenuByPermission,
  menuSchemaToMenuItems,
  schemaToRouteRecords,
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

  it('does not copy schema-only metadata onto MenuItem', () => {
    const items = menuSchemaToMenuItems([
      node({
        key: 'jobs',
        label: 'Jobs',
        path: '/jobs',
        hideInBreadcrumb: true,
        flatMenu: true,
        badge: 3,
        iframeSrc: 'https://example.test/jobs'
      })
    ])

    expect(items).toEqual([{ key: 'jobs', label: 'Jobs', href: '/jobs' }])
    expect(items[0]).not.toHaveProperty('badge')
    expect(items[0]).not.toHaveProperty('iframeSrc')
    expect(items[0]).not.toHaveProperty('hideInBreadcrumb')
    expect(items[0]).not.toHaveProperty('flatMenu')
  })
})

describe('filterMenuByPermission flatMenu', () => {
  it('keeps a visible parent as a leaf and promotes children beside it', () => {
    const schema: MenuSchema = [
      node({
        key: 'ops',
        label: 'Ops',
        path: '/ops',
        icon: 'settings',
        flatMenu: true,
        children: [
          node({ key: 'jobs', label: 'Jobs', path: '/ops/jobs', badge: 3 }),
          node({ key: 'monitor', label: 'Monitor', path: '/ops/monitor' })
        ]
      })
    ]

    const filtered = filterMenuByPermission(schema, allow())

    expect(filtered.map((item) => item.key)).toEqual(['ops', 'jobs', 'monitor'])
    expect(filtered[0]?.children).toBeUndefined()
    expect(filtered[1]?.badge).toBe(3)
  })

  it('does not emit a label-less layout node when flattening', () => {
    const schema: MenuSchema = [
      node({
        key: 'layout',
        flatMenu: true,
        children: [node({ key: 'inbox', label: 'Inbox', path: '/inbox' })]
      })
    ]

    expect(filterMenuByPermission(schema, allow()).map((item) => item.key)).toEqual(['inbox'])
  })
})

describe('schemaToRouteRecords', () => {
  it('nests child records and copies schema metadata onto meta', () => {
    const schema: MenuSchema = [
      node({
        key: 'system',
        label: 'System',
        icon: 'server',
        path: '/system',
        permission: 'system:menu',
        children: [
          node({
            key: 'users',
            label: 'Users',
            path: '/system/users',
            permission: 'user:list',
            badge: { content: 'NEW', type: 'text', variant: 'success' },
            hideInBreadcrumb: true
          }),
          node({
            key: 'user-edit',
            label: 'Edit user',
            path: '/system/users/edit',
            hideInMenu: true
          })
        ]
      })
    ]

    expect(schemaToRouteRecords(schema)).toEqual([
      {
        name: 'system',
        path: '/system',
        meta: {
          key: 'system',
          title: 'System',
          icon: 'server',
          permission: 'system:menu'
        },
        children: [
          {
            name: 'users',
            path: '/system/users',
            meta: {
              key: 'users',
              title: 'Users',
              permission: 'user:list',
              badge: { content: 'NEW', type: 'text', variant: 'success' },
              hideInBreadcrumb: true
            }
          },
          {
            name: 'user-edit',
            path: '/system/users/edit',
            meta: {
              key: 'user-edit',
              title: 'Edit user',
              hideInMenu: true
            }
          }
        ]
      }
    ])
  })

  it('lifts flatMenu children to sibling records and keeps hideInMenu pages', () => {
    const schema: MenuSchema = [
      node({
        key: 'ops',
        label: 'Ops',
        path: '/ops',
        flatMenu: true,
        children: [
          node({ key: 'jobs', label: 'Jobs', path: '/ops/jobs', badge: 8 }),
          node({ key: 'hidden', label: 'Hidden job', path: '/ops/hidden', hideInMenu: true })
        ]
      }),
      node({
        key: 'docs',
        label: 'Docs',
        path: '/iframe/docs',
        iframeSrc: 'https://example.test/docs',
        hideInBreadcrumb: true
      })
    ]

    expect(schemaToRouteRecords(schema)).toEqual([
      {
        name: 'ops',
        path: '/ops',
        meta: { key: 'ops', title: 'Ops', flatMenu: true }
      },
      {
        name: 'jobs',
        path: '/ops/jobs',
        meta: { key: 'jobs', title: 'Jobs', badge: 8 }
      },
      {
        name: 'hidden',
        path: '/ops/hidden',
        meta: { key: 'hidden', title: 'Hidden job', hideInMenu: true }
      },
      {
        name: 'docs',
        path: '/iframe/docs',
        meta: {
          key: 'docs',
          title: 'Docs',
          iframeSrc: 'https://example.test/docs',
          hideInBreadcrumb: true
        }
      }
    ])
  })

  it('skips dividers, groups, and href-only menu links', () => {
    const schema: MenuSchema = [
      node({ key: 'split', type: 'divider' }),
      node({
        key: 'org',
        type: 'group',
        label: 'Org',
        children: [node({ key: 'roles', label: 'Roles', path: '/roles' })]
      }),
      node({ key: 'help', label: 'Help', href: 'https://example.test/help' })
    ]

    expect(schemaToRouteRecords(schema)).toEqual([
      { name: 'roles', path: '/roles', meta: { key: 'roles', title: 'Roles' } }
    ])
  })

  it('drops unauthorized subtrees when a permission checker is passed', () => {
    const schema: MenuSchema = [
      node({ key: 'home', label: 'Home', path: '/home' }),
      node({
        key: 'admin',
        label: 'Admin',
        path: '/admin',
        permission: 'admin:menu',
        children: [node({ key: 'audit', label: 'Audit', path: '/admin/audit' })]
      })
    ]

    expect(schemaToRouteRecords(schema, allow()).map((item) => item.name)).toEqual(['home'])
  })

  it('emits iframe-only nodes with an empty path', () => {
    expect(
      schemaToRouteRecords([
        node({ key: 'ext', label: 'Ext', iframeSrc: 'https://example.test/embed' })
      ])
    ).toEqual([
      {
        name: 'ext',
        path: '',
        meta: { key: 'ext', title: 'Ext', iframeSrc: 'https://example.test/embed' }
      }
    ])
  })

  it('does not mutate the input tree and returns a new records array', () => {
    const child = node({ key: 'jobs', label: 'Jobs', path: '/ops/jobs' })
    const schema: MenuSchema = [
      node({
        key: 'ops',
        label: 'Ops',
        path: '/ops',
        flatMenu: true,
        children: [child]
      })
    ]

    const records = schemaToRouteRecords(schema)

    expect(schema[0]?.children).toEqual([child])
    expect(records).toHaveLength(2)
    expect(records[0]?.children).toBeUndefined()
  })
})
