<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@expcat/tigercat-vue/Input'
import { NumberKeyboard } from '@expcat/tigercat-vue/NumberKeyboard'

const value = ref('')
</script>

<template>
  <div class="max-w-sm space-y-3">
    <Input v-model="value" readonly prefix="¥" placeholder="输入金额" />
    <NumberKeyboard v-model="value" mode="amount" confirm-text="完成" delete-text="退格" />
  </div>
</template>
