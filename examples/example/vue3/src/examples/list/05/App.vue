<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { List } from '@expcat/tigercat-vue/List'

const loading = ref(true)
const empty = ref(false)
const items = [
  { key: 1, title: '已有数据 1' },
  { key: 2, title: '已有数据 2' }
]
</script>

<template>
  <div class="space-y-3">
    <div class="flex gap-2">
      <Button size="sm" @click="loading = !loading">切换加载</Button>
      <Button size="sm" @click="empty = !empty">切换空态</Button>
    </div>
    <List :data-source="empty ? [] : items" :loading="loading" empty-text="暂无数据" />
  </div>
</template>
