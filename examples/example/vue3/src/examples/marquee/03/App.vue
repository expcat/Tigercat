<script setup lang="ts">
import { Marquee } from '@expcat/tigercat-vue/Marquee'
import { Tag } from '@expcat/tigercat-vue/Tag'
</script>

<template>
  <div class="flex gap-6">
    <Marquee direction="up" :duration="12000" :gap="12" aria-label="Inbox up">
      <Tag>Inbox</Tag>
      <Tag variant="primary">Mentions</Tag>
      <Tag variant="success">Shipped</Tag>
      <Tag variant="warning">Review</Tag>
      <Tag>Archive</Tag>
    </Marquee>
    <Marquee direction="down" :duration="12000" :gap="12" aria-label="Inbox down">
      <Tag>Inbox</Tag>
      <Tag variant="primary">Mentions</Tag>
      <Tag variant="success">Shipped</Tag>
      <Tag variant="warning">Review</Tag>
      <Tag>Archive</Tag>
    </Marquee>
  </div>
</template>
