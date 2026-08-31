<script setup lang="ts">
import { ref } from 'vue'
import { Countdown } from '@expcat/tigercat-vue/Countdown'

const status = ref('等待付款')
const due = Date.now() + 10 * 1000
const elapsed = Date.now() - 1000
</script>

<template>
  <div class="space-y-4">
    <div>
      <Countdown title="付款保留时间" :value="due" @finish="status = '订单已释放'" />
      <p class="mt-2 text-sm text-gray-500">{{ status }}</p>
    </div>
    <Countdown title="已到期" :value="elapsed" />
  </div>
</template>
