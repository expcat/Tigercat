<script setup lang="ts">
import { Statistic } from '@expcat/tigercat-vue/Statistic'
import { Space } from '@expcat/tigercat-vue/Space'
import { Card } from '@expcat/tigercat-vue/Card'
</script>

<template>
  <div class="min-w-0">
    <Space :size="16">
      <Card style="width: 200px">
        <Statistic title="总销量" :value="8846" :group-separator="true" />
      </Card>
      <Card style="width: 200px">
        <Statistic title="月增长" :value="12.5" suffix="%" prefix="↑" />
      </Card>
    </Space>
  </div>
</template>
