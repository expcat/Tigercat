<script setup lang="ts">
import { ref } from 'vue'
import { Stepper } from '@expcat/tigercat-vue/Stepper'
import { FormItem } from '@expcat/tigercat-vue/FormItem'

const qty = ref(10)
</script>

<template>
  <div class="space-y-3">
    <FormItem label="步长 5">
      <Stepper v-model="qty" :min="0" :max="100" :step="5" />
    </FormItem>
    <FormItem label="禁用">
      <Stepper :model-value="5" disabled />
    </FormItem>
  </div>
</template>
