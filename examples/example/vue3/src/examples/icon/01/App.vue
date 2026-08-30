<script setup lang="ts">
import { Icon } from '@expcat/tigercat-vue/Icon'
import { Text } from '@expcat/tigercat-vue/Text'
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <Text tag="span" color="primary">
      <Icon name="search" size="lg" />
    </Text>
    <Icon name="search" size="lg" aria-label="搜索" />
  </div>
</template>
