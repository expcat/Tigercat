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
    <Space :size="32">
      <Countdown title="活动结束" :value="now + 2 * 60 * 60 * 1000" :now="now" />
      <Countdown title="发售倒计时" :value="now + 15 * 60 * 1000" :now="now" format="mm:ss" />
    </Space>
  </div>
</template>
