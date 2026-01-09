<script setup lang="ts">
import { ref, h } from 'vue'
import { List, Card, Space, Divider, Button } from '@tigercat/vue'

// Basic list data
const basicData = ref([
  { key: 1, title: '列表项 1', description: '这是第一个列表项的描述' },
  { key: 2, title: '列表项 2', description: '这是第二个列表项的描述' },
  { key: 3, title: '列表项 3', description: '这是第三个列表项的描述' },
])

// List with avatars
const userData = ref([
  {
    key: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    title: '张三',
    description: '软件工程师 · 北京',
  },
  {
    key: 2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    title: '李四',
    description: '产品经理 · 上海',
  },
  {
    key: 3,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    title: '王五',
    description: 'UI 设计师 · 深圳',
  },
])

// Large dataset for pagination
const largeData = ref(
  Array.from({ length: 25 }, (_, i) => ({
    key: i + 1,
    title: `列表项 ${i + 1}`,
    description: `这是第 ${i + 1} 个列表项的描述信息`,
  }))
)

// Grid data
const gridData = ref([
  { key: 1, title: '卡片 1', content: '这是卡片内容 1' },
  { key: 2, title: '卡片 2', content: '这是卡片内容 2' },
  { key: 3, title: '卡片 3', content: '这是卡片内容 3' },
  { key: 4, title: '卡片 4', content: '这是卡片内容 4' },
  { key: 5, title: '卡片 5', content: '这是卡片内容 5' },
  { key: 6, title: '卡片 6', content: '这是卡片内容 6' },
])

// List with extra content
const extraData = ref([
  {
    key: 1,
    title: '任务 1',
    description: '完成项目文档',
    extra: h(Button, { size: 'sm' }, () => '查看'),
  },
  {
    key: 2,
    title: '任务 2',
    description: 'Review Pull Requests',
    extra: h(Button, { size: 'sm' }, () => '查看'),
  },
])

// Custom render data
const productData = ref([
  { key: 1, name: 'Product A', price: '¥99', stock: 15 },
  { key: 2, name: 'Product B', price: '¥149', stock: 8 },
  { key: 3, name: 'Product C', price: '¥199', stock: 22 },
])

const loading = ref(false)
const pageInfo = ref({ current: 1, pageSize: 10 })

function handleItemClick(item: any, index: number) {
  console.log('点击了列表项:', item, '索引:', index)
}

function simulateLoading() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}

