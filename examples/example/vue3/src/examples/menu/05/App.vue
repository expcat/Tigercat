<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  filterMenuByPermission,
  menuSchemaToMenuItems,
  schemaToRouteRecords,
  type MenuKey,
  type MenuRouteRecord,
  type MenuSchema,
  type MenuSchemaBadge
} from '@expcat/tigercat-core'
import { Content } from '@expcat/tigercat-vue/Content'
import { Layout } from '@expcat/tigercat-vue/Layout'
import { Menu } from '@expcat/tigercat-vue/Menu'
import { Sidebar } from '@expcat/tigercat-vue/Sidebar'
import { Table } from '@expcat/tigercat-vue/Table'
import type { TableColumn } from '@expcat/tigercat-vue'

const backendSchema: MenuSchema = [
  { key: 'dashboard', label: '工作台', icon: 'dashboard', path: '/dashboard' },
  {
    key: 'app',
    path: '/app',
    hideInMenu: true,
    hideInBreadcrumb: true,
    children: [{ key: 'profile', label: '个人中心', path: '/app/profile', hideInMenu: true }]
  },
  {
    key: 'ops',
    label: '运维',
    icon: 'settings',
    path: '/ops',
    flatMenu: true,
    children: [
      { key: 'jobs', label: '任务', path: '/ops/jobs', badge: 3 },
      {
        key: 'monitor',
        label: '监控',
        path: '/ops/monitor',
        badge: { content: 'NEW', type: 'text', variant: 'success' }
      }
    ]
  },
  {
    key: 'docs',
    label: '文档',
    icon: 'document',
    path: '/iframe/docs',
    iframeSrc: 'https://example.test/docs',
    hideInBreadcrumb: true
  },
  { key: 'help', label: '帮助', icon: 'document', href: 'https://example.test/help' }
]

interface RouteRow extends Record<string, unknown> {
  id: string
  path: string
  title: string
  flags: string
  badge: string
}

function badgeText(badge: MenuSchemaBadge | undefined): string {
  if (badge == null) return ''
  if (typeof badge === 'object') {
    if (badge.type === 'dot') return 'dot'
    return badge.content == null ? '' : String(badge.content)
  }
  return String(badge)
}

function flagList(record: MenuRouteRecord): string {
  const flags: string[] = []
  if (record.meta.hideInMenu) flags.push('hideInMenu')
  if (record.meta.hideInBreadcrumb) flags.push('hideInBreadcrumb')
  if (record.meta.flatMenu) flags.push('flatMenu')
  if (record.meta.iframeSrc) flags.push('iframe')
  if (record.meta.href) flags.push('href')
  return flags.join(', ')
}

function flattenRecords(records: MenuRouteRecord[], rows: RouteRow[] = []): RouteRow[] {
  for (const record of records) {
    rows.push({
      id: record.name,
      path: record.path || '—',
      title: record.meta.title ?? record.name,
      flags: flagList(record) || '—',
      badge: badgeText(record.meta.badge) || '—'
    })
    if (record.children) flattenRecords(record.children, rows)
  }
  return rows
}

const columns: TableColumn[] = [
  { key: 'path', title: 'path', width: 140 },
  { key: 'title', title: 'title', width: 96 },
  { key: 'flags', title: 'meta' },
  { key: 'badge', title: 'badge', width: 72 }
]

const selectedKeys = ref<MenuKey[]>(['dashboard'])
const openKeys = ref<MenuKey[]>([])
const items = computed(() =>
  menuSchemaToMenuItems(filterMenuByPermission(backendSchema, () => true))
)
const rows = flattenRecords(schemaToRouteRecords(backendSchema))
</script>

<template>
  <div class="space-y-3">
    <p class="text-sm text-[var(--tiger-text-muted)]">
      侧栏走 Menu；表是 schemaToRouteRecords 的纯数据，宿主自己 addRoute。
    </p>
    <Layout class="h-80 overflow-hidden rounded border border-[var(--tiger-border)]">
      <Layout>
        <Sidebar width="168px">
          <Menu
            v-model:selected-keys="selectedKeys"
            v-model:open-keys="openKeys"
            :items="items"
            aria-label="后台导航" />
        </Sidebar>
        <Content as="div" class="min-w-0 overflow-auto p-3">
          <Table
            :columns="columns"
            :data-source="rows"
            row-key="id"
            bordered
            size="sm"
            table-layout="fixed"
            :pagination="false" />
        </Content>
      </Layout>
    </Layout>
  </div>
</template>
