<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { List } from '@expcat/tigercat-vue/List'

const products = [
  { key: 1, name: '基础套餐', price: '¥99', stock: 15 },
  { key: 2, name: '专业套餐', price: '¥199', stock: 8 }
]
</script>

<template>
  <List :data-source="products" hoverable>
    <template #renderItem="{ item }">
      <div class="flex w-full items-center justify-between">
        <div>
          <div class="font-medium">{{ item.name }}</div>
          <div class="text-sm text-gray-500">库存：{{ item.stock }}</div>
        </div>
        <Button size="sm">{{ item.price }} 购买</Button>
      </div>
    </template>
  </List>
</template>
