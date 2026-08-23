<script setup lang="ts">
import { Marquee } from '@expcat/tigercat-vue/Marquee'
import { Tag } from '@expcat/tigercat-vue/Tag'
</script>

<template>
  <Marquee class="h-40" direction="up" :duration="12000" :gap="12">
    <Tag>Inbox</Tag>
    <Tag variant="primary">Mentions</Tag>
    <Tag variant="success">Shipped</Tag>
    <Tag variant="warning">Review</Tag>
    <Tag>Archive</Tag>
  </Marquee>
</template>
