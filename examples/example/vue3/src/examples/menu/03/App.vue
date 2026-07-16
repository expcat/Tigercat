<script setup lang="ts">
import { ref } from 'vue'
import { Menu } from '@expcat/tigercat-vue/Menu'
import { MenuItem } from '@expcat/tigercat-vue/MenuItem'
import { MenuItemGroup } from '@expcat/tigercat-vue/MenuItemGroup'
import { SubMenu } from '@expcat/tigercat-vue/SubMenu'

const selectedKeys = ref<Array<string | number>>(['overview'])
const openKeys = ref<Array<string | number>>(['settings'])
</script>

<template>
  <div style="max-width: 320px">
    <Menu v-model:selected-keys="selectedKeys" v-model:open-keys="openKeys" mode="inline">
      <MenuItem item-key="overview">概览</MenuItem>
      <MenuItemGroup title="团队">
        <MenuItem item-key="members">成员</MenuItem>
        <SubMenu item-key="settings" title="设置">
          <MenuItem item-key="profile">个人资料</MenuItem>
          <MenuItem item-key="security">安全设置</MenuItem>
        </SubMenu>
      </MenuItemGroup>
    </Menu>
    <p role="status" style="margin: 12px 0 0">当前选择：{{ selectedKeys.join(', ') || '无' }}</p>
  </div>
</template>
