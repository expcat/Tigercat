<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { Result } from '@expcat/tigercat-vue/Result'
</script>

<template>
  <Result status="success" title="提交成功" sub-title="订单已经进入处理队列">
    <template #extra>
      <Button variant="primary">查看订单</Button>
    </template>
  </Result>
</template>
