<script setup lang="ts">
import { ref } from 'vue'
import { QRCode } from '@expcat/tigercat-vue/QRCode'

const nonce = ref(0)
</script>

<template>
  <div class="flex flex-wrap gap-6">
    <div class="text-center">
      <QRCode value="https://tigercat.dev" :size="120" color="#7c3aed" bg-color="#f5f3ff" />
      <p class="mt-1 text-xs text-gray-500">自定义配色</p>
    </div>
    <div class="text-center">
      <QRCode
        :value="`https://tigercat.dev?n=${nonce}`"
        :size="120"
        status="expired"
        @refresh="nonce += 1" />
      <p class="mt-1 text-xs text-gray-500">status="expired"</p>
    </div>
    <div class="text-center">
      <QRCode value="https://tigercat.dev" :size="120" status="loading" />
      <p class="mt-1 text-xs text-gray-500">status="loading"</p>
    </div>
  </div>
</template>
