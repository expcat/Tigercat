<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Menu } from '@expcat/tigercat-vue/Menu'
import type { MenuItem as MenuItemData } from '@expcat/tigercat-core'

const items: MenuItemData[] = [
  { key: 'dashboard', label: '仪表盘' },
  {
    key: 'team',
    label: '团队',
    children: [
      { key: 'members', label: '成员' },
      { key: 'roles', label: '角色' }
    ]
  }
]

const collapsed = ref(true)
</script>

<template>
  <div class="space-y-3">
    <Button size="sm" @click="collapsed = !collapsed">
      {{ collapsed ? '展开菜单' : '收起菜单' }}
    </Button>
    <Menu
      :items="items"
      mode="inline"
      theme="dark"
      :collapsed="collapsed"
      :default-selected-keys="['dashboard']" />
  </div>
</template>
