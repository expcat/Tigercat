<script setup lang="ts">
import { Highlight } from '@expcat/tigercat-vue/Highlight'
import { Link } from '@expcat/tigercat-vue/Link'
import { Text } from '@expcat/tigercat-vue/Text'

const orderId = /#\d+/
const keywords = ['Vue', 'React']
</script>

<template>
  <div class="space-y-2">
    <Text tag="p" size="sm">
      <Highlight text="Order #42 ships on 2026-08-23, follow-up #7." :keywords="orderId" />
    </Text>
    <Text tag="p" size="sm">
      <Highlight
        text="Vue and React, then Vue and React again."
        :keywords="keywords"
        :global="false" />
    </Text>
    <Text tag="p" size="sm">
      <Highlight keywords="Vue">
        Learn
        <Link href="https://vuejs.org">Vue</Link>
        today
      </Highlight>
    </Text>
  </div>
</template>
