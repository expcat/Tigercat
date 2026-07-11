<script setup lang="ts">
import { VirtualTable } from '@expcat/tigercat-vue/VirtualTable'
import type { TableColumn } from '@expcat/tigercat-vue'

const columns: TableColumn[] = [
  { key: 'id', title: 'ID', width: 90, fixed: 'left' },
  { key: 'name', title: '姓名', width: 160 },
  { key: 'email', title: '邮箱', width: 260 },
  { key: 'status', title: '状态', width: 120, fixed: 'right' }
]

const rows = Array.from({ length: 500 }, (_, index) => ({
  id: index + 1,
  name: '用户 ' + (index + 1),
  email: 'user' + (index + 1) + '@example.com',
  status: index % 2 === 0 ? '在线' : '离线'
}))
</script>

<template>
  <VirtualTable
    :columns="columns"
    :data-source="rows"
    row-key="id"
    :virtual-height="360"
    :virtual-item-height="44"
    bordered
    striped
    :row-selection="{ defaultSelectedRowKeys: [2] }" />
</template>
