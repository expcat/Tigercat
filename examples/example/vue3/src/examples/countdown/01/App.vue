<script setup lang="ts">
import { Countdown } from '@expcat/tigercat-vue/Countdown'

const value = Date.now() + 26 * 60 * 60 * 1000
</script>

<template>
  <Countdown title="活动结束" :value="value" format="D HH:mm:ss" prefix="剩余 " size="lg" />
</template>
