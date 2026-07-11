<script setup lang="ts">
import { Anchor } from '@expcat/tigercat-vue/Anchor'
import { AnchorLink } from '@expcat/tigercat-vue/AnchorLink'
</script>

<template>
  <div class="grid gap-4 md:grid-cols-[1fr_160px]">
    <div class="space-y-3">
      <section id="anchor-overview" class="min-h-32 rounded bg-blue-50 p-4">
        <h3 class="font-semibold">概览</h3>
      </section>
      <section id="anchor-api" class="min-h-32 rounded bg-green-50 p-4">
        <h3 class="font-semibold">API</h3>
      </section>
    </div>
    <Anchor :affix="false" direction="vertical">
      <AnchorLink href="#anchor-overview" title="概览" />
      <AnchorLink href="#anchor-api" title="API" />
    </Anchor>
  </div>
</template>
