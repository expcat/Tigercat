<script setup lang="ts">
import { ref } from 'vue'
import { Anchor } from '@expcat/tigercat-vue/Anchor'
import { AnchorLink } from '@expcat/tigercat-vue/AnchorLink'

const containerRef = ref<HTMLElement | null>(null)
const getContainer = () => containerRef.value ?? window
</script>

<template>
  <div class="grid gap-4 md:grid-cols-[1fr_160px]">
    <div ref="containerRef" class="h-64 overflow-auto rounded border">
      <section id="anchor-audit" class="h-52 bg-blue-50 p-4">审计</section>
      <section id="anchor-release" class="h-52 bg-green-50 p-4">发布</section>
    </div>
    <Anchor :affix="false" :get-container="getContainer">
      <AnchorLink href="#anchor-audit" title="审计" />
      <AnchorLink href="#anchor-release" title="发布" />
    </Anchor>
  </div>
</template>
