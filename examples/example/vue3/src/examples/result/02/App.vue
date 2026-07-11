<script setup lang="ts">
import { ref } from 'vue'
import { Result } from '@expcat/tigercat-vue/Result'
import { Button } from '@expcat/tigercat-vue/Button'
import { Space } from '@expcat/tigercat-vue/Space'

const lastAction = ref('尚未执行操作')
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" :size="24" class="w-full">
      <div class="border rounded-lg p-6">
        <Result status="403" title="403" sub-title="抱歉，您没有权限访问此页面" />
      </div>
      <div class="border rounded-lg p-6">
        <Result status="404" title="404" sub-title="抱歉，您访问的页面不存在" />
      </div>
      <div class="border rounded-lg p-6">
        <Result status="500" title="500" sub-title="服务器出错了，请稍后重试" />
      </div>
    </Space>
  </div>
</template>
