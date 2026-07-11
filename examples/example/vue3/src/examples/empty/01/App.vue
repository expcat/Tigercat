<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { Empty } from '@expcat/tigercat-vue/Empty'
</script>

<template>
  <Empty preset="no-results" description="没有匹配的搜索结果">
    <template #extra>
      <Button variant="primary">清除筛选</Button>
    </template>
  </Empty>
</template>
