<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Spotlight } from '@expcat/tigercat-vue/Spotlight'
import type { SpotlightItem } from '@expcat/tigercat-vue'

const items: SpotlightItem[] = [
  {
    key: 'dashboard',
    label: '打开仪表盘',
    group: '导航',
    keywords: ['home'],
    shortcut: ['⌘', 'D']
  },
  { key: 'invite', label: '邀请成员', group: '操作', keywords: ['team'] }
]

const open = ref(false)
const selected = ref('')
</script>

<template>
  <div class="space-y-3">
    <p class="text-sm text-gray-500">按 Ctrl/⌘ K 打开。页内按钮只是补充通道。</p>
    <Button @click="open = true">打开命令面板</Button>
    <p v-if="selected" class="text-sm text-gray-500">已选择：{{ selected }}</p>
    <Spotlight v-model:open="open" :items="items" @select="selected = $event.label" />
  </div>
</template>
