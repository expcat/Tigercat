<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Popover } from '@expcat/tigercat-vue/Popover'

const open = ref(false)
</script>

<template>
  <Popover
    v-model:open="open"
    trigger="manual"
    title="受控内容"
    content="显示状态完全由外部状态管理。">
    <Button @click="open = !open">{{ open ? '隐藏卡片' : '显示卡片' }}</Button>
  </Popover>
</template>
