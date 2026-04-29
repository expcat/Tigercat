<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Switch } from '@expcat/tigercat-vue'
import { applyDarkMode, getStoredDarkMode, setStoredDarkMode } from '@demo-shared/prefs'
import type { DemoLang } from '@demo-shared/app-config'

const props = defineProps<{ lang?: DemoLang }>()

const lang = computed<DemoLang>(() => props.lang ?? 'zh-CN')
const enabled = ref(getStoredDarkMode())

const handleChange = (next: boolean) => {
  enabled.value = next
  setStoredDarkMode(next)
  applyDarkMode(next)
}

onMounted(() => {
  applyDarkMode(enabled.value)
})
</script>

<template>
  <div class="flex items-center gap-2 shrink-0">
    <span class="text-sm font-medium text-gray-700 whitespace-nowrap shrink-0 dark:text-gray-200">
      {{ lang === 'zh-CN' ? '暗色：' : 'Dark:' }}
    </span>
    <Switch :checked="enabled"
            size="sm"
            @update:checked="handleChange" />
  </div>
</template>
