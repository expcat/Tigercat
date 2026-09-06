import { useEffect, useMemo, useState } from 'react'
import {
  filterMenuByPermission,
  menuSchemaToMenuItems,
  type MenuItem as MenuItemData,
  type MenuKey,
  type MenuSchema
} from '@expcat/tigercat-core'
import { Checkbox } from '@expcat/tigercat-react/Checkbox'
import { CheckboxGroup } from '@expcat/tigercat-react/CheckboxGroup'
import { Content } from '@expcat/tigercat-react/Content'
import { Layout } from '@expcat/tigercat-react/Layout'
import { Menu } from '@expcat/tigercat-react/Menu'
import { Segmented } from '@expcat/tigercat-react/Segmented'
import { Sidebar } from '@expcat/tigercat-react/Sidebar'

const backendSchema: MenuSchema = [
  { key: 'dashboard', label: '工作台', icon: 'dashboard', path: '/dashboard' },
  {
    key: 'shell',
    hideInMenu: true,
    children: [
      {
        key: 'org',
        type: 'group',
        label: '组织',
        permission: 'user:menu',
        children: [
          {
            key: 'users',
            label: '用户',
            icon: 'users',
            path: '/org/users',
            permission: 'user:list',
            children: [
              {
                key: 'user-edit',
                label: '编辑用户',
                path: '/org/users/edit',
                permission: ['user:list', 'user:edit']
              }
            ]
          },
          { key: 'roles', label: '角色', icon: 'lock', path: '/org/roles', permission: 'user:edit' }
        ]
      }
    ]
  },
  { key: 'split', type: 'divider' },
  {
    key: 'tickets',
    label: '工单',
    icon: 'ticket',
    path: '/tickets',
    permission: 'ticket:list',
    children: [
      { key: 'ticket-open', label: '待处理', path: '/tickets/open', permission: 'ticket:list' },
      { key: 'ticket-all', label: '全部工单', path: '/tickets/all', permission: 'ticket:admin' }
    ]
  },
  {
    key: 'settings',
    label: '系统设置',
    icon: 'settings',
    path: '/settings',
    permission: 'system:settings'
  },
  { key: 'help', label: '帮助', icon: 'document', href: 'https://example.test/help' }
]

const permissionCodes = [
  'user:menu',
  'user:list',
  'user:edit',
  'ticket:list',
  'ticket:admin',
  'system:settings'
] as const

const rolePresets: Record<string, string[]> = {
  guest: [],
  staff: ['ticket:list'],
  lead: ['user:menu', 'user:list', 'ticket:list'],
  admin: [...permissionCodes]
}

const roleOptions = [
  { label: '访客', value: 'guest' },
  { label: '员工', value: 'staff' },
  { label: '主管', value: 'lead' },
  { label: '管理员', value: 'admin' }
]

function hasMenuKey(nodes: MenuItemData[], key: MenuKey): boolean {
  return nodes.some((node) => {
    if (node.key === key) return true
    return node.children ? hasMenuKey(node.children, key) : false
  })
}

export default function App() {
  const [role, setRole] = useState<string | number>('staff')
  const [permissions, setPermissions] = useState<(string | number | boolean)[]>([
    ...rolePresets.staff
  ])
  const [selectedKeys, setSelectedKeys] = useState<MenuKey[]>(['dashboard'])
  const [openKeys, setOpenKeys] = useState<MenuKey[]>(['tickets', 'users'])

  const items = useMemo(
    () =>
      menuSchemaToMenuItems(
        filterMenuByPermission(backendSchema, (code) => permissions.includes(code))
      ),
    [permissions]
  )

  useEffect(() => {
    setSelectedKeys((currentKeys) => {
      const current = currentKeys[0]
      if (current == null || !hasMenuKey(items, current)) {
        return ['dashboard']
      }
      return currentKeys
    })
  }, [items])

  return (
    <div className="space-y-3">
      <Segmented
        value={role}
        onChange={(next) => {
          setRole(next)
          setPermissions([...(rolePresets[String(next)] ?? [])])
        }}
        options={roleOptions}
        size="sm"
        aria-label="角色预设"
      />
      <CheckboxGroup
        value={permissions}
        onChange={setPermissions}
        size="sm"
        className="flex flex-wrap gap-x-4 gap-y-1"
        aria-label="权限码">
        {permissionCodes.map((code) => (
          <Checkbox key={code} value={code}>
            {code}
          </Checkbox>
        ))}
      </CheckboxGroup>
      <p className="text-sm text-[var(--tiger-text-muted)]">
        当前权限：{permissions.length ? permissions.join(', ') : '无'}
      </p>
      <Layout className="h-72 overflow-hidden rounded border border-[var(--tiger-border)]">
        <Layout>
          <Sidebar width="192px">
            <Menu
              selectedKeys={selectedKeys}
              onSelectedKeysChange={setSelectedKeys}
              openKeys={openKeys}
              onOpenKeysChange={setOpenKeys}
              items={items}
              aria-label="后台导航"
            />
          </Sidebar>
          <Content as="div">选中 {selectedKeys[0]}</Content>
        </Layout>
      </Layout>
    </div>
  )
}
