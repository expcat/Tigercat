<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@expcat/tigercat-vue/Input'
import { NumberKeyboard } from '@expcat/tigercat-vue/NumberKeyboard'

const value = ref('')
const open = ref(false)
</script>

<template>
  <div class="max-w-sm space-y-3">
    <Input v-model="value" placeholder="手机号" input-mode="none" @focus="open = true" />
    <NumberKeyboard v-model="value" v-model:open="open" mode="phone" @confirm="open = false" />
  </div>
</template>
