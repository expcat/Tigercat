<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
</script>

<template>
  <div class="min-w-0">
    <div class="p-6 bg-gray-50 rounded-lg">
      <div class="max-w-md">
        <Space wrap size="sm" class="w-full">
          <div v-for="i in 14" :key="i" class="bg-slate-700 text-white px-3 py-2 rounded">
            Tag {{ i }}
          </div>
        </Space>
      </div>
    </div>
  </div>
</template>
