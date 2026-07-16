<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { Empty } from '@expcat/tigercat-vue/Empty'
</script>

<template>
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
    <Empty :show-image="false" description="精简模式：隐藏插图，仅保留文字说明。" />
    <Empty preset="no-data" description="还没有任何数据，先创建一条吧">
      <template #extra>
        <div class="flex justify-center gap-2">
          <Button variant="primary" size="sm">新建</Button>
          <Button variant="outline" size="sm">导入</Button>
        </div>
      </template>
    </Empty>
  </div>
</template>
