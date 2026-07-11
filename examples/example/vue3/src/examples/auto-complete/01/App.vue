<script setup lang="ts">
import { ref } from 'vue'
import { AutoComplete } from '@expcat/tigercat-vue/AutoComplete'

const val = ref('')
const val2 = ref('')
const allOptions = ['React', 'Vue', 'Angular', 'Svelte', 'Solid', 'Preact', 'Next.js', 'Nuxt'].map(
  (o) => ({ label: o, value: o })
)
</script>

<template>
  <div class="min-w-0">
    <AutoComplete v-model="val" :options="allOptions" placeholder="请输入搜索内容" />
  </div>
</template>
