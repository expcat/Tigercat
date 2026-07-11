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
    <Space direction="vertical" :size="16">
      <Rate v-model="val1" />
      <Rate v-model="val2" allow-half />
      <Text>当前值: {{ val2 }}</Text>
    </Space>
  </div>
</template>
