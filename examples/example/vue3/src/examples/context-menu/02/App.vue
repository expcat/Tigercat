<script setup lang="ts">
import { ref } from 'vue'
import { ContextMenu } from '@expcat/tigercat-vue/ContextMenu'
import { ContextMenuItem } from '@expcat/tigercat-vue/ContextMenuItem'
import { ContextMenuMenu } from '@expcat/tigercat-vue/ContextMenuMenu'
import { ContextMenuSub } from '@expcat/tigercat-vue/ContextMenuSub'

const lastAction = ref('尚未选择')
</script>

<template>
  <div class="space-y-3">
    <ContextMenu>
      <div
        class="flex h-32 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-600">
        右键打开带有子菜单的面板
      </div>
      <ContextMenuMenu>
        <ContextMenuItem @click="lastAction = '刷新'">刷新</ContextMenuItem>
        <ContextMenuSub title="分享到">
          <ContextMenuItem @click="lastAction = '邮件'">邮件</ContextMenuItem>
          <ContextMenuItem @click="lastAction = '链接'">链接</ContextMenuItem>
        </ContextMenuSub>
        <ContextMenuItem divided @click="lastAction = '下载'">下载</ContextMenuItem>
      </ContextMenuMenu>
    </ContextMenu>
    <p class="text-sm text-gray-500">最近操作：{{ lastAction }}</p>
  </div>
</template>
