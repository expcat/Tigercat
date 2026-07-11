<script setup lang="ts">
import { computed, ref } from 'vue'
import { List } from '@expcat/tigercat-vue/List'
import { Pagination } from '@expcat/tigercat-vue/Pagination'

const items = Array.from({ length: 12 }, (_, index) => ({
  key: index + 1,
  title: `列表项 ${index + 1}`,
  description: '分页数据'
}))
const page = ref(1)
const pageSize = 4
const visible = computed(() => items.slice((page.value - 1) * pageSize, page.value * pageSize))
</script>

<template>
  <div class="space-y-3">
    <List :data-source="visible" />
    <Pagination v-model:current="page" :page-size="pageSize" :total="items.length" />
  </div>
</template>
