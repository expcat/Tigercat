<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Dropdown } from '@expcat/tigercat-vue/Dropdown'
import { DropdownItem } from '@expcat/tigercat-vue/DropdownItem'
import { DropdownMenu } from '@expcat/tigercat-vue/DropdownMenu'

const open = ref(false)
</script>

<template>
  <div class="space-y-3">
    <Dropdown v-model:open="open" trigger="click">
      <Button>{{ open ? '关闭菜单' : '打开菜单' }}</Button>
      <DropdownMenu>
        <DropdownItem @click="open = false">保存并关闭</DropdownItem>
        <DropdownItem :close-on-click="false">保持展开</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <p class="text-sm text-gray-500">受控状态：{{ open ? '已打开' : '已关闭' }}</p>
  </div>
</template>
