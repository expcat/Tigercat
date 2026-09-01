<script setup lang="ts">
import { ref } from 'vue'
import { Spotlight } from '@expcat/tigercat-vue/Spotlight'
import type { SpotlightItem } from '@expcat/tigercat-core'

const items: SpotlightItem[] = [
  {
    key: 'settings',
    label: '打开偏好设置',
    description: '调整主题、语言和通知',
    group: '导航',
    shortcut: ['⌘', ','],
    keywords: ['config', '配置']
  },
  {
    key: 'invite',
    label: '邀请团队成员',
    description: '创建并复制邀请链接',
    group: '操作',
    shortcut: ['⌘', 'I'],
    keywords: ['member', 'team']
  },
  {
    key: 'billing',
    label: '管理账单',
    description: '当前账号没有账单管理权限',
    group: '操作',
    disabled: true,
    keywords: ['payment', 'invoice']
  }
]

const selected = ref('尚未选择命令')
</script>

<template>
  <div class="space-y-3">
    <p class="text-sm text-gray-500" aria-live="polite">
      {{ selected }}。别名走 keywords；面板打开时 ⌘ , 会选中偏好设置。
    </p>
    <Spotlight :items="items" @select="selected = `已选择：${$event.label}`" />
  </div>
</template>
