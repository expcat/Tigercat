<script setup lang="ts">
import { ref } from 'vue'
import { SplitButton } from '@expcat/tigercat-vue/SplitButton'
import { DropdownItem } from '@expcat/tigercat-vue/DropdownItem'
import { DropdownMenu } from '@expcat/tigercat-vue/DropdownMenu'

const open = ref(false)
</script>

<template>
  <div class="space-y-3">
    <SplitButton
      danger
      trigger-aria-label="更多删除选项"
      :open="open"
      @update:open="open = $event"
      @click="open = false">
      删除
      <DropdownMenu>
        <DropdownItem @click="open = false">删除所选</DropdownItem>
        <DropdownItem divided @click="open = false">清空全部</DropdownItem>
      </DropdownMenu>
    </SplitButton>
    <p class="text-sm text-gray-500">菜单状态：{{ open ? '已打开' : '已关闭' }}</p>
  </div>
</template>
