<script setup lang="ts">
import { computed } from 'vue'
import { DEMO_APP_TITLE, type DemoLang } from '@demo-shared/app-config'
import ThemeSwitch from './ThemeSwitch.vue'
import LanguageSwitch from './LanguageSwitch.vue'

const props = defineProps<{ lang: DemoLang; rightHint?: string }>()
const emit = defineEmits<{ (e: 'update:lang', v: DemoLang): void }>()

const title = computed(() => DEMO_APP_TITLE[props.lang])

const handleLangChange = (v: DemoLang) => {
  emit('update:lang', v)
}
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-40 h-14 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
    <div class="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
      <div class="min-w-0 flex items-baseline gap-3">
        <div class="text-base sm:text-lg font-semibold text-gray-900 truncate dark:text-gray-100">
          {{ title }}
        </div>
        <div v-if="props.rightHint" class="text-xs text-gray-500 truncate dark:text-gray-400">
          {{ props.rightHint }}
        </div>
      </div>

      <div class="flex items-center gap-3">
        <LanguageSwitch :model-value="props.lang" @update:model-value="handleLangChange" />
        <ThemeSwitch :lang="props.lang" />
      </div>
    </div>
  </header>
</template>
