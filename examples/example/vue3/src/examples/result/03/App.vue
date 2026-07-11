<script setup lang="ts">
import { ref } from 'vue'
import { Result } from '@expcat/tigercat-vue/Result'
import { Button } from '@expcat/tigercat-vue/Button'
import { Space } from '@expcat/tigercat-vue/Space'

const lastAction = ref('尚未执行操作')
</script>

<template>
  <div class="min-w-0">
    <div class="border rounded-lg p-6">
      <Result status="success" title="购买成功">
        <template #extra>
          <Space>
            <Button variant="primary" @click="lastAction = '已选择返回首页'">返回首页</Button>
            <Button variant="secondary" @click="lastAction = '正在查看订单详情'"> 查看订单 </Button>
          </Space>
        </template>
      </Result>
      <p class="mt-3 text-center text-sm text-gray-600 dark:text-gray-300" role="status">
        操作反馈：{{ lastAction }}
      </p>
    </div>
  </div>
</template>
