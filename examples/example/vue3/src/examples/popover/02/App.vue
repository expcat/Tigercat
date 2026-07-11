<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { Space } from '@expcat/tigercat-vue/Space'
import { List } from '@expcat/tigercat-vue/List'
import { ref } from 'vue'
import { Popover } from '@expcat/tigercat-vue/Popover'

const visible1 = ref(false)
const manualVisible = ref(false)

const customContentItems = [
  { key: 1, title: '列表项 1' },
  { key: 2, title: '列表项 2' },
  { key: 3, title: '列表项 3' }
]
</script>

<template>
  <div class="min-w-0">
    <div class="p-6 bg-gray-50 rounded-lg">
      <Space>
        <Popover v-model:open="visible1" title="受控气泡卡片" content="通过外部状态控制显示">
          <Button>受控气泡卡片</Button>
        </Popover>

        <Button @click="visible1 = !visible1">
          {{ visible1 ? '隐藏' : '显示' }}
        </Button>
      </Space>
    </div>
  </div>
</template>
