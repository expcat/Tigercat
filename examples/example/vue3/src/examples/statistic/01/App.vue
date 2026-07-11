<script setup lang="ts">
import { Statistic } from '@expcat/tigercat-vue/Statistic'
</script>

<template>
  <Statistic
    title="本月收入"
    :value="89320.5"
    :precision="2"
    prefix="¥"
    suffix=" CNY"
    size="lg"
    :group-separator="true" />
</template>
