<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">VirtualTable 虚拟表格</h1>
    <p class="text-gray-500 mb-8">虚拟滚动表格，可高效渲染大量数据行。</p>

    <DemoBlock
      title="基础用法"
      description="1000 行数据，virtualItemHeight=48"
      :code="fullPageSnippet">
      <VirtualTable
        :data-source="basicData"
        :columns="basicColumns"
        :virtual-height="400"
        :virtual-item-height="48" />
    </DemoBlock>

    <DemoBlock title="斑马纹 & 边框" description="striped + bordered" :code="fullPageSnippet">
      <VirtualTable
        :data-source="basicData"
        :columns="basicColumns"
        :virtual-height="300"
        striped
        bordered />
    </DemoBlock>

    <DemoBlock
      title="固定列样式自定义"
      description="固定列支持 fixedClassName / fixedHeaderClassName，可根据 selected 状态自定义 sticky 单元格外观。"
      :code="fullPageSnippet">
      <VirtualTable
        :data-source="basicData.slice(0, 24)"
        :columns="fixedColumns"
        :virtual-height="280"
        :virtual-item-height="48"
        striped
        :row-selection="{ selectedRowKeys: [2, 4] }" />
    </DemoBlock>

    <DemoBlock title="加载 & 空状态" description="loading 和 emptyText" :code="fullPageSnippet">
      <div class="flex gap-4">
        <div class="flex-1">
          <p class="text-sm text-gray-500 mb-2">Loading</p>
          <VirtualTable :data-source="[]" :columns="basicColumns" :virtual-height="200" loading />
        </div>
        <div class="flex-1">
          <p class="text-sm text-gray-500 mb-2">Empty</p>
          <VirtualTable
            :data-source="[]"
            :columns="basicColumns"
            :virtual-height="200"
            empty-text="暂无数据" />
        </div>
      </div>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { VirtualTable } from '@expcat/tigercat-vue/VirtualTable'
import { type TableColumn } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './VirtualTableDemo.vue?raw'

const basicColumns: TableColumn[] = [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: '姓名', width: 150 },
  { key: 'email', title: '邮箱' },
  { key: 'status', title: '状态', width: 100 }
]

const fixedColumns: TableColumn[] = [
  {
    key: 'id',
    title: 'ID',
    width: 96,
    fixed: 'left',
    fixedHeaderClassName:
      'shadow-[inset_-1px_0_0_var(--tiger-border,#e5e7eb)] text-[var(--tiger-text,#111827)]',
    fixedClassName: ({ selected }) =>
      selected
        ? 'shadow-[inset_-1px_0_0_var(--tiger-border,#e5e7eb)] ring-2 ring-inset ring-sky-200/70'
        : 'shadow-[inset_-1px_0_0_var(--tiger-border,#e5e7eb)]'
  },
  { key: 'name', title: '姓名', width: 180 },
  { key: 'email', title: '邮箱', width: 240 },
  {
    key: 'status',
    title: '状态',
    width: 120,
    fixed: 'right',
    fixedHeaderClassName:
      'shadow-[inset_1px_0_0_var(--tiger-border,#e5e7eb)] text-[var(--tiger-text,#111827)]',
    fixedClassName: ({ selected }) =>
      selected
        ? 'shadow-[inset_1px_0_0_var(--tiger-border,#e5e7eb)] ring-2 ring-inset ring-sky-200/70'
        : 'shadow-[inset_1px_0_0_var(--tiger-border,#e5e7eb)]'
  }
]

const basicData = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `用户 ${i + 1}`,
  email: `user${i + 1}@example.com`,
  status: i % 3 === 0 ? '活跃' : i % 3 === 1 ? '离线' : '忙碌'
}))

const basicSnippet = `const columns = [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: '姓名', width: 150 },
  { key: 'email', title: '邮箱' },
  { key: 'status', title: '状态', width: 100 }
]
const data = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1, name: \`用户 \${i + 1}\`, email: \`user\${i + 1}@example.com\`
}))

<VirtualTable :data-source="data" :columns="columns" :virtual-height="400" :virtual-item-height="48" />`

const styledSnippet = `<VirtualTable :data-source="data" :columns="columns" :virtual-height="300" striped bordered />`

const fixedSnippet = `<VirtualTable
  :data-source="data"
  :columns="fixedColumns"
  :virtual-height="280"
  :virtual-item-height="48"
  striped
  :row-selection="{ selectedRowKeys: [2, 4] }" />`

const stateSnippet = `<VirtualTable :data-source="[]" :columns="columns" :virtual-height="200" loading />
<VirtualTable :data-source="[]" :columns="columns" :virtual-height="200" empty-text="暂无数据" />`
</script>
