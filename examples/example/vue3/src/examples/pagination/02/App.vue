<script setup lang="ts">
import { ref } from 'vue'
import { Pagination } from '@expcat/tigercat-vue/Pagination'

const current = ref(1)
const labels = {
  totalText: '共 {total} 条记录',
  itemsPerPageText: '条/页',
  jumpToText: '跳至',
  pageText: '页',
  prevPageAriaLabel: '上一页',
  nextPageAriaLabel: '下一页'
}
</script>

<template>
  <Pagination v-model:current="current" :total="96" :labels="labels" show-quick-jumper />
</template>
