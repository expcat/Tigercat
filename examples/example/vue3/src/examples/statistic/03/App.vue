<script setup lang="ts">
import { Statistic } from '@expcat/tigercat-vue/Statistic'
</script>

<template>
  <div class="flex flex-wrap gap-8">
    <Statistic title="活跃用户" :value="86520" :animated="true" :group-separator="true" />
    <Statistic title="转化率" :value="92.4" :precision="1" suffix="%" />
    <Statistic title="账户余额" :value="4820.5" :precision="2" prefix="$" :group-separator="true" />
  </div>
</template>
