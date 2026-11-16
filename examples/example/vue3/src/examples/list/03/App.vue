<script setup lang="ts">
import { ref } from 'vue'
import { List } from '@expcat/tigercat-vue/List'

const items = Array.from({ length: 12 }, (_, index) => ({
  key: index + 1,
  title: `列表项 ${index + 1}`,
  description: '分页数据'
}))
const pagination = ref({ current: 1, pageSize: 4 })

function onPageChange(next: { current: number; pageSize: number }): void {
  pagination.value = next
}
</script>

<template>
  <List :data-source="items" :pagination="pagination" @page-change="onPageChange" />
</template>
