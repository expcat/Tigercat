<script setup lang="ts">
import { computed, ref, h } from 'vue'
import { List, Card, Space, Button, Pagination } from '@expcat/tigercat-vue'
import type { ListItem } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicSnippet = `<List :dataSource="basicData" />`

const sizeSnippet = `<List :dataSource="basicData.slice(0, 2)" size="sm" />
<List :dataSource="basicData.slice(0, 2)" size="md" />
<List :dataSource="basicData.slice(0, 2)" size="lg" />`

const borderSnippet = `<List :dataSource="basicData.slice(0, 2)" bordered="none" />
<List :dataSource="basicData.slice(0, 2)" bordered="divided" />
<List :dataSource="basicData.slice(0, 2)" bordered="bordered" />`

const splitSnippet = `<List :dataSource="basicData.slice(0, 3)" bordered="divided" split />
<List :dataSource="basicData.slice(0, 3)" bordered="divided" :split="false" />`

const avatarSnippet = `<List :dataSource="userData" />`

const extraSnippet = `<List :dataSource="extraData" />`

const renderSnippet = `<List :dataSource="productData" hoverable>
  <template #renderItem="{ item }">...</template>
</List>`

const headerFooterSnippet = `<List :dataSource="basicData">
  <template #header>...</template>
  <template #footer>...</template>
</List>`

const paginationSnippet = `<List :dataSource="pagedListData" />
<Pagination
  :current="pageInfo.current"
  :pageSize="pageInfo.pageSize"
  :total="largeData.length"
  showSizeChanger
  showTotal
  @change="handlePageChange"
  @page-size-change="handlePageChange" />`

const gridSnippet = `<List
  :dataSource="gridData"
  :grid="{ gutter: 16, column: 3, xs: 1, sm: 2, md: 3 }"
  bordered="none">
  <template #renderItem="{ item }">...</template>
</List>`

const loadingSnippet = `<List :dataSource="basicData" :loading="loading" />`

const emptySnippet = `<List :dataSource="[]" emptyText="暂无数据" />`

const clickableSnippet = `<List :dataSource="basicData" hoverable @item-click="handleItemClick" />`

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

const pagedListData = computed(() => {
  const start = (pageInfo.value.current - 1) * pageInfo.value.pageSize
  return largeData.value.slice(start, start + pageInfo.value.pageSize)
})

function handleItemClick(item: ListItem, index: number) {
  console.log('点击了列表项:', item, '索引:', index)
}

function simulateLoading() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}

