<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { List } from '@expcat/tigercat-vue/List'
import { ref } from 'vue'
import { Alert } from '@expcat/tigercat-vue/Alert'

const showAlert1 = ref(true)
const showAlert2 = ref(true)
const showAlert3 = ref(true)

const customContentItems = [
  { key: 1, title: '支持列表项' },
  { key: 2, title: '支持多种格式' },
  { key: 3, title: '支持任意 Vue 组件' }
]

const resetClosableAlerts = () => {
  showAlert1.value = true
  showAlert2.value = true
}
</script>

<template>
  <div class="min-w-0">
    <div
      class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm space-y-4 dark:border-gray-800 dark:bg-gray-900/40">
      <Alert type="info">
        <template #title>
          <strong>自定义标题内容</strong>
        </template>
        <template #description>
          <div>
            <p>这是自定义的描述内容，支持复杂的 HTML 结构：</p>
            <List
              class="mt-2 text-sm"
              bordered="none"
              :split="false"
              size="sm"
              :dataSource="customContentItems">
              <template #renderItem="{ item }">
                <div class="flex items-start gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{{ item.title }}</span>
                </div>
              </template>
            </List>
          </div>
        </template>
      </Alert>

      <Alert type="warning"> 这是通过默认插槽传入的内容 </Alert>
    </div>
  </div>
</template>
