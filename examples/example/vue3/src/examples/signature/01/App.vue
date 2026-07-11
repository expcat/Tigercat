<script setup lang="ts">
import { ref } from 'vue'
import type { SignatureChangePayload } from '@expcat/tigercat-core'
import { Signature } from '@expcat/tigercat-vue/Signature'

const signed = ref(false)
const handleChange = (payload: SignatureChangePayload) => {
  signed.value = !payload.empty
}
</script>

<template>
  <div class="space-y-2">
    <Signature
      :width="420"
      :height="180"
      pen-color="#0f766e"
      :line-width="3"
      export-type="image/svg+xml"
      aria-label="合同签名"
      clear-text="清空"
      @change="handleChange" />
    <p class="text-sm text-gray-600 dark:text-gray-300">
      {{ signed ? '签名已记录' : '等待签名' }}
    </p>
  </div>
</template>
