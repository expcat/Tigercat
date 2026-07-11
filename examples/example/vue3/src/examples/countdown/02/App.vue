<script setup lang="ts">
import { ref } from 'vue'
import { Countdown } from '@expcat/tigercat-vue/Countdown'

const now = Date.now()
const status = ref('等待付款')
</script>

<template>
  <div>
    <Countdown
      title="付款保留时间"
      :value="now + 10 * 1000"
      :now="now"
      @finish="status = '订单已释放'" />
    <p class="mt-2 text-sm text-gray-500">{{ status }}</p>
  </div>
</template>
