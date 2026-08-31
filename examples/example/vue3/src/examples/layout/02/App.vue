<script setup lang="ts">
import { Container } from '@expcat/tigercat-vue/Container'

const box =
  'rounded border border-[var(--tiger-border)] bg-[var(--tiger-surface-muted)] p-3 text-sm'
</script>

<template>
  <div class="space-y-3">
    <Container :max-width="false" :class-name="box">
      maxWidth=false：无 max-width，仍 width 100%
    </Container>
    <Container max-width="full" :class-name="box"> maxWidth="full"：max-width 100% </Container>
    <Container max-width="lg" :class-name="box">
      maxWidth="lg"：max-width 跟 --tiger-breakpoint-lg
    </Container>
    <Container max-width="lg" :padding="false" :center="false" :class-name="box">
      padding 与 center 都关掉
    </Container>
  </div>
</template>
