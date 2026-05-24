<script setup lang="ts">
import { computed, ref } from 'vue'

const framework = ref<'vue3' | 'react'>('vue3')

const stackblitzUrl = computed(() => {
  const template = framework.value === 'vue3' ? 'vite-vue-ts' : 'vite-react-ts'
  return `https://stackblitz.com/fork/${template}?title=Tigercat%20${framework.value === 'vue3' ? 'Vue' : 'React'}%20Playground`
})
</script>

<template>
  <section class="tiger-playground tiger-panel">
    <div class="tiger-playground__controls" role="tablist" aria-label="Framework">
      <button type="button" :aria-selected="framework === 'vue3'" @click="framework = 'vue3'">
        Vue 3
      </button>
      <button type="button" :aria-selected="framework === 'react'" @click="framework = 'react'">
        React
      </button>
    </div>

    <pre v-if="framework === 'vue3'"><code>pnpm create tigercat my-app --template vue3
cd my-app
pnpm dev</code></pre>
    <pre v-else><code>pnpm create tigercat my-app --template react
cd my-app
pnpm dev</code></pre>

    <a class="tiger-playground__launch" :href="stackblitzUrl" target="_blank" rel="noreferrer">
      Open in StackBlitz
    </a>
  </section>
</template>

<style scoped>
.tiger-playground {
  display: grid;
  gap: 16px;
}

.tiger-playground__controls {
  display: inline-flex;
  width: fit-content;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.tiger-playground__controls button {
  min-width: 92px;
  border-radius: 6px;
  padding: 8px 12px;
  font-weight: 600;
}

.tiger-playground__controls button[aria-selected='true'] {
  color: white;
  background: var(--vp-c-brand-1);
}

.tiger-playground__launch {
  width: fit-content;
  border-radius: 6px;
  padding: 10px 14px;
  color: white;
  font-weight: 700;
  background: var(--vp-c-brand-1);
}
</style>