function handlePageChange(page: { current: number; pageSize: number }) {
  pageInfo.value = page
  console.log('分页变化:', page)
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">List 列表</h1>
      <p class="text-gray-600">通用列表组件，用于展示一系列相似的数据项。</p>
    </div>

    <div class="mb-10 p-4 bg-white border border-gray-200 rounded-lg">
      <div class="text-sm font-semibold text-gray-900 mb-3">功能导航</div>
      <div class="flex flex-wrap gap-2">
        <a
          v-for="item in [
            { href: '#basic', label: '基本用法' },
            { href: '#size', label: '尺寸' },
            { href: '#border', label: '边框' },
            { href: '#split', label: '分割线' },
            { href: '#avatar', label: '头像' },
            { href: '#extra', label: '额外内容' },
            { href: '#renderItem', label: '自定义渲染' },
            { href: '#headerFooter', label: '头尾' },
            { href: '#pagination', label: '分页' },
            { href: '#grid', label: '网格' },
            { href: '#loading', label: '加载' },
            { href: '#empty', label: '空态' },
            { href: '#clickable', label: '点击' },
          ]"
          :key="item.href"
          :href="item.href"
          class="px-3 py-1.5 text-sm rounded-full border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors"
        >
          {{ item.label }}
        </a>
      </div>
    </div>

    <!-- 基本用法 -->
    <section class="mb-12" id="basic">
      <h2 class="text-2xl font-bold mb-4">基本用法</h2>
      <p class="text-gray-600 mb-6">最简单的列表展示。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <List :dataSource="basicData" />
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 尺寸 -->
    <section class="mb-12" id="size">
      <h2 class="text-2xl font-bold mb-4">列表尺寸</h2>
      <p class="text-gray-600 mb-6">列表支持三种尺寸：小、中、大。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" :size="16" class="w-full">
          <div>
            <h3 class="text-sm font-semibold mb-2">小尺寸</h3>
            <List :dataSource="basicData.slice(0, 2)" size="sm" />
          </div>
          <div>
            <h3 class="text-sm font-semibold mb-2">中等尺寸（默认）</h3>
            <List :dataSource="basicData.slice(0, 2)" size="md" />
          </div>
          <div>
            <h3 class="text-sm font-semibold mb-2">大尺寸</h3>
            <List :dataSource="basicData.slice(0, 2)" size="lg" />
          </div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 边框样式 -->
    <section class="mb-12" id="border">
      <h2 class="text-2xl font-bold mb-4">边框样式</h2>
      <p class="text-gray-600 mb-6">列表支持多种边框样式。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" :size="16" class="w-full">
          <div>
            <h3 class="text-sm font-semibold mb-2">无边框</h3>
            <List :dataSource="basicData.slice(0, 2)" bordered="none" />
          </div>
          <div>
            <h3 class="text-sm font-semibold mb-2">分割线（默认）</h3>
            <List :dataSource="basicData.slice(0, 2)" bordered="divided" />
          </div>
          <div>
            <h3 class="text-sm font-semibold mb-2">完整边框</h3>
            <List :dataSource="basicData.slice(0, 2)" bordered="bordered" />
          </div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 分割线 -->
    <section class="mb-12" id="split">
      <h2 class="text-2xl font-bold mb-4">分割线（split）</h2>
      <p class="text-gray-600 mb-6">当 bordered="divided" 时，可通过 split 控制是否显示分割线。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-semibold mb-2">split = true（默认）</h3>
            <List :dataSource="basicData.slice(0, 3)" bordered="divided" split />
          </div>
          <div>
            <h3 class="text-sm font-semibold mb-2">split = false</h3>
            <List :dataSource="basicData.slice(0, 3)" bordered="divided" :split="false" />
          </div>
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 带头像的列表 -->
    <section class="mb-12" id="avatar">
      <h2 class="text-2xl font-bold mb-4">带头像的列表</h2>
      <p class="text-gray-600 mb-6">列表项可以包含头像。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <List :dataSource="userData" />
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 带额外内容 -->
    <section class="mb-12" id="extra">
      <h2 class="text-2xl font-bold mb-4">带额外内容</h2>
      <p class="text-gray-600 mb-6">通过数据项的 extra 在右侧添加操作区。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <List :dataSource="extraData" />
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 自定义渲染 -->
    <section class="mb-12" id="renderItem">
      <h2 class="text-2xl font-bold mb-4">自定义列表项渲染</h2>
      <p class="text-gray-600 mb-6">通过 renderItem 插槽自定义每一项的布局。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <List :dataSource="productData" hoverable>
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
      <Divider class="my-6" />
    </section>

    <!-- 头部和底部 -->
    <section class="mb-12" id="headerFooter">
      <h2 class="text-2xl font-bold mb-4">头部和底部</h2>
      <p class="text-gray-600 mb-6">列表可以添加头部和底部内容。</p>
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
      <Divider class="my-6" />
    </section>

    <!-- 分页列表 -->
    <section class="mb-12" id="pagination">
      <h2 class="text-2xl font-bold mb-4">分页列表</h2>
      <p class="text-gray-600 mb-6">当数据较多时，可以使用分页功能。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <List
          :dataSource="largeData"
          :pagination="{
            current: 1,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: true,
          }"
          @page-change="handlePageChange"
        />
        <div class="mt-3 text-sm text-gray-600">
          当前：第 {{ pageInfo.current }} 页，{{ pageInfo.pageSize }} / 页
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 网格布局 -->
    <section class="mb-12" id="grid">
      <h2 class="text-2xl font-bold mb-4">网格布局</h2>
      <p class="text-gray-600 mb-6">列表项可以以网格形式展示，支持响应式布局。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <List
          :dataSource="gridData"
          :grid="{
            gutter: 16,
            column: 3,
            xs: 1,
            sm: 2,
            md: 3,
          }"
          bordered="none"
        >
          <template #renderItem="{ item }">
            <Card variant="shadow">
              <h3 class="font-semibold mb-2">{{ item.title }}</h3>
              <p class="text-gray-600">{{ item.content }}</p>
            </Card>
          </template>
        </List>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 加载状态 -->
    <section class="mb-12" id="loading">
      <h2 class="text-2xl font-bold mb-4">加载状态</h2>
      <p class="text-gray-600 mb-6">列表支持加载状态。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" :size="16" class="w-full">
          <Button @click="simulateLoading">{{ loading ? '加载中...' : '模拟加载' }}</Button>
          <List :dataSource="basicData" :loading="loading" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 空状态 -->
    <section class="mb-12" id="empty">
      <h2 class="text-2xl font-bold mb-4">空状态</h2>
      <p class="text-gray-600 mb-6">当列表没有数据时显示空状态。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <List :dataSource="[]" emptyText="暂无数据" />
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 可点击列表 -->
    <section class="mb-12" id="clickable">
      <h2 class="text-2xl font-bold mb-4">可点击列表</h2>
      <p class="text-gray-600 mb-6">列表项可以添加点击事件和悬停效果。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <List
          :dataSource="basicData"
          hoverable
          @item-click="handleItemClick"
        />
      </div>
      <Divider class="my-6" />
    </section>

    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <router-link to="/" class="text-blue-600 hover:text-blue-800">← 返回首页</router-link>
    </div>
  </div>
</template>
