<script setup lang="ts">
import { Card } from '@expcat/tigercat-vue/Card'
import { List } from '@expcat/tigercat-vue/List'

const items = [
  { key: 1, title: '卡片一', content: '网格内容' },
  { key: 2, title: '卡片二', content: '网格内容' },
  { key: 3, title: '卡片三', content: '网格内容' }
]
</script>

<template>
  <List :data-source="items" bordered="none" :grid="{ gutter: 16, column: 3, xs: 1, sm: 2, md: 3 }">
    <template #renderItem="{ item }">
      <Card variant="shadow">
        <h3 class="font-semibold">{{ item.title }}</h3>
        <p class="text-sm text-gray-500">{{ item.content }}</p>
      </Card>
    </template>
  </List>
</template>
