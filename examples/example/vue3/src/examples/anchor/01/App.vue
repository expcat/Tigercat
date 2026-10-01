<script setup lang="ts">
import { ref } from 'vue'
import { Anchor } from '@expcat/tigercat-vue/Anchor'
import { AnchorLink } from '@expcat/tigercat-vue/AnchorLink'

const active = ref('')
</script>

<template>
  <div class="space-y-2">
    <p class="text-xs text-[var(--tiger-text-secondary)]">
      当前 {{ active || '（滚动或点锚点）' }}
    </p>
    <div id="anchor-doc" class="h-80 overflow-auto rounded border">
      <div class="grid grid-cols-[minmax(0,1fr)_9rem] gap-4 p-4">
        <div class="space-y-4">
          <section id="anchor-overview" class="min-h-96 rounded bg-[var(--tiger-primary)]/10 p-4">
            <h3 class="font-semibold">概览</h3>
            <p class="mt-2 text-sm text-[var(--tiger-text-secondary)]">
              这一节高于滚动区，下一节在视口外。
            </p>
          </section>
          <section id="anchor-api" class="min-h-96 rounded bg-[var(--tiger-success)]/10 p-4">
            <h3 class="font-semibold">API</h3>
            <p class="mt-2 text-sm text-[var(--tiger-text-secondary)]">
              点「API」应滚到这里，并高亮该项。
            </p>
          </section>
          <section id="anchor-more" class="min-h-96 rounded bg-[var(--tiger-warning)]/10 p-4">
            <h3 class="font-semibold">更多</h3>
            <p class="mt-2 text-sm text-[var(--tiger-text-secondary)]">
              继续下滚，墨水跟到「更多」。
            </p>
          </section>
        </div>
        <div class="self-start">
          <Anchor get-container="#anchor-doc" :offset-top="8" @change="active = $event">
            <AnchorLink href="#anchor-overview" title="概览" />
            <AnchorLink href="#anchor-api" title="API" />
            <AnchorLink href="#anchor-more" title="更多" />
          </Anchor>
        </div>
      </div>
    </div>
  </div>
</template>
