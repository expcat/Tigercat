<script setup lang="ts">
import { Input } from '@expcat/tigercat-vue/Input'
import { ref } from 'vue'
import { Tree } from '@expcat/tigercat-vue/Tree'
import type { TreeNode } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './TreeDemo.vue?raw'

// Basic tree data
const basicTreeData = ref<TreeNode[]>([
  {
    key: '1',
    label: '父节点 1',
    children: [
      { key: '1-1', label: '子节点 1-1' },
      { key: '1-2', label: '子节点 1-2' }
    ]
  },
  {
    key: '2',
    label: '父节点 2',
    children: [
      { key: '2-1', label: '子节点 2-1' },
      {
        key: '2-2',
        label: '子节点 2-2',
        children: [
          { key: '2-2-1', label: '子节点 2-2-1' },
          { key: '2-2-2', label: '子节点 2-2-2' }
        ]
      }
    ]
  }
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
      { key: '1-2', label: '子节点 1-2 (禁用)', disabled: true }
    ]
  },
  {
    key: '2',
    label: '父节点 2 (禁用)',
    disabled: true,
    children: [{ key: '2-1', label: '子节点 2-1' }]
  }
])

// Lazy loading tree data
const lazyTreeData = ref<TreeNode[]>([
  { key: '1', label: '父节点 1' },
  { key: '2', label: '父节点 2' },
  { key: '3', label: '父节点 3' }
])

async function loadChildren(node: TreeNode): Promise<TreeNode[]> {
  // Simulate async loading
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { key: `${node.key}-1`, label: `${node.label} - 子节点 1` },
        { key: `${node.key}-2`, label: `${node.label} - 子节点 2` },
        { key: `${node.key}-3`, label: `${node.label} - 子节点 3` }
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
      { key: '1-3', label: 'MacBook' }
    ]
  },
  {
    key: '2',
    label: 'Microsoft',
    children: [
      { key: '2-1', label: 'Surface' },
      { key: '2-2', label: 'Xbox' }
    ]
  },
  {
    key: '3',
    label: 'Google',
    children: [
      { key: '3-1', label: 'Pixel' },
      { key: '3-2', label: 'Chromebook' }
    ]
  }
])

// Multiple selection data
const multiSelectedKeys = ref<(string | number)[]>([])

// Controlled expanded keys
const controlledExpandedKeys = ref<(string | number)[]>(['1'])

const basicSnippet = `<Tree :treeData="basicTreeData" ariaLabel="Tree 基本用法" />`

const expandAllSnippet = `<Tree :treeData="basicTreeData" defaultExpandAll />`

const selectableSnippet = `<p class="text-sm text-gray-600 mb-4">已选择: {{ selectedKeys.join(', ') }}</p>
<Tree :treeData="basicTreeData" selectable v-model:selectedKeys="selectedKeys" />`

const checkableSnippet = `<p class="text-sm text-gray-600 mb-4">已勾选: {{ checkedKeys.join(', ') }}</p>
<Tree
  :treeData="basicTreeData"
  checkable
  defaultExpandAll
  v-model:checkedKeys="checkedKeys" />`

const checkableScriptSnippet = `import { ref } from 'vue'

const checkedKeys = ref<(string | number)[]>(['1-1'])`

const checkStrictlySnippet = `<p class="text-sm text-gray-600 mb-4">已勾选: {{ checkedKeysStrictly.join(', ') }}</p>
<Tree
  :treeData="basicTreeData"
  checkable
  checkStrictly
  defaultExpandAll
  v-model:checkedKeys="checkedKeysStrictly" />`

const disabledSnippet = `<Tree :treeData="disabledTreeData" checkable defaultExpandAll />`

const lazySnippet = `<p class="text-sm text-gray-600 mb-4">点击节点展开，动态加载子节点</p>
<Tree :treeData="lazyTreeData" :loadData="loadChildren" />`

const filterSnippet = `<Input v-model="filterValue" placeholder="搜索节点..." class="mb-4" />
<Tree :treeData="filterTreeData" :filterValue="filterValue" ariaLabel="Tree 节点过滤" />`

const showLineSnippet = `<Tree :treeData="basicTreeData" showLine defaultExpandAll />`

const multiSelectSnippet = `<p class="text-sm text-gray-600 mb-4">已选择: {{ multiSelectedKeys.join(', ') }}</p>
<Tree
  :treeData="basicTreeData"
  selectionMode="multiple"
  defaultExpandAll
  v-model:selectedKeys="multiSelectedKeys" />`

