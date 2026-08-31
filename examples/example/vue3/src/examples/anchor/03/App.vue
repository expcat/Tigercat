<script setup lang="ts">
import { Anchor } from '@expcat/tigercat-vue/Anchor'
import { AnchorLink } from '@expcat/tigercat-vue/AnchorLink'
</script>

<template>
  <div class="grid gap-4 md:grid-cols-[1fr_200px]">
    <div class="space-y-3">
      <section id="guide" class="min-h-32 rounded bg-blue-50 p-4">
        <h3 class="font-semibold">指南</h3>
      </section>
      <section id="guide-install" class="min-h-32 rounded bg-blue-50/60 p-4">
        <h3 class="font-semibold">安装</h3>
      </section>
      <section id="guide-theme" class="min-h-32 rounded bg-blue-50/40 p-4">
        <h3 class="font-semibold">主题</h3>
      </section>
      <section id="api-reference" class="min-h-32 rounded bg-green-50 p-4">
        <h3 class="font-semibold">API 参考</h3>
      </section>
    </div>
    <Anchor>
      <AnchorLink href="#guide" title="指南">
        <AnchorLink href="#guide-install" title="安装" />
        <AnchorLink href="#guide-theme" title="主题" />
      </AnchorLink>
      <AnchorLink href="#api-reference" title="API 参考" />
    </Anchor>
  </div>
</template>
