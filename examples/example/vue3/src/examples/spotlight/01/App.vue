<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Spotlight } from '@expcat/tigercat-vue/Spotlight'
import type { SpotlightItem } from '@expcat/tigercat-vue'

const items: SpotlightItem[] = [
  { key: 'dashboard', label: '打开仪表盘', group: '导航', keywords: ['home'] },
  { key: 'invite', label: '邀请成员', group: '操作', keywords: ['team'] }
]

const open = ref(false)
const query = ref('')
const selected = ref('')
</script>

<template>
  <div class="space-y-3">
    <Button @click="open = true">打开命令面板</Button>
    <p v-if="selected" class="text-sm text-gray-500">已选择：{{ selected }}</p>
    <Spotlight
      v-model:open="open"
      v-model:query="query"
      :items="items"
      title="命令面板"
      placeholder="搜索页面或操作"
      @select="selected = $event.label" />
  </div>
</template>
