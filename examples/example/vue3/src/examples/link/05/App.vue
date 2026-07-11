<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { ref } from 'vue'
import { Link } from '@expcat/tigercat-vue/Link'

const clickCount = ref(0)

const handlePreventNavigate = (event: MouseEvent) => {
  event.preventDefault()
}
</script>

<template>
  <div class="min-w-0">
    <Space>
      <Link href="https://github.com" target="_blank">GitHub（自动添加 rel）</Link>
      <Link href="https://example.com" target="_blank" rel="nofollow">自定义 rel</Link>
    </Space>
  </div>
</template>
