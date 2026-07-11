<script setup lang="ts">
import { Countdown } from '@expcat/tigercat-vue/Countdown'
import { Space } from '@expcat/tigercat-vue/Space'
import { ref } from 'vue'
import { Card } from '@expcat/tigercat-vue/Card'

const now = Date.now()
const status = ref('等待付款')
</script>

<template>
  <div class="min-w-0">
    <Card style="width: 260px">
      <Countdown
        title="付款保留时间"
        :value="now + 10 * 1000"
        :now="now"
        @finish="status = '订单已释放'" />
      <div class="mt-3 text-sm text-gray-500">{{ status }}</div>
    </Card>
  </div>
</template>
