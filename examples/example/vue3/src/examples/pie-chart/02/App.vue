<script setup lang="ts">
import { PieChart } from '@expcat/tigercat-vue/PieChart'
import type { PieChartDatum } from '@expcat/tigercat-vue'

const data: PieChartDatum[] = [
  { value: 40, label: '产品 A', color: '#5470c6' },
  { value: 28, label: '产品 B', color: '#91cc75' },
  { value: 22, label: '产品 C', color: '#fac858' },
  { value: 15, label: '产品 D', color: '#ee6666' }
]

const halfStart = -Math.PI / 2
const halfEnd = Math.PI / 2
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <div>
      <p class="mb-1 text-sm text-gray-500">innerRadius + padAngle + 描边</p>
      <PieChart
        :data="data"
        :width="280"
        :height="220"
        :inner-radius="45"
        :pad-angle="0.04"
        :border-width="2"
        border-color="#ffffff" />
    </div>
    <div>
      <p class="mb-1 text-sm text-gray-500">startAngle/endAngle 半圆扇形</p>
      <PieChart
        :data="data"
        :width="280"
        :height="220"
        :start-angle="halfStart"
        :end-angle="halfEnd"
        :pad-angle="0.02" />
    </div>
  </div>
</template>
