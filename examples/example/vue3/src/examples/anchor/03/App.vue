<script setup lang="ts">
import { Anchor } from '@expcat/tigercat-vue/Anchor'
import { AnchorLink } from '@expcat/tigercat-vue/AnchorLink'
</script>

<template>
  <Anchor :affix="false" show-ink-in-fixed>
    <AnchorLink href="#guide" title="指南">
      <AnchorLink href="#guide-install" title="安装" />
      <AnchorLink href="#guide-theme" title="主题" />
    </AnchorLink>
    <AnchorLink href="#api-reference" title="API 参考" />
  </Anchor>
</template>
