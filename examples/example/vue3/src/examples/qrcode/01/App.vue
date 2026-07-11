<script setup lang="ts">
import { QRCode } from '@expcat/tigercat-vue/QRCode'
</script>

<template>
  <QRCode
    value="https://github.com/exp-codes/tigercat"
    :size="160"
    color="#2563eb"
    bg-color="#eff6ff"
    level="H" />
</template>
