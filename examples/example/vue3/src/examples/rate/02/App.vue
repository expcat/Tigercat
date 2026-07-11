<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { Text } from '@expcat/tigercat-vue/Text'
import { ref } from 'vue'
import { Rate } from '@expcat/tigercat-vue/Rate'

const val1 = ref(3)
const val2 = ref(2.5)
const val3 = ref(4)
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" :size="12">
      <Rate :model-value="3" size="sm" disabled />
      <Rate :model-value="3" size="md" disabled />
      <Rate :model-value="3" size="lg" disabled />
    </Space>
  </div>
</template>
