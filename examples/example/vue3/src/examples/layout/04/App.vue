<script setup lang="ts">
import { Layout } from '@expcat/tigercat-vue/Layout'
import { Header } from '@expcat/tigercat-vue/Header'
import { Content } from '@expcat/tigercat-vue/Content'
import { Footer } from '@expcat/tigercat-vue/Footer'

const longCopy = Array.from(
  { length: 10 },
  (_, i) => `段落 ${i + 1}：这段会跟着 Content 一起滚。`
).join(' ')
</script>

<template>
  <div class="space-y-4">
    <Layout class="h-48 overflow-hidden rounded border border-[var(--tiger-border)]">
      <Header>随内容滚动</Header>
      <Content as="div">
        <p>{{ longCopy }}</p>
        <Footer size="compact">© Tigercat · 紧凑页脚在 Content 内</Footer>
      </Content>
    </Layout>
    <Layout class="h-48 overflow-hidden rounded border border-[var(--tiger-border)]">
      <Header>固定页脚</Header>
      <Content as="div">
        <p>{{ longCopy }}</p>
      </Content>
      <Footer size="compact">© Tigercat · 紧凑固定页脚</Footer>
    </Layout>
  </div>
</template>
