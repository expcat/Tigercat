<script setup lang="ts">
import { Statistic } from '@expcat/tigercat-vue/Statistic'
import { Space } from '@expcat/tigercat-vue/Space'
import { Card } from '@expcat/tigercat-vue/Card'
</script>

<template>
  <div class="min-w-0">
    <Space :size="32">
      <Statistic title="日活用户" :value="1128" prefix="↑" :group-separator="true" />
      <Statistic title="下单金额" :value="250000" prefix="¥" :group-separator="true" />
      <Statistic title="好评率" :value="98.5" suffix="%" size="lg" />
      <Statistic title="评论数" :value="42" size="sm" />
    </Space>
  </div>
</template>
