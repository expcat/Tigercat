<script setup lang="ts">
import { ref } from 'vue'
import { Link } from '@expcat/tigercat-vue/Link'

const clickCount = ref(0)
</script>

<template>
  <Link href="#" variant="secondary" :underline="false" @click.prevent="clickCount++">
    点击计数：{{ clickCount }}
  </Link>
</template>
