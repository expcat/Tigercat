<script setup lang="ts">
import { ref } from 'vue'
import { Menu } from '@expcat/tigercat-vue/Menu'
import type { MenuItem as MenuItemData } from '@expcat/tigercat-core'

const items: MenuItemData[] = [
  { key: 'home', label: '首页', href: '#home' },
  {
    key: 'products',
    label: '产品',
    children: [
      { key: 'components', label: '组件库', href: '#components' },
      { key: 'templates', label: '模板', href: '#templates' }
    ]
  },
  { key: 'settings', label: '设置', disabled: true }
]

const selectedKeys = ref<(string | number)[]>(['home'])
</script>

<template>
  <Menu
    v-model:selected-keys="selectedKeys"
    :items="items"
    :default-open-keys="['products']"
    aria-label="站点" />
</template>
