<script setup lang="ts">
import { NumberKeyboard } from '@expcat/tigercat-vue/NumberKeyboard'
import { ref } from 'vue'
import { Input } from '@expcat/tigercat-vue/Input'

const amount = ref('')
const phone = ref('')
const idCard = ref('')
const confirmed = ref('')
</script>

<template>
  <div class="min-w-0">
    <div class="max-w-sm space-y-3">
      <Input v-model="amount" readonly prefix="¥" placeholder="输入金额" />
      <NumberKeyboard
        v-model="amount"
        mode="amount"
        confirm-text="完成"
        delete-text="退格"
        @confirm="(value: string) => (confirmed = value)" />
      <p class="text-sm text-gray-500">{{ confirmed ? `已确认：¥${confirmed}` : '未确认' }}</p>
    </div>
  </div>
</template>
