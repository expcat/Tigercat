<script setup lang="ts">
import { ref } from 'vue'
import { Tree, Card, Space, Input } from '@tigercat/vue'
import type { TreeNode } from '@tigercat/vue'

// Basic tree data
const basicTreeData = ref<TreeNode[]>([
  {
    key: '1',
    label: '父节点 1',
    children: [
      { key: '1-1', label: '子节点 1-1' },
      { key: '1-2', label: '子节点 1-2' },
    ],
  },
  {
    key: '2',
    label: '父节点 2',
    children: [
      { key: '2-1', label: '子节点 2-1' },
      { key: '2-2', label: '子节点 2-2', children: [
        { key: '2-2-1', label: '子节点 2-2-1' },
        { key: '2-2-2', label: '子节点 2-2-2' },
      ]},
    ],
  },
])

// Checkable tree data
const checkedKeys = ref<(string | number)[]>(['1-1'])
const checkedKeysStrictly = ref<(string | number)[]>(['1-1'])

// Selectable tree data
const selectedKeys = ref<(string | number)[]>(['1-1'])

// Tree with disabled nodes
const disabledTreeData = ref<TreeNode[]>([
  {
    key: '1',
    label: '父节点 1',
    children: [
      { key: '1-1', label: '子节点 1-1' },
      { key: '1-2', label: '子节点 1-2 (禁用)', disabled: true },
    ],
  },
  {
    key: '2',
    label: '父节点 2 (禁用)',
    disabled: true,
    children: [
      { key: '2-1', label: '子节点 2-1' },
    ],
  },
])

// Lazy loading tree data
const lazyTreeData = ref<TreeNode[]>([
  { key: '1', label: '父节点 1' },
  { key: '2', label: '父节点 2' },
  { key: '3', label: '父节点 3' },
])

async function loadChildren(node: TreeNode): Promise<TreeNode[]> {
  // Simulate async loading
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { key: `${node.key}-1`, label: `${node.label} - 子节点 1` },
        { key: `${node.key}-2`, label: `${node.label} - 子节点 2` },
        { key: `${node.key}-3`, label: `${node.label} - 子节点 3` },
      ])
    }, 1000)
  })
}

// Filter tree
const filterValue = ref('')
const filterTreeData = ref<TreeNode[]>([
  {
    key: '1',
    label: 'Apple',
    children: [
      { key: '1-1', label: 'iPhone' },
      { key: '1-2', label: 'iPad' },
      { key: '1-3', label: 'MacBook' },
    ],
  },
  {
    key: '2',
    label: 'Microsoft',
    children: [
      { key: '2-1', label: 'Surface' },
      { key: '2-2', label: 'Xbox' },
    ],
  },
  {
    key: '3',
    label: 'Google',
    children: [
      { key: '3-1', label: 'Pixel' },
      { key: '3-2', label: 'Chromebook' },
    ],
  },
])
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Tree 树形控件</h1>
    <p class="text-gray-600 mb-8">用于展示层级结构的树形数据。</p>

    <Space direction="vertical" size="lg" class="w-full">
      <!-- 基本用法 -->
      <Card>
        <template #header><h3 class="text-lg font-semibold">基本用法</h3></template>
        <Tree :treeData="basicTreeData" />
      </Card>

      <!-- 默认展开所有节点 -->
      <Card>
        <template #header><h3 class="text-lg font-semibold">默认展开所有节点</h3></template>
        <Tree :treeData="basicTreeData" defaultExpandAll />
      </Card>

      <!-- 可选择的树 -->
      <Card>
        <template #header><h3 class="text-lg font-semibold">可选择的树</h3></template>
        <p class="text-sm text-gray-600 mb-4">已选择: {{ selectedKeys.join(', ') }}</p>
        <Tree 
          :treeData="basicTreeData" 
          selectable
          v-model:selectedKeys="selectedKeys"
        />
      </Card>

      <!-- 多选树（级联） -->
      <Card>
        <template #header><h3 class="text-lg font-semibold">多选树（级联）</h3></template>
        <p class="text-sm text-gray-600 mb-4">已勾选: {{ checkedKeys.join(', ') }}</p>
        <Tree 
          :treeData="basicTreeData" 
          checkable
          defaultExpandAll
          v-model:checkedKeys="checkedKeys"
        />
      </Card>

      <!-- 多选树（父子独立） -->
      <Card>
        <template #header><h3 class="text-lg font-semibold">多选树（父子独立）</h3></template>
        <p class="text-sm text-gray-600 mb-4">已勾选: {{ checkedKeysStrictly.join(', ') }}</p>
        <Tree 
          :treeData="basicTreeData" 
          checkable
          checkStrictly
          defaultExpandAll
          v-model:checkedKeys="checkedKeysStrictly"
        />
      </Card>

      <!-- 禁用节点 -->
      <Card>
        <template #header><h3 class="text-lg font-semibold">禁用节点</h3></template>
        <Tree :treeData="disabledTreeData" checkable defaultExpandAll />
      </Card>

      <!-- 懒加载 -->
      <Card>
        <template #header><h3 class="text-lg font-semibold">懒加载</h3></template>
        <p class="text-sm text-gray-600 mb-4">点击节点展开，动态加载子节点</p>
        <Tree :treeData="lazyTreeData" :loadData="loadChildren" />
      </Card>

      <!-- 节点过滤 -->
      <Card>
        <template #header><h3 class="text-lg font-semibold">节点过滤</h3></template>
        <Input 
          v-model="filterValue" 
          placeholder="搜索节点..." 
          class="mb-4"
        />
        <Tree :treeData="filterTreeData" :filterValue="filterValue" />
      </Card>

      <!-- Block 节点 -->
      <Card>
        <template #header><h3 class="text-lg font-semibold">Block 节点</h3></template>
        <p class="text-sm text-gray-600 mb-4">节点占据整行宽度</p>
        <Tree :treeData="basicTreeData" blockNode defaultExpandAll />
      </Card>
    </Space>
  </div>
</template>
