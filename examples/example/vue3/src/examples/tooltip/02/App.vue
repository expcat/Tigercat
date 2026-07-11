<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { Space } from '@expcat/tigercat-vue/Space'
import { ref } from 'vue'
import { Tooltip } from '@expcat/tigercat-vue/Tooltip'

const visible1 = ref(false)
</script>

<template>
  <div class="min-w-0">
    <Space :size="16">
      <Tooltip v-model:open="visible1" content="受控的气泡提示">
        <Button>受控提示</Button>
      </Tooltip>

      <Button @click="visible1 = !visible1">
        {{ visible1 ? '隐藏' : '显示' }}
      </Button>
    </Space>
  </div>
</template>
