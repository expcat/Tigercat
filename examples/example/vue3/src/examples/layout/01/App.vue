<script setup lang="ts">
import { Layout } from '@expcat/tigercat-vue/Layout'
import { Header } from '@expcat/tigercat-vue/Header'
import { Content } from '@expcat/tigercat-vue/Content'
import { Footer } from '@expcat/tigercat-vue/Footer'

const longCopy = Array.from(
  { length: 12 },
  (_, i) => `段落 ${i + 1}：固定高度里由 Content 自己滚动。`
).join(' ')
</script>

<template>
  <div class="space-y-4">
    <Layout class="h-56 overflow-hidden rounded border border-[var(--tiger-border)]">
      <Header>默认顶栏</Header>
      <Content>
        <p>{{ longCopy }}</p>
      </Content>
      <Footer>默认页脚</Footer>
    </Layout>
    <Layout class="h-56 overflow-hidden rounded border border-[var(--tiger-border)]">
      <Header variant="blur">玻璃顶栏</Header>
      <Content as="div">
        <p>{{ longCopy }}</p>
      </Content>
    </Layout>
  </div>
</template>
