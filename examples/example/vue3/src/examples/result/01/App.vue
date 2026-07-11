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
        <Result status="success" title="操作成功" sub-title="订单已提交，预计2小时内送达" />
      </div>
      <div class="border rounded-lg p-6">
        <Result status="error" title="提交失败" sub-title="请检查网络连接后重试" />
      </div>
      <div class="border rounded-lg p-6">
        <Result status="warning" title="警告提示" sub-title="当前操作存在风险" />
      </div>
      <div class="border rounded-lg p-6">
        <Result status="info" title="提示信息" sub-title="这是一条普通信息提示" />
      </div>
    </Space>
  </div>
</template>
