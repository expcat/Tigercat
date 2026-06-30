<template>
  <div class="max-w-6xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">OrgChart 组织结构图</h1>
    <p class="text-gray-500 mb-8">
      基于 Tree 数据结构生成 SVG 组织结构图，支持选中、悬停和方向切换。
    </p>

    <DemoBlock
      title="组合展示"
      description="合并展示基础用法、横向布局，减少重复示例块。"
      :code="fullPageSnippet">
      <div class="space-y-6">
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            树形组织数据，节点自动居中到子树范围。
          </p>
          <div class="space-y-4">
            <OrgChart
              :data="orgData"
              :width="760"
              :height="460"
              hoverable
              selectable
              :selected-id="selectedId"
              title="Organization chart"
              desc="Company reporting structure"
              @update:selected-id="(id: string | number | null) => (selectedId = id)" />
            <div class="rounded border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              当前选择：{{ selectedId ?? '未选择' }}
            </div>
          </div>
        </section>
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">横向布局</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            direction='horizontal' 将层级从左向右展开。
          </p>
          <OrgChart :data="orgData" direction="horizontal" :width="760" :height="460" hoverable />
        </section>
      </div>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { OrgChart } from '@expcat/tigercat-vue/OrgChart'
import type { OrgChartNode } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './OrgChartDemo.vue?raw'

const selectedId = ref<string | number | null>(null)

const orgData: OrgChartNode = {
  id: 'ceo',
  label: 'Ada Chen',
  title: 'Chief Executive Officer',
  subtitle: 'Global',
  color: '#2563eb',
  children: [
    {
      id: 'product',
      label: 'Lin Wu',
      title: 'Product',
      subtitle: 'Growth',
      color: '#10b981',
      children: [
        { id: 'design', label: 'Mira', title: 'Design Lead', color: '#f59e0b' },
        { id: 'research', label: 'Noor', title: 'Research', color: '#06b6d4' }
      ]
    },
    {
      id: 'engineering',
      label: 'Iris Park',
      title: 'Engineering',
      subtitle: 'Platform',
      color: '#8b5cf6',
      children: [
        { id: 'frontend', label: 'Kai', title: 'Frontend', color: '#ef4444' },
        { id: 'infra', label: 'Rin', title: 'Infrastructure', color: '#64748b' }
      ]
    }
  ]
}
</script>
