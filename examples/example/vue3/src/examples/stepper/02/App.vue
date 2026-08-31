<script setup lang="ts">
import { ref } from 'vue'
import { Stepper } from '@expcat/tigercat-vue/Stepper'
import { FormItem } from '@expcat/tigercat-vue/FormItem'

const value = ref(3)
const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
  <div class="space-y-3">
    <FormItem v-for="size in sizes" :key="size" :label="size">
      <Stepper v-model="value" :size="size" />
    </FormItem>
  </div>
</template>
