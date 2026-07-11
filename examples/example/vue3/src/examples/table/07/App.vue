<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Table } from '@expcat/tigercat-vue/Table'
import type { TableColumn } from '@expcat/tigercat-vue'

const columns: TableColumn[] = [{ key: 'name', title: '姓名' }]
const rows = [{ id: 1, name: '张伟' }]
const loading = ref(true)
</script>

<template>
  <div class="space-y-3">
    <Button size="sm" @click="loading = !loading">
      切换为{{ loading ? '空状态' : '加载状态' }}
    </Button>
    <Table
      :columns="columns"
      :data-source="loading ? rows : []"
      :loading="loading"
      empty-text="暂无成员"
      :pagination="false" />
  </div>
</template>
