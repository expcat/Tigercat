<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { Marquee } from '@expcat/tigercat-vue/Marquee'
import { Tag } from '@expcat/tigercat-vue/Tag'
</script>

<template>
  <Marquee :duration="16000" aria-label="Framework ticker">
    <Tag>Vue</Tag>
    <Tag variant="primary">React</Tag>
    <Tag>TypeScript</Tag>
    <Button>Docs</Button>
    <Tag>Tailwind</Tag>
    <Tag variant="warning">a11y</Tag>
  </Marquee>
</template>
