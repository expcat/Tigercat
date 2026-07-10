<script setup lang="ts">
import { computed } from 'vue'
import { DEMO_APP_TITLE, type DemoLang } from '@demo-shared/app-config'
import { Button } from '@expcat/tigercat-vue/Button'
import ThemeSwitch from './ThemeSwitch.vue'
import DarkModeSwitch from './DarkModeSwitch.vue'
import ModernStyleSwitch from './ModernStyleSwitch.vue'
import LanguageSwitch from './LanguageSwitch.vue'

const props = defineProps<{
  lang: DemoLang
  isSiderCollapsed: boolean
  isMobile: boolean
  isCompactHeader: boolean
  rightHint?: string
}>()
const emit = defineEmits<{
  (e: 'update:lang', v: DemoLang): void
  (e: 'toggle-sider'): void
}>()

const title = computed(() => DEMO_APP_TITLE[props.lang])
const siderLabel = computed(() => {
  if (props.isMobile) {
    if (props.lang === 'zh-CN') return '打开菜单'
    return 'Open menu'
  }
  if (props.lang === 'zh-CN') return props.isSiderCollapsed ? '展开侧边栏' : '收起侧边栏'
  return props.isSiderCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
})

const siderIcon = computed(() => {
  if (props.isMobile) return '☰'
  return props.isSiderCollapsed ? '»' : '«'
})
const settingsLabel = computed(() => (props.lang === 'zh-CN' ? '设置' : 'Settings'))

const handleLangChange = (v: DemoLang) => {
  emit('update:lang', v)
}
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-40 h-14 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
    <div class="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
      <div class="min-w-0 flex items-baseline gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          :aria-label="siderLabel"
          class="size-8 p-0 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900"
          @click="emit('toggle-sider')">
          <span class="text-sm leading-none">{{ siderIcon }}</span>
        </Button>
        <router-link
          to="/"
          :aria-label="title"
          class="text-base sm:text-lg font-semibold text-gray-900 truncate dark:text-gray-100 hover:text-[var(--tiger-primary,#2563eb)]">
          {{ title }}
        </router-link>
        <div
          v-if="props.rightHint"
          class="hidden text-xs text-gray-500 truncate dark:text-gray-400 sm:block">
          {{ props.rightHint }}
        </div>
      </div>

      <div v-if="!props.isCompactHeader" class="hidden items-center gap-3 sm:flex">
        <LanguageSwitch :model-value="props.lang" @update:model-value="handleLangChange" />
        <ThemeSwitch :lang="props.lang" />
        <ModernStyleSwitch :lang="props.lang" />
        <DarkModeSwitch :lang="props.lang" />
      </div>

      <details v-else class="relative shrink-0 sm:hidden">
        <summary
          class="flex size-8 cursor-pointer list-none select-none items-center justify-center rounded-[var(--tiger-radius-md,0.5rem)] border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900 [&::-webkit-details-marker]:hidden">
          <span aria-hidden="true" class="text-base leading-none">⚙</span>
          <span class="sr-only">{{ settingsLabel }}</span>
        </summary>
        <div
          class="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-[var(--tiger-radius-md,0.5rem)] border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-950">
          <div class="flex flex-col gap-3">
            <LanguageSwitch :model-value="props.lang" @update:model-value="handleLangChange" />
            <ThemeSwitch :lang="props.lang" />
            <ModernStyleSwitch :lang="props.lang" />
            <DarkModeSwitch :lang="props.lang" />
          </div>
        </div>
      </details>
    </div>
  </header>
</template>
