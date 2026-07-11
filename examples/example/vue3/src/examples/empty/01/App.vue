<script setup lang="ts">
import { ref } from 'vue'
import { Empty } from '@expcat/tigercat-vue/Empty'
import { Button } from '@expcat/tigercat-vue/Button'
import { Space } from '@expcat/tigercat-vue/Space'

const lastAction = ref('尚未执行操作')
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" :size="24" class="w-full">
      <div class="border rounded-lg p-6">
        <Empty />
      </div>
      <div class="border rounded-lg p-6">
        <Empty preset="no-data" description="暂无数据" />
      </div>
      <div class="border rounded-lg p-6">
        <Empty preset="no-results" description="未找到匹配结果" />
      </div>
      <div class="border rounded-lg p-6">
        <Empty preset="error" description="加载出错了" />
      </div>
    </Space>
  </div>
</template>
