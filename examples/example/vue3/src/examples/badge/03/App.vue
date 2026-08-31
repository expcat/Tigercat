<script setup lang="ts">
import { ref } from 'vue'
import { Badge } from '@expcat/tigercat-vue/Badge'
import { Button } from '@expcat/tigercat-vue/Button'

const count = ref(5)
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <Badge :content="count" :standalone="false" position="bottom-right" variant="danger">
      <Button variant="outline" :aria-label="`消息 ${count} 条`">消息</Button>
    </Badge>
    <Button size="sm" variant="ghost" @click="count = 0">清零</Button>
    <div dir="rtl">
      <Badge :content="3" :standalone="false" position="top-right">
        <Button variant="outline" aria-label="通知 3 条">通知</Button>
      </Badge>
    </div>
  </div>
</template>
