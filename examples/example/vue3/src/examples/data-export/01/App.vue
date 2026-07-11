<script setup lang="ts">
import { ref } from 'vue'
import { DataExport } from '@expcat/tigercat-vue/DataExport'
import { Table } from '@expcat/tigercat-vue/Table'
import { type TableColumn } from '@expcat/tigercat-vue'
import type { DataExportFormat } from '@expcat/tigercat-core'

interface UserRow extends Record<string, unknown> {
  id: number
  name: string
  email: string
  age: number
  status: 'active' | 'disabled'
  joinedAt: string
}

const columns: TableColumn<Record<string, unknown>>[] = [
  { key: 'name', title: '姓名' },
  { key: 'email', title: '邮箱' },
  { key: 'age', title: '年龄', align: 'right' },
  { key: 'status', title: '状态' },
  { key: 'joinedAt', title: '入职日期' }
]

const rows: UserRow[] = [
  {
    id: 1,
    name: '张伟',
    email: 'zhangwei@example.com',
    age: 32,
    status: 'active',
    joinedAt: '2023-03-15'
  },
  {
    id: 2,
    name: '李娜',
    email: 'lina@example.com',
    age: 28,
    status: 'active',
    joinedAt: '2024-01-08'
  },
  {
    id: 3,
    name: '王强',
    email: 'wangqiang@example.com',
    age: 41,
    status: 'disabled',
    joinedAt: '2021-11-02'
  },
  {
    id: 4,
    name: 'Alice Chen',
    email: 'alice@example.com',
    age: 35,
    status: 'active',
    joinedAt: '2022-07-19'
  }
]

const statusText: Record<UserRow['status'], string> = {
  active: '在职',
  disabled: '离职'
}

const lastExport = ref('')

const formatStatusCell = (value: unknown, column: TableColumn) =>
  column.key === 'status' ? statusText[value as UserRow['status']] : value

const handleExport = (format: DataExportFormat) => {
  lastExport.value = format
}

const handleError = () => {
  lastExport.value = 'error'
}
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-8">
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          默认提供 Excel 与 Markdown 两种格式，渲染为下拉菜单。列定义与 Table 完全一致。
        </p>
        <div class="flex items-center gap-3">
          <DataExport :columns="columns" :data-source="rows" />
        </div>
        <Table :columns="columns" :data-source="rows" :pagination="false" />
      </section>

      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">单一格式</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          formats 只包含一个格式时渲染为普通按钮。
        </p>
        <div class="flex items-center gap-3">
          <DataExport :columns="columns" :data-source="rows" :formats="['xlsx']" />
          <DataExport :columns="columns" :data-source="rows" :formats="['markdown']" />
        </div>
      </section>

      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">
          自定义文件名与单元格格式化
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          fileName / sheetName 自定义产物命名；cellFormatter
          在导出前转换单元格取值（如状态枚举转文案）。
        </p>
        <DataExport
          :columns="columns"
          :data-source="rows"
          file-name="员工名单"
          sheet-name="在职员工"
          :cell-formatter="formatStatusCell" />
      </section>

      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">导出回调</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          export 事件在下载触发后回调格式；error 事件捕获序列化异常。
        </p>
        <div class="flex items-center gap-3">
          <DataExport
            :columns="columns"
            :data-source="rows"
            @export="handleExport"
            @error="handleError" />
          <span v-if="lastExport" class="text-sm text-gray-500 dark:text-gray-400">
            最近导出：{{ lastExport }}
          </span>
        </div>
      </section>
    </div>
  </div>
</template>
