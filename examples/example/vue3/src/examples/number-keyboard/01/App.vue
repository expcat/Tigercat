<script setup lang="ts">
import { ref } from 'vue'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { Input } from '@expcat/tigercat-vue/Input'
import { NumberKeyboard } from '@expcat/tigercat-vue/NumberKeyboard'

const value = ref('')
const open = ref(false)
</script>

<template>
  <div class="max-w-sm space-y-3">
    <FormItem name="amount" label="金额">
      <Input
        v-model="value"
        prefix="¥"
        placeholder="输入金额"
        input-mode="none"
        @focus="open = true" />
    </FormItem>
    <NumberKeyboard
      v-model="value"
      v-model:open="open"
      mode="amount"
      :precision="2"
      @confirm="open = false" />
  </div>
</template>
