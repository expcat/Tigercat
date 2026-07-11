<script setup lang="ts">
import { Countdown } from '@expcat/tigercat-vue/Countdown'

const now = Date.now()
</script>

<template>
  <Countdown
    title="活动结束"
    :value="now + 26 * 60 * 60 * 1000"
    :now="now"
    format="D 天 HH:mm:ss"
    prefix="剩余 "
    size="lg" />
</template>
