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
    <div class="space-y-3">
      <Dropdown>
        <Button>操作</Button>
        <DropdownMenu>
          <DropdownItem @click="handleCommand('edit')">编辑</DropdownItem>
          <DropdownItem @click="handleCommand('copy')">复制</DropdownItem>
          <DropdownItem @click="handleCommand('delete')" divided>删除</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <p class="text-sm text-gray-600 dark:text-gray-300" role="status">
        最近操作：{{ lastCommand }}
      </p>
    </div>
  </div>
</template>
