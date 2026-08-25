<script setup lang="ts">
import { QRCode } from '@expcat/tigercat-vue/QRCode'
</script>

<template>
  <div class="flex flex-wrap items-end gap-6">
    <QRCode value="https://tigercat.dev" :size="96" />
    <QRCode value="https://tigercat.dev" :size="128" />
    <QRCode value="https://tigercat.dev" :size="160" />
  </div>
</template>
