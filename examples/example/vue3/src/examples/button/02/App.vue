<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'

const clickCount = ref(0)
</script>

<template>
  <Button html-type="button" variant="outline" @click="clickCount++">
    已点击 {{ clickCount }} 次
  </Button>
</template>
