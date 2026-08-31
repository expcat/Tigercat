<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from '@expcat/tigercat-vue/Switch'

const enabled = ref(true)
</script>

<template>
  <Switch v-model="enabled" size="lg">启用自动更新</Switch>
</template>
