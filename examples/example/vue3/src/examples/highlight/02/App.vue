<script setup lang="ts">
import { Highlight } from '@expcat/tigercat-vue/Highlight'
import { Text } from '@expcat/tigercat-vue/Text'

const keywords = ['Vue', 'React']
</script>

<template>
  <Text tag="p" size="sm">
    <Highlight text="Search Vue, React, and vue again." :keywords="keywords" />
  </Text>
</template>
