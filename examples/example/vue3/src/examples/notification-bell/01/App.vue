<script setup lang="ts">
import { ref } from 'vue'
import { NotificationBell } from '@expcat/tigercat-vue/NotificationBell'
import type { NotificationItem } from '@expcat/tigercat-core'

const items = ref<NotificationItem[]>([
  { id: '1', title: '审批通过', read: false },
  { id: '2', title: '周报已读', read: true }
])

function onItemReadChange(item: NotificationItem, read: boolean) {
  items.value = items.value.map((entry) => (entry.id === item.id ? { ...entry, read } : entry))
}
</script>

<template>
  <NotificationBell :items="items" @item-read-change="onItemReadChange" />
</template>
