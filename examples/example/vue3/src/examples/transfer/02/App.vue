<script setup lang="ts">
import { ref } from 'vue'
import type { TransferItem, TransferSearchValue } from '@expcat/tigercat-core'
import { Transfer } from '@expcat/tigercat-vue/Transfer'

const dataSource: TransferItem[] = [
  { key: 'auth', label: '鉴权服务', description: '核心权限' },
  { key: 'billing', label: '计费服务', description: '财务商业' },
  { key: 'search', label: '搜索服务', description: '内容检索' },
  { key: 'legacy', label: '旧版报表（只读）', description: '归档系统', disabled: true },
  { key: 'observability', label: '监控服务', description: '核心运维' }
]

const targetKeys = ref<Array<string | number>>(['observability'])
const searchValue = ref<TransferSearchValue>({})
const lastMove = ref('尚未移动项目')

const handleValue = (nextTargetKeys: Array<string | number>) => {
  const previous = new Set(targetKeys.value.map((key) => String(key)))
  const next = new Set(nextTargetKeys.map((key) => String(key)))
  const added = nextTargetKeys.filter((key) => !previous.has(String(key)))
  const removed = targetKeys.value.filter((key) => !next.has(String(key)))
  if (added.length > 0) lastMove.value = `加入：${added.join(', ')}`
  else if (removed.length > 0) lastMove.value = `移出：${removed.join(', ')}`
  targetKeys.value = nextTargetKeys
}
</script>

<template>
  <div class="space-y-3">
    <p class="text-sm text-gray-500">默认过滤会匹配名称和 description，例如搜「核心」。</p>
    <Transfer
      :model-value="targetKeys"
      v-model:search-value="searchValue"
      :data-source="dataSource"
      searchable
      size="sm"
      source-title="待分配服务"
      target-title="已启用服务"
      class="max-w-3xl"
      @update:model-value="handleValue" />
    <p role="status" class="text-sm text-gray-500">
      已选 {{ targetKeys.length }} 项；{{ lastMove }}
    </p>
  </div>
</template>
