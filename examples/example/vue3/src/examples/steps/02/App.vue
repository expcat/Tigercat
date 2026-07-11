<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Steps } from '@expcat/tigercat-vue/Steps'
import { StepsItem } from '@expcat/tigercat-vue/StepsItem'

const current = ref(0)
</script>

<template>
  <div class="space-y-4">
    <Steps :current="current" direction="vertical">
      <StepsItem title="创建订单" description="填写商品和地址" />
      <StepsItem title="确认支付" description="选择支付方式" />
      <StepsItem title="等待发货" description="查看物流进度" />
    </Steps>
    <div class="flex gap-2">
      <Button size="sm" :disabled="current === 0" @click="current -= 1">上一步</Button>
      <Button size="sm" :disabled="current === 2" @click="current += 1">下一步</Button>
    </div>
  </div>
</template>
