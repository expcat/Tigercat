<script setup lang="ts">
import { Statistic, Space, Card } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicSnippet = `<Space :size="32">
  <Statistic title="活跃用户" :value="112893" />
  <Statistic title="收入 (CNY)" :value="89320.5" :precision="2" />
  <Statistic title="完成率" :value="93.8" suffix="%" />
</Space>`

const affixSnippet = `<Space :size="32">
  <Statistic title="日活用户" :value="1128" prefix="↑" :group-separator="true" />
  <Statistic title="下单金额" :value="250000" prefix="¥" :group-separator="true" />
  <Statistic title="好评率" :value="98.5" suffix="%" size="lg" />
  <Statistic title="评论数" :value="42" size="sm" />
</Space>`

const cardSnippet = `<Space :size="16">
  <Card style="width: 200px">
    <Statistic title="总销量" :value="8846" :group-separator="true" />
  </Card>
  <Card style="width: 200px">
    <Statistic title="月增长" :value="12.5" suffix="%" prefix="↑" />
  </Card>
</Space>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">Statistic 统计</h1>
    <p class="text-gray-500 mb-8">展示统计数值，支持精度、前缀后缀和千分位分隔。</p>

    <DemoBlock title="基本用法" description="展示数值、精度和后缀" :code="basicSnippet">
      <Space :size="32">
        <Statistic title="活跃用户" :value="112893" />
        <Statistic title="收入 (CNY)" :value="89320.5" :precision="2" />
        <Statistic title="完成率" :value="93.8" suffix="%" />
      </Space>
    </DemoBlock>

    <DemoBlock title="前后缀与尺寸" description="prefix/suffix 和 size 控制" :code="affixSnippet">
      <Space :size="32">
        <Statistic title="日活用户" :value="1128" prefix="↑" :group-separator="true" />
        <Statistic title="下单金额" :value="250000" prefix="¥" :group-separator="true" />
        <Statistic title="好评率" :value="98.5" suffix="%" size="lg" />
        <Statistic title="评论数" :value="42" size="sm" />
      </Space>
    </DemoBlock>

    <DemoBlock title="卡片中使用" description="与 Card 组件配合使用" :code="cardSnippet">
      <Space :size="16">
        <Card style="width: 200px">
          <Statistic title="总销量" :value="8846" :group-separator="true" />
        </Card>
        <Card style="width: 200px">
          <Statistic title="月增长" :value="12.5" suffix="%" prefix="↑" />
        </Card>
      </Space>
    </DemoBlock>
  </div>
</template>
