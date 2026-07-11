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
      <Rate v-model="val3" character="♥" />
      <Rate :model-value="4" :count="10" disabled />
      <Rate :model-value="3" disabled />
    </Space>
  </div>
</template>
