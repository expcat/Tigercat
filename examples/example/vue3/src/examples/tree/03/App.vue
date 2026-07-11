<script setup lang="ts">
import { Input } from '@expcat/tigercat-vue/Input'
import { ref } from 'vue'
import { Tree } from '@expcat/tigercat-vue/Tree'
import type { TreeNode } from '@expcat/tigercat-vue'

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
</script>

<template>
  <div class="min-w-0">
    <Input v-model="filterValue" placeholder="搜索节点..." class="mb-4" /><Tree
      :treeData="filterTreeData"
      :filterValue="filterValue"
      ariaLabel="Tree 节点过滤" />
  </div>
</template>
