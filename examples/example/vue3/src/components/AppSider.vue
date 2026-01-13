<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { DEMO_NAV_GROUPS, type DemoLang, type DemoNavGroup } from '@demo-shared/app-config'

const props = defineProps<{ lang: DemoLang }>()

const route = useRoute()
const collapsedGroups = ref<Record<string, boolean>>({})

const groups = computed(() => DEMO_NAV_GROUPS)

const isActive = (targetPath: string) => {
    if (targetPath === '/') return route.path === '/'
    return route.path === targetPath
}

const toggleGroup = (group: DemoNavGroup) => {
    collapsedGroups.value = { ...collapsedGroups.value, [group.key]: !collapsedGroups.value[group.key] }
}
</script>

<template>
    <aside class="w-72 shrink-0 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div class="sticky top-14 h-[calc(100vh-56px)] overflow-y-auto px-3 py-4">
            <router-link to="/" :class="[
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive('/')
                    ? 'bg-[var(--tiger-outline-bg-hover,#eff6ff)] text-[var(--tiger-primary,#2563eb)]'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900',
            ]">
                {{ props.lang === 'zh-CN' ? '首页' : 'Home' }}
            </router-link>

            <div class="mt-4 space-y-3">
                <div v-for="group in groups" :key="group.key">
                    <button type="button"
                        class="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        :aria-expanded="!collapsedGroups[group.key]" @click="toggleGroup(group)">
                        <span class="truncate">{{ group.label[props.lang] }}</span>
                        <span class="text-xs">{{ collapsedGroups[group.key] ? '+' : '–' }}</span>
                    </button>

                    <div v-if="!collapsedGroups[group.key]" class="mt-1 space-y-1">
                        <router-link v-for="item in group.items" :key="item.key" :to="item.path" :class="[
                            'block rounded-md px-3 py-2 text-sm transition-colors',
                            isActive(item.path)
                                ? 'bg-[var(--tiger-outline-bg-hover,#eff6ff)] text-[var(--tiger-primary,#2563eb)] font-medium'
                                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900',
                        ]">
                            {{ item.label[props.lang] }}
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </aside>
</template>
