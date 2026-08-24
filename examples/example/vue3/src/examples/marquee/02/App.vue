<script setup lang="ts">
import { Marquee } from '@expcat/tigercat-vue/Marquee'
import { Tag } from '@expcat/tigercat-vue/Tag'
</script>

<template>
  <Marquee direction="right" :duration="18000">
    <Tag>News</Tag>
    <Tag variant="primary">Release</Tag>
    <Tag>Docs</Tag>
    <Tag variant="success">Examples</Tag>
    <Tag>Changelog</Tag>
  </Marquee>
</template>
