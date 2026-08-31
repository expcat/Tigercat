<script setup lang="ts">
import { ref } from 'vue'
import { ColorPicker } from '@expcat/tigercat-vue/ColorPicker'
import { FormItem } from '@expcat/tigercat-vue/FormItem'

const color = ref('rgba(37, 99, 235, 0.8)')
</script>

<template>
  <FormItem label="主题色">
    <div class="flex flex-wrap items-center gap-3">
      <ColorPicker
        v-model="color"
        show-alpha
        format="rgb"
        :presets="['#2563eb', '#0891b2', '#059669', '#dc2626']"
        size="lg" />
      <code class="text-sm text-[var(--tiger-text-muted,#6b7280)]">{{ color }}</code>
    </div>
  </FormItem>
</template>
