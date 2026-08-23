<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { PageHeader } from '@expcat/tigercat-vue/PageHeader'

const lastAction = ref('尚未操作')
</script>

<template>
  <div class="space-y-3">
    <PageHeader
      show-back
      title="订单详情"
      sub-title="SO-20260823-018"
      @back="lastAction = '返回列表'">
      <template #actions>
        <Button variant="outline" size="sm" @click="lastAction = '取消'">取消</Button>
        <Button size="sm" @click="lastAction = '保存'">保存</Button>
      </template>
    </PageHeader>
    <p class="text-sm text-gray-500">最近操作：{{ lastAction }}</p>
  </div>
</template>
