<script setup lang="ts">
import { Code } from '@expcat/tigercat-vue/Code'

const code = 'const alpha = 1\nconst beta = 2'
</script>

<template>
  <Code :code="code" language="ts" line-numbers show-language wrap-toggle />
</template>
