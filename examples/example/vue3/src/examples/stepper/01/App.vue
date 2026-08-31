<script setup lang="ts">
import { ref } from 'vue'
import { Stepper } from '@expcat/tigercat-vue/Stepper'
import { FormItem } from '@expcat/tigercat-vue/FormItem'

const value = ref(2.5)
const fine = ref(0.1)
</script>

<template>
  <div class="space-y-4">
    <FormItem label="数量">
      <Stepper v-model="value" :min="0" :max="10" :step="0.5" :precision="1" size="lg" />
    </FormItem>
    <FormItem label="步长 0.1">
      <Stepper v-model="fine" :min="0" :max="1" :step="0.1" />
    </FormItem>
  </div>
</template>
