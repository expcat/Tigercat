<script setup lang="ts">
import { ref } from 'vue'
import { SplitButton } from '@expcat/tigercat-vue/SplitButton'
import { DropdownItem } from '@expcat/tigercat-vue/DropdownItem'
import { DropdownMenu } from '@expcat/tigercat-vue/DropdownMenu'

const lastAction = ref('尚未操作')
</script>

<template>
  <div class="space-y-3">
    <SplitButton @click="lastAction = '保存'">
      保存
      <DropdownMenu>
        <DropdownItem @click="lastAction = '存为草稿'">存为草稿</DropdownItem>
        <DropdownItem @click="lastAction = '保存并发布'">保存并发布</DropdownItem>
      </DropdownMenu>
    </SplitButton>
    <p class="text-sm text-gray-500">最近操作：{{ lastAction }}</p>
  </div>
</template>
