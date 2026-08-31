<script setup lang="ts">
import { ref } from 'vue'
import { List } from '@expcat/tigercat-vue/List'

const items = Array.from({ length: 12 }, (_, index) => ({
  key: index + 1,
  title: `列表项 ${index + 1}`,
  description: '分页数据'
}))
const page = ref(1)

function onPageChange(next: { current: number }): void {
  page.value = next.current
}
</script>

<template>
  <List
    :data-source="items"
    :pagination="{ current: page, pageSize: 4 }"
    @page-change="onPageChange" />
</template>
