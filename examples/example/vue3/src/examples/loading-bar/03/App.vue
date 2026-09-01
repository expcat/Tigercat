<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { LoadingBar } from '@expcat/tigercat-vue'

const startCustom = () => {
  LoadingBar.start({
    color: 'success',
    height: 4,
    className: 'demo-loading-bar'
  })
}

const startPlain = () => {
  LoadingBar.start()
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Button variant="primary" @click="startCustom">自定义颜色与高度</Button>
    <Button variant="secondary" @click="startPlain">再次 start 不传选项</Button>
    <Button variant="secondary" @click="LoadingBar.set(40)">定到 40%</Button>
    <Button variant="secondary" @click="LoadingBar.finish()">完成</Button>
    <Button @click="LoadingBar.clear()">立即清除</Button>
  </div>
</template>