const controlledExpandSnippet = `<p class="text-sm text-gray-600 mb-4">展开节点: {{ controlledExpandedKeys.join(', ') }}</p>
<Tree
  :treeData="basicTreeData"
  :expandedKeys="controlledExpandedKeys"
  @expand="(keys) => controlledExpandedKeys = keys" />`

const emptySnippet = `<Tree :treeData="[]" emptyText="暂无数据" />`

const blockSnippet = `<p class="text-sm text-gray-600 mb-4">节点占据整行宽度</p>
<Tree :treeData="basicTreeData" blockNode defaultExpandAll />`
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Tree 树形控件</h1>
    <p class="text-gray-600 mb-2">用于展示层级结构的树形数据。</p>
    <p class="text-sm text-gray-600 mb-8">
      键盘：方向键移动焦点，Enter 选择，Space 勾选，Escape 收拢。
    </p>

    <DemoBlock
      title="基本用法等组合展示"
      description="合并展示基本用法、默认展开所有节点、可选择的树等互不冲突的使用方式。"
      :code="fullPageSnippet">
      <div class="space-y-6">
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
          <Tree :treeData="basicTreeData" ariaLabel="Tree 基本用法" />
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">默认展开所有节点</h3>
          <Tree :treeData="basicTreeData" defaultExpandAll />
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">可选择的树</h3>
          <p class="text-sm text-gray-600 mb-4">已选择: {{ selectedKeys.join(', ') }}</p>
          <Tree :treeData="basicTreeData" selectable v-model:selectedKeys="selectedKeys" />
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">多选树（级联）</h3>
          <p class="text-sm text-gray-600 mb-4">已勾选: {{ checkedKeys.join(', ') }}</p>
          <Tree
            :treeData="basicTreeData"
            checkable
            defaultExpandAll
            v-model:checkedKeys="checkedKeys" />
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">多选树（父子独立）</h3>
          <p class="text-sm text-gray-600 mb-4">已勾选: {{ checkedKeysStrictly.join(', ') }}</p>
          <Tree
            :treeData="basicTreeData"
            checkable
            checkStrictly
            defaultExpandAll
            v-model:checkedKeys="checkedKeysStrictly" />
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">禁用节点</h3>
          <Tree :treeData="disabledTreeData" checkable defaultExpandAll />
        </div>
      </div>
    </DemoBlock>

    <DemoBlock title="懒加载" description="展开节点时动态加载子节点。" :code="fullPageSnippet">
      <p class="text-sm text-gray-600 mb-4">点击节点展开，动态加载子节点</p>
      <Tree :treeData="lazyTreeData" :loadData="loadChildren" />
    </DemoBlock>

    <DemoBlock title="节点过滤" description="根据关键字过滤节点。" :code="fullPageSnippet">
      <Input v-model="filterValue" placeholder="搜索节点..." class="mb-4" />
      <Tree :treeData="filterTreeData" :filterValue="filterValue" ariaLabel="Tree 节点过滤" />
    </DemoBlock>

    <DemoBlock
      title="连接线等组合展示"
      description="合并展示连接线、多选（selectionMode）、受控展开等互不冲突的使用方式。"
      :code="fullPageSnippet">
      <div class="space-y-6">
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">连接线</h3>
          <Tree :treeData="basicTreeData" showLine defaultExpandAll />
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">
            多选（selectionMode）
          </h3>
          <p class="text-sm text-gray-600 mb-4">已选择: {{ multiSelectedKeys.join(', ') }}</p>
          <Tree
            :treeData="basicTreeData"
            selectionMode="multiple"
            defaultExpandAll
            v-model:selectedKeys="multiSelectedKeys" />
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">受控展开</h3>
          <p class="text-sm text-gray-600 mb-4">
            展开节点: {{ controlledExpandedKeys.join(', ') }}
          </p>
          <Tree
            :treeData="basicTreeData"
            :expandedKeys="controlledExpandedKeys"
            @expand="(keys: (string | number)[]) => (controlledExpandedKeys = keys)" />
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">空数据</h3>
          <Tree :treeData="[]" emptyText="暂无数据" />
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">Block 节点</h3>
          <p class="text-sm text-gray-600 mb-4">节点占据整行宽度</p>
          <Tree :treeData="basicTreeData" blockNode defaultExpandAll />
        </div>
      </div>
    </DemoBlock>
  </div>
</template>
