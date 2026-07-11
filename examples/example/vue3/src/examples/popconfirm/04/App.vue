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
    <div class="space-y-6">
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">隐藏图标</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Popconfirm
            title="确定要继续吗？"
            :show-icon="false"
            @confirm="lastAction = '已确认继续'">
            <Button>无图标</Button>
          </Popconfirm>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">禁用状态</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Popconfirm title="此操作已禁用" :disabled="true">
              <Button variant="secondary" disabled>禁用按钮</Button>
            </Popconfirm>

            <Popconfirm title="Popconfirm 已禁用" :disabled="true">
              <Button>按钮未禁用</Button>
            </Popconfirm>
          </Space>
        </div>
      </div>
    </div>
  </div>
</template>
