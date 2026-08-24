<script setup lang="ts">
import { Highlight } from '@expcat/tigercat-vue/Highlight'
import { Text } from '@expcat/tigercat-vue/Text'

const orderId = /#\d+/
</script>

<template>
  <div class="space-y-2">
    <Text tag="p" size="sm">
      <Highlight text="Order #42 ships on 2026-08-23, follow-up #7." :keywords="orderId" />
    </Text>
    <Text tag="p" size="sm">
      <Highlight
        text="Vue then vue then VUE"
        keywords="Vue"
        :case-sensitive="true"
        :global="false" />
    </Text>
  </div>
</template>
