<script setup lang="ts">
import { Card } from '@expcat/tigercat-vue/Card'
import { Space } from '@expcat/tigercat-vue/Space'
import { Button } from '@expcat/tigercat-vue/Button'
import { Pagination } from '@expcat/tigercat-vue/Pagination'
import { computed, ref, h } from 'vue'
import { List } from '@expcat/tigercat-vue/List'
import type { ListItem } from '@expcat/tigercat-vue'

// Basic list data
const basicData = ref([
  { key: 1, title: '列表项 1', description: '这是第一个列表项的描述' },
  { key: 2, title: '列表项 2', description: '这是第二个列表项的描述' },
  { key: 3, title: '列表项 3', description: '这是第三个列表项的描述' }
])

// List with avatars
const userData = ref([
  {
    key: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    title: '张三',
    description: '软件工程师 · 北京'
  },
  {
    key: 2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    title: '李四',
    description: '产品经理 · 上海'
  },
  {
    key: 3,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    title: '王五',
    description: 'UI 设计师 · 深圳'
  }
])

// Large dataset for pagination
const largeData = ref(
  Array.from({ length: 25 }, (_, i) => ({
    key: i + 1,
    title: `列表项 ${i + 1}`,
    description: `这是第 ${i + 1} 个列表项的描述信息`
  }))
)

// Grid data
const gridData = ref([
  { key: 1, title: '卡片 1', content: '这是卡片内容 1' },
  { key: 2, title: '卡片 2', content: '这是卡片内容 2' },
  { key: 3, title: '卡片 3', content: '这是卡片内容 3' },
  { key: 4, title: '卡片 4', content: '这是卡片内容 4' },
  { key: 5, title: '卡片 5', content: '这是卡片内容 5' },
  { key: 6, title: '卡片 6', content: '这是卡片内容 6' }
])

// List with extra content
const extraData = ref([
  {
    key: 1,
    title: '任务 1',
    description: '完成项目文档',
    extra: h(Button, { size: 'sm' }, () => '查看')
  },
  {
    key: 2,
    title: '任务 2',
    description: 'Review Pull Requests',
    extra: h(Button, { size: 'sm' }, () => '查看')
  }
])

// Custom render data
const productData = ref([
  { key: 1, name: 'Product A', price: '¥99', stock: 15 },
  { key: 2, name: 'Product B', price: '¥149', stock: 8 },
  { key: 3, name: 'Product C', price: '¥199', stock: 22 }
])

const loading = ref(false)
const pageInfo = ref({ current: 1, pageSize: 10 })
const lastClicked = ref('尚未选择列表项')

const pagedListData = computed(() => {
  const start = (pageInfo.value.current - 1) * pageInfo.value.pageSize
  return largeData.value.slice(start, start + pageInfo.value.pageSize)
})

function handleItemClick(item: ListItem, index: number) {
  lastClicked.value = `${String(item.title ?? item.key ?? '未命名项')}（第 ${index + 1} 项）`
}

function simulateLoading() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}

function handlePageChange(current: number, pageSize: number) {
  pageInfo.value = { current, pageSize }
}
</script>

<template>
  <div class="min-w-0">
    <div class="p-6 bg-gray-50 rounded-lg">
      <List :dataSource="[]" emptyText="暂无数据" />
    </div>
  </div>
</template>
