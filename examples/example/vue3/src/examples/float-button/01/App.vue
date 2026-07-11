<script setup lang="ts">
import { ref } from 'vue'
import { FloatButton } from '@expcat/tigercat-vue/FloatButton'
import { FloatButtonGroup } from '@expcat/tigercat-vue/FloatButtonGroup'

const open = ref(false)
</script>

<template>
  <div class="relative h-56 rounded border">
    <FloatButtonGroup
      v-model:open="open"
      trigger="click"
      :style="{ position: 'absolute', right: '24px', bottom: '24px' }">
      <template #trigger>
        <FloatButton aria-label="打开操作组" tooltip="操作" />
      </template>
      <FloatButton type="default" aria-label="编辑" tooltip="编辑" />
      <FloatButton type="default" aria-label="分享" tooltip="分享" />
    </FloatButtonGroup>
  </div>
</template>
