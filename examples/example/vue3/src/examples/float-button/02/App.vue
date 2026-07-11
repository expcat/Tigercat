<script setup lang="ts">
import { ref } from 'vue'
import { FloatButton } from '@expcat/tigercat-vue/FloatButton'
import { FloatButtonGroup } from '@expcat/tigercat-vue/FloatButtonGroup'

const lastAction = ref('尚未点击悬浮按钮')
</script>

<template>
  <div class="min-w-0">
    <FloatButton
      floating
      placement="bottom-right"
      :offset="24"
      tooltip="客服"
      aria-label="客服入口"
      @click="lastAction = '已打开客服入口'" />
  </div>
</template>
