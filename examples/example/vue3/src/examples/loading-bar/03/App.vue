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

const finishBar = () => {
  LoadingBar.finish()
}

const clearBar = () => {
  LoadingBar.clear()
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Button variant="primary" @click="startCustom">自定义颜色与高度</Button>
    <Button variant="secondary" @click="finishBar">完成</Button>
    <Button @click="clearBar">立即清除</Button>
  </div>
</template>
