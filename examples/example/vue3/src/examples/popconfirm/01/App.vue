<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { Space } from '@expcat/tigercat-vue/Space'
import { ref } from 'vue'
import { Popconfirm } from '@expcat/tigercat-vue/Popconfirm'

const visible1 = ref(false)
const lastAction = ref('尚未确认或取消操作')

const handleConfirm = () => {
  lastAction.value = '已确认删除记录'
}

const handleCancel = () => {
  lastAction.value = '已取消操作'
}
</script>

<template>
  <div class="min-w-0">
    <div class="p-6 bg-gray-50 rounded-lg">
      <Popconfirm title="确定要删除这条记录吗？" @confirm="handleConfirm" @cancel="handleCancel">
        <Button variant="secondary">删除</Button>
      </Popconfirm>
      <p class="mt-3 text-sm text-gray-600 dark:text-gray-300" role="status">
        操作反馈：{{ lastAction }}
      </p>
    </div>
  </div>
</template>
