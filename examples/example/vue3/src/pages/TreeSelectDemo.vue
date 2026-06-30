<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { ref } from 'vue'
import { TreeSelect } from '@expcat/tigercat-vue/TreeSelect'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './TreeSelectDemo.vue?raw'

const val = ref<string | number | undefined>(undefined)
const val2 = ref<string | number | undefined>(undefined)
const treeData = [
  {
    key: 'dev',
    label: '研发部',
    value: 'dev',
    children: [
      {
        key: 'fe',
        label: '前端组',
        value: 'fe',
        children: [
          { key: 'zs', label: '张三', value: 'zs' },
          { key: 'ls', label: '李四', value: 'ls' }
        ]
      },
      {
        key: 'be',
        label: '后端组',
        value: 'be',
        children: [{ key: 'ww', label: '王五', value: 'ww' }]
      }
    ]
  },
  { key: 'pm', label: '产品部', value: 'pm', children: [{ key: 'zl', label: '赵六', value: 'zl' }] }
]

const basicScriptSnippet = `import { ref } from 'vue'

const val = ref(undefined)`

const basicSnippet = `<TreeSelect v-model="val" :tree-data="treeData" placeholder="请选择成员" />`
const searchSnippet = `<TreeSelect v-model="val" :tree-data="treeData" placeholder="搜索成员" searchable />`
const sizeSnippet = `<TreeSelect :tree-data="treeData" size="sm" placeholder="小" />
<TreeSelect :tree-data="treeData" size="lg" placeholder="大" />
<TreeSelect :tree-data="treeData" disabled placeholder="禁用" />`
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">TreeSelect 树选择</h1>
    <p class="text-gray-500 mb-8">树形结构选择器，适用于组织架构等层级数据。</p>

    <DemoBlock title="基本用法" :code="fullPageSnippet">
      <TreeSelect v-model="val" :tree-data="treeData" placeholder="请选择成员" />
    </DemoBlock>

    <DemoBlock title="可搜索" description="searchable 开启搜索" :code="fullPageSnippet">
      <TreeSelect v-model="val2" :tree-data="treeData" placeholder="搜索成员" searchable />
    </DemoBlock>

    <DemoBlock title="尺寸与禁用" :code="fullPageSnippet">
      <Space direction="vertical" :size="12">
        <TreeSelect :tree-data="treeData" size="sm" placeholder="小" />
        <TreeSelect :tree-data="treeData" size="lg" placeholder="大" />
        <TreeSelect :tree-data="treeData" disabled placeholder="禁用" />
      </Space>
    </DemoBlock>
  </div>
</template>
