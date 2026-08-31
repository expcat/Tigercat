<script setup lang="ts">
import { ref } from 'vue'
import { Menu } from '@expcat/tigercat-vue/Menu'
import { MenuItem } from '@expcat/tigercat-vue/MenuItem'
import { SubMenu } from '@expcat/tigercat-vue/SubMenu'

const selectedKeys = ref<Array<string | number>>(['overview'])
</script>

<template>
  <Menu v-model:selected-keys="selectedKeys" mode="horizontal" aria-label="顶栏">
    <MenuItem item-key="overview" href="#overview">概览</MenuItem>
    <SubMenu item-key="team" title="团队">
      <MenuItem item-key="members">成员</MenuItem>
      <MenuItem item-key="roles">角色</MenuItem>
    </SubMenu>
    <MenuItem item-key="help">帮助</MenuItem>
  </Menu>
</template>
