<script setup lang="ts">
import { Marquee } from '@expcat/tigercat-vue/Marquee'
import { Tag } from '@expcat/tigercat-vue/Tag'
</script>

<template>
  <Marquee :duration="16000">
    <Tag>Vue</Tag>
    <Tag variant="primary">React</Tag>
    <Tag>TypeScript</Tag>
    <Tag variant="success">SSR</Tag>
    <Tag>Tailwind</Tag>
    <Tag variant="warning">a11y</Tag>
  </Marquee>
</template>
