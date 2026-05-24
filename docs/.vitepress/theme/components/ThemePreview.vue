<script setup lang="ts">
import { computed, ref } from 'vue'

const themes = [
  { name: 'Default', primary: '#2563eb', surface: '#ffffff', text: '#111827' },
  { name: 'Forest', primary: '#166534', surface: '#f7fee7', text: '#14210f' },
  { name: 'Civic', primary: '#0f766e', surface: '#f8fafc', text: '#0f172a' },
  { name: 'High Contrast', primary: '#000000', surface: '#ffffff', text: '#000000' },
  { name: 'Warm', primary: '#b45309', surface: '#fff7ed', text: '#1f2937' },
  { name: 'Night', primary: '#38bdf8', surface: '#0f172a', text: '#e5e7eb' }
]

const active = ref(themes[0])

const style = computed(() => ({
  '--tiger-primary': active.value.primary,
  '--tiger-surface': active.value.surface,
  '--tiger-text': active.value.text
}))
</script>

<template>
  <section class="tiger-theme tiger-panel" :style="style">
    <div class="tiger-theme__swatches" aria-label="Theme presets">
      <button
        v-for="theme in themes"
        :key="theme.name"
        type="button"
        :aria-pressed="active.name === theme.name"
        :title="theme.name"
        @click="active = theme">
        <span :style="{ background: theme.primary }" />
        {{ theme.name }}
      </button>
    </div>

    <div class="tiger-theme__preview">
      <div>
        <strong>{{ active.name }}</strong>
        <p>Primary {{ active.primary }} · Surface {{ active.surface }}</p>
      </div>
      <button type="button">Primary Action</button>
    </div>
  </section>
</template>

<style scoped>
.tiger-theme {
  display: grid;
  gap: 18px;
}

.tiger-theme__swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tiger-theme__swatches button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 8px 10px;
}

.tiger-theme__swatches button[aria-pressed='true'] {
  border-color: var(--tiger-primary);
}

.tiger-theme__swatches span {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.tiger-theme__preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid color-mix(in srgb, var(--tiger-primary), transparent 55%);
  border-radius: 8px;
  padding: 18px;
  color: var(--tiger-text);
  background: var(--tiger-surface);
}

.tiger-theme__preview p {
  margin: 4px 0 0;
}

.tiger-theme__preview button {
  border-radius: 6px;
  padding: 10px 14px;
  color: white;
  background: var(--tiger-primary);
}
</style>
