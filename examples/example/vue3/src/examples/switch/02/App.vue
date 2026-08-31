<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from '@expcat/tigercat-vue/Switch'

const on = ref(true)
const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
  <div class="flex items-center gap-6">
    <Switch v-for="size in sizes" :key="size" v-model="on" :size="size">
      {{ size }}
    </Switch>
  </div>
</template>
