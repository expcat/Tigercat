<script setup lang="ts">
import { ref } from 'vue'
import { Dropdown } from '@expcat/tigercat-vue/Dropdown'
import { DropdownItem } from '@expcat/tigercat-vue/DropdownItem'
import { DropdownMenu } from '@expcat/tigercat-vue/DropdownMenu'

const lastAction = ref('尚未选择')
</script>

<template>
  <div class="space-y-3">
    <Dropdown>
      操作
      <DropdownMenu>
        <DropdownItem @click="lastAction = '编辑'">编辑</DropdownItem>
        <DropdownItem @click="lastAction = '复制'">复制</DropdownItem>
        <DropdownItem disabled>不可用</DropdownItem>
        <DropdownItem divided @click="lastAction = '删除'">删除</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <p class="text-sm text-gray-500">最近操作：{{ lastAction }}</p>
  </div>
</template>
