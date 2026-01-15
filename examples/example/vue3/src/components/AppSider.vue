<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { DEMO_NAV_GROUPS, type DemoLang, type DemoNavGroup } from '@demo-shared/app-config'
import { Button } from '@expcat/tigercat-vue'
import {
  getStoredCollapsedNavGroups,
  setStoredCollapsedNavGroups
} from '@demo-shared/prefs'

const props = defineProps<{ lang: DemoLang; isSiderCollapsed: boolean }>()

const route = useRoute()
const collapsedGroups = ref<Record<string, boolean>>(getStoredCollapsedNavGroups())

const isActive = (targetPath: string) => {
  if (targetPath === '/') return route.path === '/'
  return route.path === targetPath
}

const toggleGroup = (group: DemoNavGroup) => {
  collapsedGroups.value = {
    ...collapsedGroups.value,
    [group.key]: !collapsedGroups.value[group.key]
  }
}

const getAbbr = (label: string) => {
  const trimmed = (label ?? '').trim()
  if (!trimmed) return '?'
  const first = Array.from(trimmed)[0]
  return first ? first.toUpperCase() : '?'
}

watch(
  () => collapsedGroups.value,
  (v) => setStoredCollapsedNavGroups(v),
  { deep: true }
)
</script>

<template>
  <aside :class="[
    'shrink-0 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950',
    'transition-[width] duration-300 ease-in-out',
    props.isSiderCollapsed ? 'w-16' : 'w-72'
  ]">
    <div :class="[
      'sticky top-0 h-full overflow-y-auto overflow-x-hidden demo-scrollbar py-4',
      'transition-[padding] duration-300 ease-in-out',
      props.isSiderCollapsed ? 'px-2' : 'px-3'
    ]">
      <div class="mt-4 space-y-3">
        <div v-for="group in DEMO_NAV_GROUPS"
             :key="group.key">
          <Button type="button"
                  variant="ghost"
                  size="sm"
                  :title="group.label[props.lang]"
                  :class="[
                    'w-full flex items-center gap-2 py-2 text-xs font-semibold uppercase tracking-wide',
                    'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                    props.isSiderCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                  ]"
                  :aria-expanded="!collapsedGroups[group.key]"
                  @click="toggleGroup(group)">
            <span :class="[
              'inline-flex items-center justify-center text-[10px] font-bold',
              props.isSiderCollapsed
                ? 'size-9 rounded-md bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200'
                : 'size-6 rounded-md bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200'
            ]">
              {{ getAbbr(group.label[props.lang]) }}
            </span>
            <span v-if="!props.isSiderCollapsed"
                  class="min-w-0 flex-1 truncate text-left">{{
                    group.label[props.lang]
                  }}</span>
            <span v-if="!props.isSiderCollapsed"
                  aria-hidden
                  :class="[
                    'shrink-0 transition-transform duration-200',
                    collapsedGroups[group.key] ? '-rotate-90' : 'rotate-0'
                  ]">▾</span>
          </Button>

          <div :class="[
            'grid transition-[grid-template-rows] duration-200 ease-out',
            collapsedGroups[group.key] ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
          ]">
            <div :class="['overflow-hidden', collapsedGroups[group.key] ? 'pointer-events-none' : '']">
              <div class="mt-1 space-y-1">
                <router-link v-for="item in group.items"
                             :key="item.key"
                             :to="item.path"
                             :title="item.label[props.lang]"
                             :class="[
                              'flex items-center rounded-md py-2 text-sm transition-colors overflow-hidden',
                              props.isSiderCollapsed ? 'justify-center px-2' : 'gap-2 pr-3 pl-9',
                              isActive(item.path)
                                ? 'bg-[var(--tiger-outline-bg-hover,#eff6ff)] text-[var(--tiger-primary,#2563eb)] font-medium'
                                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900'
                            ]">
                  <span :class="[
                    'inline-flex items-center justify-center text-[10px] font-semibold',
                    'rounded-md border border-gray-200 bg-transparent text-gray-700 dark:border-gray-800 dark:text-gray-200',
                    props.isSiderCollapsed ? 'size-7' : 'size-6',
                    isActive(item.path) ? 'text-[var(--tiger-primary,#2563eb)]' : ''
                  ]">
                    {{ getAbbr(item.label[props.lang]) }}
                  </span>
                  <span v-if="!props.isSiderCollapsed"
                        class="truncate">{{
                          item.label[props.lang]
                        }}</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
