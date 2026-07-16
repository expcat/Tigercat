<script setup lang="ts">
import { ref } from 'vue'
import type { TransferDirection, TransferItem, TransferSearchValue } from '@expcat/tigercat-core'
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

const filterOption = (inputValue: string, item: TransferItem) => {
  const keywords = `${item.label} ${item.description ?? ''}`.toLowerCase()
  return keywords.includes(inputValue.trim().toLowerCase())
}

const handleChange = (
  nextTargetKeys: Array<string | number>,
  direction: TransferDirection,
  movedKeys: Array<string | number>
) => {
  targetKeys.value = nextTargetKeys
  lastMove.value = `${direction === 'right' ? '加入' : '移出'}：${movedKeys.join(', ')}`
}
</script>

<template>
  <div class="space-y-3">
    <p class="text-sm text-gray-500">搜索“核心”可同时匹配名称和 description。</p>
    <Transfer
      v-model="targetKeys"
      v-model:search-value="searchValue"
      :data-source="dataSource"
      :filter-option="filterOption"
      searchable
      size="sm"
      source-title="待分配服务"
      target-title="已启用服务"
      class="max-w-3xl"
      @change="handleChange" />
    <p role="status" class="text-sm text-gray-500">
      已选 {{ targetKeys.length }} 项；{{ lastMove }}
    </p>
  </div>
</template>
