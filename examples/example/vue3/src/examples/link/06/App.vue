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
    <Link
      href="#"
      @click="
        (e: MouseEvent) => {
          e.preventDefault()
          clickCount++
        }
      ">
      点击计数：{{ clickCount }}
    </Link>
  </div>
</template>
