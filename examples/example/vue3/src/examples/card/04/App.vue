<script setup lang="ts">
import { Card } from '@expcat/tigercat-vue/Card'
import { Button } from '@expcat/tigercat-vue/Button'

const cover = 'https://picsum.photos/seed/tiger-card/480/192'
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <Card variant="shadow">
      <template #cover>
        <img :src="cover" alt="" />
      </template>
      <template #header>
        <h3 class="font-semibold">封面与操作</h3>
      </template>
      <p class="text-sm text-gray-600 dark:text-gray-300">封面走节点；点查看/分享不会点到卡片。</p>
      <template #actions>
        <div class="flex gap-2">
          <Button variant="primary" size="sm">查看</Button>
          <Button variant="ghost" size="sm">分享</Button>
        </div>
      </template>
    </Card>
    <Card variant="bordered" direction="horizontal" :cover="cover" cover-alt="">
      <h3 class="font-semibold">横向布局</h3>
      <p class="text-sm text-gray-600 dark:text-gray-300">
        封面在 inline-start（LTR 左侧，RTL 右侧）。
      </p>
    </Card>
    <div dir="rtl" class="sm:col-span-2">
      <Card variant="bordered" direction="horizontal" :cover="cover" cover-alt="">
        <h3 class="font-semibold">RTL</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300">dir=rtl 时封面在右侧。</p>
      </Card>
    </div>
  </div>
</template>
