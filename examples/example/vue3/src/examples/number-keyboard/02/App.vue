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
      <Input v-model="phone" readonly placeholder="手机号" />
      <NumberKeyboard v-model="phone" mode="phone" confirm-text="完成" delete-text="退格" />
    </div>
  </div>
</template>
