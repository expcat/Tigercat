<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { List } from '@expcat/tigercat-vue/List'

const loading = ref(true)
</script>

<template>
  <div class="space-y-3">
    <Button size="sm" @click="loading = !loading">切换加载/空态</Button>
    <List :data-source="[]" :loading="loading" empty-text="暂无数据" />
  </div>
</template>
