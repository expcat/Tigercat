<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@expcat/tigercat-vue/Input'
import { NumberKeyboard } from '@expcat/tigercat-vue/NumberKeyboard'

const value = ref('')
</script>

<template>
  <div class="max-w-sm space-y-3">
    <Input v-model="value" readonly placeholder="身份证号" />
    <NumberKeyboard v-model="value" mode="id-card" confirm-text="完成" delete-text="退格" />
  </div>
</template>
