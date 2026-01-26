<script setup lang="ts">
import { PieChart, type PieChartDatum } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicData: PieChartDatum[] = [
    { value: 40, label: 'A' },
    { value: 25, label: 'B' },
    { value: 20, label: 'C' },
    { value: 15, label: 'D' }
]

const donutData: PieChartDatum[] = [
    { value: 320, label: 'Q1' },
    { value: 280, label: 'Q2' },
    { value: 360, label: 'Q3' },
    { value: 420, label: 'Q4' }
]

const basicSnippet = `<PieChart
  :data="data"
  :width="320"
  :height="220"
  :show-labels="true"
/>`

const donutSnippet = `<PieChart
  :data="donutData"
  :width="320"
  :height="220"
  :inner-radius="60"
  :pad-angle="0.02"
  :show-labels="true"
/>`
</script>

<template>
    <div class="max-w-5xl mx-auto p-8">
        <div class="mb-8">
            <h1 class="text-3xl font-bold mb-2">PieChart 饼图</h1>
            <p class="text-gray-600">用于展示分类占比。</p>
        </div>

        <DemoBlock title="基础用法"
                   description="默认饼图与标签。"
                   :code="basicSnippet">
            <PieChart :data="basicData"
                      :width="320"
                      :height="220"
                      :show-labels="true" />
        </DemoBlock>

        <DemoBlock title="环形图"
                   description="通过内半径渲染环形图。"
                   :code="donutSnippet">
            <PieChart :data="donutData"
                      :width="320"
                      :height="220"
                      :inner-radius="60"
                      :pad-angle="0.02"
                      :show-labels="true" />
        </DemoBlock>
    </div>
</template>