function handlePageChange(current: number, pageSize: number) {
  pageInfo.value = { current, pageSize }
  console.log('分页变化:', { current, pageSize })
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">List 列表</h1>
      <p class="text-gray-600">通用列表组件，用于展示一系列相似的数据项。</p>
    </div>

    <DemoBlock title="基本用法"
               description="最简单的列表展示。"
               :code="basicSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <List :dataSource="basicData" />
      </div>
    </DemoBlock>

    <DemoBlock title="列表尺寸"
               description="列表支持三种尺寸：小、中、大。"
               :code="sizeSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               :size="16"
               class="w-full">
          <div>
            <h3 class="text-sm font-semibold mb-2">小尺寸</h3>
            <List :dataSource="basicData.slice(0, 2)"
                  size="sm" />
          </div>
          <div>
            <h3 class="text-sm font-semibold mb-2">中等尺寸（默认）</h3>
            <List :dataSource="basicData.slice(0, 2)"
                  size="md" />
          </div>
          <div>
            <h3 class="text-sm font-semibold mb-2">大尺寸</h3>
            <List :dataSource="basicData.slice(0, 2)"
                  size="lg" />
          </div>
        </Space>
      </div>
    </DemoBlock>

    <DemoBlock title="边框样式"
               description="列表支持多种边框样式。"
               :code="borderSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               :size="16"
               class="w-full">
          <div>
            <h3 class="text-sm font-semibold mb-2">无边框</h3>
            <List :dataSource="basicData.slice(0, 2)"
                  bordered="none" />
          </div>
          <div>
            <h3 class="text-sm font-semibold mb-2">分割线（默认）</h3>
            <List :dataSource="basicData.slice(0, 2)"
                  bordered="divided" />
          </div>
          <div>
            <h3 class="text-sm font-semibold mb-2">完整边框</h3>
            <List :dataSource="basicData.slice(0, 2)"
                  bordered="bordered" />
          </div>
        </Space>
      </div>
    </DemoBlock>

    <DemoBlock title="分割线（split）"
               description='当 bordered="divided" 时，可通过 split 控制是否显示分割线。'
               :code="splitSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-semibold mb-2">split = true（默认）</h3>
            <List :dataSource="basicData.slice(0, 3)"
                  bordered="divided"
                  split />
          </div>
          <div>
            <h3 class="text-sm font-semibold mb-2">split = false</h3>
            <List :dataSource="basicData.slice(0, 3)"
                  bordered="divided"
                  :split="false" />
          </div>
        </div>
      </div>
    </DemoBlock>

    <DemoBlock title="带头像的列表"
               description="列表项可以包含头像。"
               :code="avatarSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <List :dataSource="userData" />
      </div>
    </DemoBlock>

    <DemoBlock title="带额外内容"
               description="通过数据项的 extra 在右侧添加操作区。"
               :code="extraSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <List :dataSource="extraData" />
      </div>
    </DemoBlock>

    <DemoBlock title="自定义列表项渲染"
               description="通过 renderItem 插槽自定义每一项的布局。"
               :code="renderSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <List :dataSource="productData"
              hoverable>
          <template #renderItem="{ item }">
            <div class="flex items-center justify-between w-full">
              <div>
                <div class="font-medium">{{ item.name }}</div>
                <div class="text-sm text-gray-500">库存：{{ item.stock }}</div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-blue-600">{{ item.price }}</div>
                <Button size="sm">购买</Button>
              </div>
            </div>
          </template>
        </List>
      </div>
    </DemoBlock>

    <DemoBlock title="头部和底部"
               description="列表可以添加头部和底部内容。"
               :code="headerFooterSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <List :dataSource="basicData">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">用户列表</h3>
              <Button size="sm">添加</Button>
            </div>
          </template>
          <template #footer>
            <p class="text-sm text-gray-500">共 {{ basicData.length }} 条记录</p>
          </template>
        </List>
      </div>
    </DemoBlock>

    <DemoBlock title="分页列表"
               description="当数据较多时，可以使用分页功能。"
               :code="paginationSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="space-y-3">
          <List :dataSource="pagedListData" />
          <Pagination :current="pageInfo.current"
                      :pageSize="pageInfo.pageSize"
                      :total="largeData.length"
                      showSizeChanger
                      showTotal
                      @change="handlePageChange"
                      @page-size-change="handlePageChange" />
        </div>
        <div class="mt-3 text-sm text-gray-600">
          当前：第 {{ pageInfo.current }} 页，{{ pageInfo.pageSize }} / 页
        </div>
      </div>
    </DemoBlock>

    <DemoBlock title="网格布局"
               description="列表项可以以网格形式展示，支持响应式布局。"
               :code="gridSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <List :dataSource="gridData"
              :grid="{
                gutter: 16,
                column: 3,
                xs: 1,
                sm: 2,
                md: 3
              }"
              bordered="none">
          <template #renderItem="{ item }">
            <Card variant="shadow">
              <h3 class="font-semibold mb-2">{{ item.title }}</h3>
              <p class="text-gray-600">{{ item.content }}</p>
            </Card>
          </template>
        </List>
      </div>
    </DemoBlock>

    <DemoBlock title="加载状态"
               description="列表支持加载状态。"
               :code="loadingSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               :size="16"
               class="w-full">
          <Button @click="simulateLoading">{{ loading ? '加载中...' : '模拟加载' }}</Button>
          <List :dataSource="basicData"
                :loading="loading" />
        </Space>
      </div>
    </DemoBlock>

    <DemoBlock title="空状态"
               description="当列表没有数据时显示空状态。"
               :code="emptySnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <List :dataSource="[]"
              emptyText="暂无数据" />
      </div>
    </DemoBlock>

    <DemoBlock title="可点击列表"
               description="列表项可以添加点击事件和悬停效果。"
               :code="clickableSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <List :dataSource="basicData"
              hoverable
              @item-click="handleItemClick" />
      </div>
    </DemoBlock>
  </div>
</template>
