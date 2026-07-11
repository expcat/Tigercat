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
      <Link href="#" disabled>Disabled Primary</Link>
      <Link href="#" variant="secondary" disabled>Disabled Secondary</Link>
      <Link href="#" variant="default" disabled>Disabled Default</Link>
    </Space>
  </div>
</template>
