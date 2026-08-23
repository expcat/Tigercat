<script setup lang="ts">
import { ref } from 'vue'
import { ContextMenu } from '@expcat/tigercat-vue/ContextMenu'
import { ContextMenuItem } from '@expcat/tigercat-vue/ContextMenuItem'
import { ContextMenuMenu } from '@expcat/tigercat-vue/ContextMenuMenu'

const lastAction = ref('尚未选择')
</script>

<template>
  <div class="space-y-3">
    <ContextMenu>
      <div
        class="flex h-32 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-600">
        在此区域右键
      </div>
      <ContextMenuMenu>
        <ContextMenuItem @click="lastAction = '复制'">复制</ContextMenuItem>
        <ContextMenuItem @click="lastAction = '粘贴'">粘贴</ContextMenuItem>
        <ContextMenuItem disabled>不可用</ContextMenuItem>
        <ContextMenuItem divided @click="lastAction = '删除'">删除</ContextMenuItem>
      </ContextMenuMenu>
    </ContextMenu>
    <p class="text-sm text-gray-500">最近操作：{{ lastAction }}</p>
  </div>
</template>
