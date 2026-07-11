<script setup lang="ts">
import { DropdownMenu } from '@expcat/tigercat-vue/DropdownMenu'
import { DropdownItem } from '@expcat/tigercat-vue/DropdownItem'
import { Button } from '@expcat/tigercat-vue/Button'
import { ref } from 'vue'
import { Dropdown } from '@expcat/tigercat-vue/Dropdown'

const visible1 = ref(false)
const lastCommand = ref('尚未选择操作')

const handleCommand = (command: string) => {
  const labels: Record<string, string> = { edit: '编辑', copy: '复制', delete: '删除' }
  lastCommand.value = labels[command] ?? command
}
</script>

<template>
  <div class="min-w-0">
    <div class="flex gap-4 items-center">
      <Dropdown v-model:open="visible1">
        <Button>受控下拉菜单</Button>
        <DropdownMenu>
          <DropdownItem>菜单项 1</DropdownItem>
          <DropdownItem>菜单项 2</DropdownItem>
          <DropdownItem>菜单项 3</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Button @click="visible1 = !visible1"> {{ visible1 ? '关闭' : '打开' }}下拉菜单 </Button>
    </div>
  </div>
</template>
