<script setup lang="ts">
import { Text } from '@expcat/tigercat-vue/Text'

const colors = ['primary', 'secondary', 'success', 'warning', 'danger', 'muted'] as const
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap gap-4">
      <Text v-for="color in colors" :key="color" tag="span" weight="medium" :color="color">{{ color }}</Text>
    </div>
    <div class="flex flex-wrap gap-4">
      <Text tag="span" :underline="true">下划线</Text>
      <Text tag="span" :italic="true">斜体</Text>
      <Text tag="span" :line-through="true" color="muted">删除线</Text>
    </div>
    <div class="max-w-xs">
      <Text :truncate="true">truncate：这是一段很长很长的文本，超出容器宽度时会以省略号结尾而不换行。</Text>
    </div>
  </div>
</template>
