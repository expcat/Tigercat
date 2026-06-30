<template>
  <div class="space-y-6">
    <section class="space-y-3">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
      <VirtualTable
        :data-source="data"
        :columns="columns"
        :virtual-height="400"
        :virtual-item-height="48" />
    </section>
    <section class="space-y-3">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">加载 & 空状态</h3>
      <div class="grid gap-4 md:grid-cols-2">
        <VirtualTable :data-source="[]" :columns="columns" :virtual-height="200" loading />
        <VirtualTable
          :data-source="[]"
          :columns="columns"
          :virtual-height="200"
          empty-text="暂无数据" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { VirtualTable } from '@expcat/tigercat-vue/VirtualTable'
import { type TableColumn } from '@expcat/tigercat-vue'

const columns: TableColumn[] = [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: '姓名', width: 150 },
  { key: 'email', title: '邮箱' },
  { key: 'status', title: '状态', width: 100 }
]

const data = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `用户 ${i + 1}`,
  email: `user${i + 1}@example.com`,
  status: i % 3 === 0 ? '活跃' : i % 3 === 1 ? '离线' : '忙碌'
}))
</script>
