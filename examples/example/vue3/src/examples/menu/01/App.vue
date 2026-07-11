<script setup lang="ts">
import { ref } from 'vue'
import { Menu } from '@expcat/tigercat-vue/Menu'
import type { MenuItem as MenuItemData } from '@expcat/tigercat-core'

const items: MenuItemData[] = [
  { key: 'home', label: '首页' },
  {
    key: 'products',
    label: '产品',
    children: [
      { key: 'components', label: '组件库' },
      { key: 'templates', label: '模板' }
    ]
  },
  { key: 'settings', label: '设置', disabled: true }
]

const selectedKeys = ref<(string | number)[]>(['home'])
const openKeys = ref<(string | number)[]>(['products'])
</script>

<template>
  <Menu
    v-model:selectedKeys="selectedKeys"
    v-model:openKeys="openKeys"
    :items="items"
    mode="inline"
    searchable
    search-placeholder="搜索菜单" />
</template>
