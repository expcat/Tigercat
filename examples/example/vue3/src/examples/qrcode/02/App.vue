<script setup lang="ts">
import { QRCode } from '@expcat/tigercat-vue/QRCode'

const levels = ['L', 'M', 'Q', 'H'] as const
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end gap-6">
      <QRCode value="https://tigercat.dev" :size="96" />
      <QRCode value="https://tigercat.dev" :size="128" />
      <QRCode value="https://tigercat.dev" :size="160" />
    </div>
    <div class="flex flex-wrap gap-6">
      <div v-for="level in levels" :key="level" class="text-center">
        <QRCode value="https://tigercat.dev" :size="96" :level="level" />
        <p class="mt-1 text-xs text-gray-500">level={{ level }}</p>
      </div>
    </div>
  </div>
</template>
