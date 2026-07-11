<script setup lang="ts">
import { Statistic } from '@expcat/tigercat-vue/Statistic'
import { Space } from '@expcat/tigercat-vue/Space'
import { Card } from '@expcat/tigercat-vue/Card'
</script>

<template>
  <div class="min-w-0">
    <Space :size="32">
      <Statistic title="活跃用户" :value="112893" />
      <Statistic title="收入 (CNY)" :value="89320.5" :precision="2" />
      <Statistic title="完成率" :value="93.8" suffix="%" />
    </Space>
  </div>
</template>
