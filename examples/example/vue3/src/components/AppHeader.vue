<script setup lang="ts">
import { computed } from 'vue'
import { DEMO_APP_TITLE, type DemoLang } from '@demo-shared/app-config'
import { Button } from '@expcat/tigercat-vue'
import ThemeSwitch from './ThemeSwitch.vue'
import LanguageSwitch from './LanguageSwitch.vue'

const props = defineProps<{ lang: DemoLang; isSiderCollapsed: boolean; isMobile: boolean; rightHint?: string }>()
const emit = defineEmits<{
  (e: 'update:lang', v: DemoLang): void
  (e: 'toggle-sider'): void
}>()

const title = computed(() => DEMO_APP_TITLE[props.lang])
const siderLabel = computed(() => {
  if (props.isMobile) {
    if (props.lang === 'zh-CN') return props.isSiderCollapsed ? '打开菜单' : '关闭菜单'
    return props.isSiderCollapsed ? 'Open menu' : 'Close menu'
  }
  if (props.lang === 'zh-CN') return props.isSiderCollapsed ? '展开侧边栏' : '收起侧边栏'
  return props.isSiderCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
})

const siderIcon = computed(() => {
  if (props.isMobile) return props.isSiderCollapsed ? '☰' : '✕'
  return props.isSiderCollapsed ? '»' : '«'
})

const handleLangChange = (v: DemoLang) => {
  emit('update:lang', v)
}
</script>

<template>
  <header
          class="fixed top-0 left-0 right-0 z-40 h-14 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
    <div class="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
      <div class="min-w-0 flex items-baseline gap-3">
        <Button type="button"
                variant="outline"
                size="sm"
                :aria-label="siderLabel"
                class="size-8 p-0 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900"
                @click="emit('toggle-sider')">
          <span class="text-sm leading-none">{{ siderIcon }}</span>
        </Button>
        <router-link to="/"
                     :aria-label="title"
                     class="text-base sm:text-lg font-semibold text-gray-900 truncate dark:text-gray-100 hover:text-[var(--tiger-primary,#2563eb)]">
          {{ title }}
        </router-link>
        <div v-if="props.rightHint"
             class="text-xs text-gray-500 truncate dark:text-gray-400">
          {{ props.rightHint }}
        </div>
      </div>

      <div class="flex items-center gap-3">
        <LanguageSwitch :model-value="props.lang"
                        @update:model-value="handleLangChange" />
        <ThemeSwitch :lang="props.lang" />
      </div>
    </div>
  </header>
</template>
