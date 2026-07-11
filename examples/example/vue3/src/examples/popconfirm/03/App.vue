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
      <Space>
        <Popconfirm
          v-model:open="visible1"
          title="确定要执行此操作吗？"
          @confirm="
            () => {
              handleConfirm()
              visible1 = false
            }
          "
          @cancel="
            () => {
              handleCancel()
              visible1 = false
            }
          ">
          <Button>受控弹窗</Button>
        </Popconfirm>

        <Button @click="visible1 = true"> 外部控制打开 </Button>
      </Space>
    </div>
  </div>
</template>
