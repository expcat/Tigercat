<script setup lang="ts">
import { ref } from 'vue'
import { Tree, Input } from '@expcat/tigercat-vue'
import type { TreeNode } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

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

    <DemoBlock title="基本用法"
               description="基础树形结构展示。"
               :code="basicSnippet">
      <Tree :treeData="basicTreeData"
            ariaLabel="Tree 基本用法" />
    </DemoBlock>

    <DemoBlock title="默认展开所有节点"
               description="初始展开全部节点。"
               :code="expandAllSnippet">
      <Tree :treeData="basicTreeData"
            defaultExpandAll />
    </DemoBlock>

    <DemoBlock title="可选择的树"
               description="支持选择节点并回显选中结果。"
               :code="selectableSnippet">
      <p class="text-sm text-gray-600 mb-4">已选择: {{ selectedKeys.join(', ') }}</p>
      <Tree :treeData="basicTreeData"
            selectable
            v-model:selectedKeys="selectedKeys" />
    </DemoBlock>

    <DemoBlock title="多选树（级联）"
               description="勾选节点时父子联动。"
               :code="checkableSnippet">
      <p class="text-sm text-gray-600 mb-4">已勾选: {{ checkedKeys.join(', ') }}</p>
      <Tree :treeData="basicTreeData"
            checkable
            defaultExpandAll
            v-model:checkedKeys="checkedKeys" />
    </DemoBlock>

    <DemoBlock title="多选树（父子独立）"
               description="父子节点勾选状态相互独立。"
               :code="checkStrictlySnippet">
      <p class="text-sm text-gray-600 mb-4">已勾选: {{ checkedKeysStrictly.join(', ') }}</p>
      <Tree :treeData="basicTreeData"
            checkable
            checkStrictly
            defaultExpandAll
            v-model:checkedKeys="checkedKeysStrictly" />
    </DemoBlock>

    <DemoBlock title="禁用节点"
               description="为特定节点设置禁用状态。"
               :code="disabledSnippet">
      <Tree :treeData="disabledTreeData"
            checkable
            defaultExpandAll />
    </DemoBlock>

    <DemoBlock title="懒加载"
               description="展开节点时动态加载子节点。"
               :code="lazySnippet">
      <p class="text-sm text-gray-600 mb-4">点击节点展开，动态加载子节点</p>
      <Tree :treeData="lazyTreeData"
            :loadData="loadChildren" />
    </DemoBlock>

    <DemoBlock title="节点过滤"
               description="根据关键字过滤节点。"
               :code="filterSnippet">
      <Input v-model="filterValue"
             placeholder="搜索节点..."
             class="mb-4" />
      <Tree :treeData="filterTreeData"
            :filterValue="filterValue"
            ariaLabel="Tree 节点过滤" />
    </DemoBlock>

    <DemoBlock title="连接线"
               description="显示节点连接线。"
               :code="showLineSnippet">
      <Tree :treeData="basicTreeData"
            showLine
            defaultExpandAll />
    </DemoBlock>

    <DemoBlock title="多选（selectionMode）"
               description="通过 selectionMode='multiple' 支持多选。"
               :code="multiSelectSnippet">
      <p class="text-sm text-gray-600 mb-4">已选择: {{ multiSelectedKeys.join(', ') }}</p>
      <Tree :treeData="basicTreeData"
            selectionMode="multiple"
            defaultExpandAll
            v-model:selectedKeys="multiSelectedKeys" />
    </DemoBlock>

    <DemoBlock title="受控展开"
               description="通过 expandedKeys 外部控制展开状态。"
               :code="controlledExpandSnippet">
      <p class="text-sm text-gray-600 mb-4">展开节点: {{ controlledExpandedKeys.join(', ') }}</p>
      <Tree :treeData="basicTreeData"
            :expandedKeys="controlledExpandedKeys"
            @expand="(keys: (string | number)[]) => controlledExpandedKeys = keys" />
    </DemoBlock>

    <DemoBlock title="空数据"
               description="自定义空数据提示文案。"
               :code="emptySnippet">
      <Tree :treeData="[]"
            emptyText="暂无数据" />
    </DemoBlock>

    <DemoBlock title="Block 节点"
               description="节点占据整行宽度。"
               :code="blockSnippet">
      <p class="text-sm text-gray-600 mb-4">节点占据整行宽度</p>
      <Tree :treeData="basicTreeData"
            blockNode
            defaultExpandAll />
    </DemoBlock>
  </div>
</template>
