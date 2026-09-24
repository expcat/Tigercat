<script setup lang="ts">
import { Dropdown } from '@expcat/tigercat-vue/Dropdown'

const items = [
  { key: 'edit', label: '编辑', shortcut: 'E' },
  { key: 'pin', type: 'checkbox' as const, label: '固定', checked: true },
  { key: 'drop', type: 'danger' as const, label: '删除' }
]
</script>

<template>
  <Dropdown :items="items">操作</Dropdown>
</template>
