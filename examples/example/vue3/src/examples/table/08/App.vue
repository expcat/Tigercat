<script setup lang="ts">
import { ref } from 'vue'
import { Table } from '@expcat/tigercat-vue/Table'
import type { TableColumn } from '@expcat/tigercat-vue'

const columns: TableColumn[] = [
  { key: 'name', title: '姓名' },
  { key: 'role', title: '角色' }
]

const rows = [
  { id: 1, name: '张伟', role: '产品经理', detail: '负责需求规划与团队协作。' },
  { id: 2, name: '李娜', role: '前端工程师', detail: '负责 Web 端体验与组件建设。' }
]

const expandedRowKeys = ref<(string | number)[]>([1])
</script>

<template>
  <Table
    :columns="columns"
    :data-source="rows"
    :expandable="{
      expandedRowKeys,
      expandRowByClick: true
    }"
    :pagination="false"
    @expand-change="expandedRowKeys = $event">
    <template #cell-name="{ record }">{{ record.name }}</template>
    <template #expanded-row="{ record }">
      <div class="p-3 text-sm">{{ record.detail }}</div>
    </template>
  </Table>
</template>
