<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Table } from '@expcat/tigercat-vue/Table'
import type { TableColumn } from '@expcat/tigercat-vue'

type DemoState = 'data' | 'loading' | 'empty'

const columns: TableColumn[] = [{ key: 'name', title: '姓名' }]
const rows = [{ id: 1, name: '张伟' }]
const state = ref<DemoState>('data')
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-2">
      <Button
        size="sm"
        :variant="state === 'data' ? 'primary' : 'secondary'"
        @click="state = 'data'">
        有数据
      </Button>
      <Button
        size="sm"
        :variant="state === 'loading' ? 'primary' : 'secondary'"
        @click="state = 'loading'">
        加载中
      </Button>
      <Button
        size="sm"
        :variant="state === 'empty' ? 'primary' : 'secondary'"
        @click="state = 'empty'">
        空状态
      </Button>
    </div>
    <Table
      :columns="columns"
      :data-source="state === 'empty' ? [] : rows"
      :loading="state === 'loading'"
      empty-text="暂无成员"
      :pagination="false" />
  </div>
</template>
