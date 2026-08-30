<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Marquee } from '@expcat/tigercat-vue/Marquee'
import { Tag } from '@expcat/tigercat-vue/Tag'

const paused = ref(false)
</script>

<template>
  <div class="flex flex-col gap-3">
    <Button @click="paused = !paused">{{ paused ? 'Play' : 'Pause' }}</Button>
    <Marquee direction="right" :duration="18000" :paused="paused" aria-label="Release ticker">
      <Tag>News</Tag>
      <Tag variant="primary">Release</Tag>
      <Button>Docs</Button>
      <Tag variant="success">Examples</Tag>
      <Tag>Changelog</Tag>
    </Marquee>
  </div>
</template>
