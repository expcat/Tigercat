<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  filterMenuByPermission,
  menuSchemaToMenuItems,
  type MenuItem as MenuItemData,
  type MenuKey,
  type MenuSchema
} from '@expcat/tigercat-core'
import { Checkbox } from '@expcat/tigercat-vue/Checkbox'
import { CheckboxGroup } from '@expcat/tigercat-vue/CheckboxGroup'
import { Content } from '@expcat/tigercat-vue/Content'
import { Layout } from '@expcat/tigercat-vue/Layout'
import { Menu } from '@expcat/tigercat-vue/Menu'
import { Segmented } from '@expcat/tigercat-vue/Segmented'
import { Sidebar } from '@expcat/tigercat-vue/Sidebar'

// React parity is slice 3 — do not implement React here.

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

const role = ref<string | number>('staff')
const permissions = ref<(string | number | boolean)[]>([...rolePresets.staff])
const selectedKeys = ref<MenuKey[]>(['dashboard'])
const openKeys = ref<MenuKey[]>(['tickets', 'users'])

watch(role, (next) => {
  permissions.value = [...(rolePresets[String(next)] ?? [])]
})

const items = computed(() =>
  menuSchemaToMenuItems(
    filterMenuByPermission(backendSchema, (code) => permissions.value.includes(code))
  )
)

function hasMenuKey(nodes: MenuItemData[], key: MenuKey): boolean {
  return nodes.some((node) => {
    if (node.key === key) return true
    return node.children ? hasMenuKey(node.children, key) : false
  })
}

watch(
  items,
  (next) => {
    const current = selectedKeys.value[0]
    if (current == null || !hasMenuKey(next, current)) {
      selectedKeys.value = ['dashboard']
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="space-y-3">
    <Segmented v-model="role" :options="roleOptions" size="sm" aria-label="角色预设" />
    <CheckboxGroup
      v-model="permissions"
      size="sm"
      class="flex flex-wrap gap-x-4 gap-y-1"
      aria-label="权限码">
      <Checkbox v-for="code in permissionCodes" :key="code" :value="code">
        {{ code }}
      </Checkbox>
    </CheckboxGroup>
    <p class="text-sm text-[var(--tiger-text-muted)]">
      当前权限：{{ permissions.length ? permissions.join(', ') : '无' }}
    </p>
    <Layout class="h-72 overflow-hidden rounded border border-[var(--tiger-border)]">
      <Layout>
        <Sidebar width="192px">
          <Menu
            v-model:selected-keys="selectedKeys"
            v-model:open-keys="openKeys"
            :items="items"
            aria-label="后台导航" />
        </Sidebar>
        <Content as="div">选中 {{ selectedKeys[0] }}</Content>
      </Layout>
    </Layout>
  </div>
</template>
