<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Popconfirm } from '@expcat/tigercat-vue/Popconfirm'

const result = ref('等待操作')
</script>

<template>
  <div class="space-y-3">
    <Popconfirm
      title="删除这条记录？"
      description="删除后无法恢复。"
      ok-type="danger"
      ok-text="删除"
      @confirm="result = '已删除'"
      @cancel="result = '已取消'">
      <Button variant="secondary">删除记录</Button>
    </Popconfirm>
    <p class="text-sm text-gray-500" role="status">{{ result }}</p>
  </div>
</template>
