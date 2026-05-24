<script setup lang="ts">
import { computed, ref } from 'vue'
import figmaVariables from '../../../../packages/core/tokens/figma-variables.json'

type FigmaColorValue = {
  r: number
  g: number
  b: number
  a: number
}

type FigmaVariable = {
  name: string
  type: 'COLOR' | 'STRING'
  cssVariable: string
  value: string | FigmaColorValue
  reference?: string
}

type FigmaCollection = {
  name: string
  mode: string
  variables: FigmaVariable[]
}

const collections = figmaVariables.collections as FigmaCollection[]
const activeCollection = ref(collections[0]?.name ?? '')

const active = computed(
  () =>
    collections.find((collection) => collection.name === activeCollection.value) ?? collections[0]
)

const collectionStats = computed(() =>
  collections.map((collection) => ({
    name: collection.name,
    count: collection.variables.length,
    colorCount: collection.variables.filter((variable) => variable.type === 'COLOR').length,
    referencedCount: collection.variables.filter((variable) => variable.reference).length
  }))
)

function toColor(value: string | FigmaColorValue): string | undefined {
  if (typeof value === 'string') return undefined
  const r = Math.round(value.r * 255)
  const g = Math.round(value.g * 255)
  const b = Math.round(value.b * 255)
  return `rgba(${r}, ${g}, ${b}, ${value.a})`
}

function formatValue(variable: FigmaVariable): string {
  const color = toColor(variable.value)
  if (color) return color
  return String(variable.value)
}
</script>

<template>
  <section class="tiger-token-explorer">
    <div class="tiger-token-summary" aria-label="Token collection summary">
      <button
        v-for="stat in collectionStats"
        :key="stat.name"
        type="button"
        :aria-pressed="active?.name === stat.name"
        @click="activeCollection = stat.name">
        <span>{{ stat.name.replace('Tigercat ', '') }}</span>
        <strong>{{ stat.count }}</strong>
        <small>{{ stat.colorCount }} colors · {{ stat.referencedCount }} refs</small>
      </button>
    </div>

    <div class="tiger-token-table-wrap">
      <table class="tiger-token-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Value</th>
            <th>CSS Variable</th>
            <th>Reference</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="variable in active?.variables" :key="variable.name">
            <td>
              <code>{{ variable.name }}</code>
            </td>
            <td class="tiger-token-value">
              <span
                v-if="toColor(variable.value)"
                class="tiger-token-swatch"
                :style="{ background: toColor(variable.value) }"
                aria-hidden="true" />
              <code>{{ formatValue(variable) }}</code>
            </td>
            <td>
              <code>{{ variable.cssVariable }}</code>
            </td>
            <td>
              <code v-if="variable.reference">{{ variable.reference }}</code>
              <span v-else class="tiger-token-empty">Source</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.tiger-token-explorer {
  display: grid;
  gap: 16px;
}

.tiger-token-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.tiger-token-summary button {
  display: grid;
  gap: 4px;
  min-height: 86px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 12px;
  text-align: left;
  background: var(--vp-c-bg-soft);
}

.tiger-token-summary button[aria-pressed='true'] {
  border-color: var(--vp-c-brand-1);
  box-shadow: inset 0 0 0 1px var(--vp-c-brand-1);
}

.tiger-token-summary strong {
  font-size: 24px;
  line-height: 1;
}

.tiger-token-summary small,
.tiger-token-empty {
  color: var(--vp-c-text-2);
}

.tiger-token-table-wrap {
  max-height: 640px;
  overflow: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.tiger-token-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.tiger-token-table th,
.tiger-token-table td {
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 10px 12px;
  text-align: left;
  vertical-align: middle;
}

.tiger-token-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--vp-c-bg-soft);
}

.tiger-token-value {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tiger-token-swatch {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
}

.tiger-token-table code {
  white-space: nowrap;
}

@media (max-width: 760px) {
  .tiger-token-table-wrap {
    max-height: none;
  }
}
</style>
