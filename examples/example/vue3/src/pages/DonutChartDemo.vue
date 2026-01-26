<script setup lang="ts">
import { DonutChart, type DonutChartDatum } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicData: DonutChartDatum[] = [
    { value: 40, label: 'A' },
    { value: 25, label: 'B' },
    { value: 20, label: 'C' },
    { value: 15, label: 'D' }
]

const donutSnippet = `<DonutChart
  :data="data"
  :width="320"
  :height="220"
  :inner-radius-ratio="0.55"
  :pad-angle="0.02"
  :show-labels="true"
/>`
</script>

<template>
    <div class="max-w-5xl mx-auto p-8">
        <div class="mb-8">
            <h1 class="text-3xl font-bold mb-2">DonutChart 环形图</h1>
            <p class="text-gray-600">用于展示分类占比的环形图。</p>
        </div>

        <DemoBlock title="基础用法"
                   description="默认环形图与标签。"
                   :code="donutSnippet">
            <DonutChart :data="basicData"
                        :width="320"
                        :height="220"
                        :inner-radius-ratio="0.55"
                        :pad-angle="0.02"
                        :show-labels="true" />
        </DemoBlock>
    </div>
</template>
