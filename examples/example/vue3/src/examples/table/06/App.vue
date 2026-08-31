<script setup lang="ts">
import { Table } from '@expcat/tigercat-vue/Table'
import type { TableColumn } from '@expcat/tigercat-vue'

const columns: TableColumn[] = [
  {
    key: 'name',
    title: '姓名',
    width: 160,
    fixed: 'left',
    fixedHeaderClassName: 'shadow-[inset_-1px_0_0_var(--tiger-border)]',
    fixedClassName: 'shadow-[inset_-1px_0_0_var(--tiger-border)]'
  },
  { key: 'email', title: '邮箱', width: 240 },
  { key: 'city', title: '城市', width: 180 },
  { key: 'status', title: '状态', width: 140, fixed: 'right' }
]

const rows = [
  { id: 1, name: '张伟', email: 'zhang@example.com', city: '上海', status: '在线' },
  { id: 2, name: '李娜', email: 'li@example.com', city: '北京', status: '离线' },
  { id: 3, name: '王强', email: 'wang@example.com', city: '深圳', status: '在线' },
  { id: 4, name: '赵敏', email: 'zhao@example.com', city: '杭州', status: '在线' },
  { id: 5, name: '陈晨', email: 'chen@example.com', city: '成都', status: '离线' },
  { id: 6, name: '刘洋', email: 'liu@example.com', city: '广州', status: '在线' },
  { id: 7, name: '周杰', email: 'zhou@example.com', city: '南京', status: '离线' },
  { id: 8, name: '吴芳', email: 'wu@example.com', city: '武汉', status: '在线' }
]
</script>

<template>
  <Table
    :columns="columns"
    :data-source="rows"
    column-lockable
    sticky-header
    :max-height="220"
    striped
    :pagination="false" />
</template>
