<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { DEMO_NAV_GROUPS, type DemoLang } from '@demo-shared/app-config'
import { Collapse, CollapsePanel } from '@expcat/tigercat-vue'
import {
  getStoredCollapsedNavGroups,
  setStoredCollapsedNavGroups
} from '@demo-shared/prefs'

const props = defineProps<{ lang: DemoLang; isSiderCollapsed: boolean; isMobile: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const route = useRoute()
const collapsedGroups = ref<Record<string, boolean>>(getStoredCollapsedNavGroups())

const isActive = (targetPath: string) => {
  if (targetPath === '/') return route.path === '/'
  return route.path === targetPath
}

const activeGroupKeys = computed(() =>
  DEMO_NAV_GROUPS.filter((group) => !collapsedGroups.value[group.key]).map((group) => group.key)
)

const handleCollapseChange = (
  next: string | number | (string | number)[] | undefined
) => {
  const nextKeys = Array.isArray(next) ? next : next !== undefined ? [next] : []

  const nextState: Record<string, boolean> = { ...collapsedGroups.value }
  DEMO_NAV_GROUPS.forEach((group) => {
    nextState[group.key] = !nextKeys.includes(group.key)
  })
  collapsedGroups.value = nextState
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
  <!-- Mobile overlay mode -->
  <Teleport to="body" v-if="props.isMobile">
    <Transition name="sider-overlay">
      <div v-if="!props.isSiderCollapsed"
           class="fixed inset-0 z-40"
           @keydown.escape="emit('close')">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/30 transition-opacity"
             @click="emit('close')" />
        <!-- Sidebar panel -->
        <aside class="absolute left-0 top-14 bottom-0 w-56 bg-white border-r border-gray-200 dark:bg-gray-950 dark:border-gray-800 shadow-xl overflow-hidden">
          <div class="h-full overflow-y-auto overflow-x-hidden demo-scrollbar py-4 px-3">
            <div class="mt-4">
              <Collapse :bordered="false"
                        ghost
                        expand-icon-position="end"
                        :activeKey="activeGroupKeys"
                        class="space-y-2"
                        @change="handleCollapseChange">
                <CollapsePanel v-for="group in DEMO_NAV_GROUPS"
                               :key="group.key"
                               :panelKey="group.key"
                               :showArrow="true">
                  <template #header>
                    <div class="w-full flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 justify-between"
                         :title="group.label[props.lang]">
                      <span class="inline-flex items-center justify-center text-[10px] font-bold size-6 rounded-md bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                        {{ getAbbr(group.label[props.lang]) }}
                      </span>
                      <span class="min-w-0 flex-1 truncate text-left">{{ group.label[props.lang] }}</span>
                    </div>
                  </template>

                  <div class="mt-1 space-y-1">
                    <router-link v-for="item in group.items"
                                 :key="item.key"
                                 :to="item.path"
                                 :title="item.label[props.lang]"
                                 :class="[
                                  'flex items-center rounded-md py-2 text-sm transition-colors overflow-hidden gap-2 pr-3 pl-9',
                                  isActive(item.path)
                                    ? 'bg-(--tiger-outline-bg-hover,#eff6ff) text-(--tiger-primary,#2563eb) font-medium'
                                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900'
                                ]"
                                 @click="emit('close')">
                      <span :class="[
                        'inline-flex items-center justify-center text-[10px] font-semibold',
                        'rounded-md border border-gray-200 bg-transparent text-gray-700 dark:border-gray-800 dark:text-gray-200',
                        'size-6',
                        isActive(item.path) ? 'text-(--tiger-primary,#2563eb)' : ''
                      ]">
                        {{ getAbbr(item.label[props.lang]) }}
                      </span>
                      <span class="truncate">{{ item.label[props.lang] }}</span>
                    </router-link>
                  </div>
                </CollapsePanel>
              </Collapse>
            </div>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>

  <!-- Desktop mode -->
  <aside v-else
         :class="[
    'shrink-0 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950',
    'transition-[width] duration-300 ease-in-out',
    props.isSiderCollapsed ? 'w-20' : 'w-56'
  ]">
    <div :class="[
      'sticky top-0 h-full overflow-y-auto overflow-x-hidden demo-scrollbar py-4',
      'transition-[padding] duration-300 ease-in-out',
      props.isSiderCollapsed ? 'px-2' : 'px-3'
    ]">
      <div class="mt-4">
        <Collapse :bordered="false"
                  ghost
                  expand-icon-position="end"
                  :activeKey="activeGroupKeys"
                  class="space-y-2"
                  @change="handleCollapseChange">
          <CollapsePanel v-for="group in DEMO_NAV_GROUPS"
                         :key="group.key"
                         :panelKey="group.key"
                         :showArrow="!props.isSiderCollapsed">
            <template #header>
              <div :class="[
                'w-full flex items-center gap-2 text-xs font-semibold uppercase tracking-wide',
                'text-gray-500 dark:text-gray-400',
                props.isSiderCollapsed ? 'justify-center' : 'justify-between'
              ]"
                   :title="group.label[props.lang]">
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
              </div>
            </template>

            <div class="mt-1 space-y-1">
              <router-link v-for="item in group.items"
                           :key="item.key"
                           :to="item.path"
                           :title="item.label[props.lang]"
                           :class="[
                            'flex items-center rounded-md py-2 text-sm transition-colors overflow-hidden',
                            props.isSiderCollapsed ? 'justify-center px-2' : 'gap-2 pr-3 pl-9',
                            isActive(item.path)
                              ? 'bg-(--tiger-outline-bg-hover,#eff6ff) text-(--tiger-primary,#2563eb) font-medium'
                              : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900'
                          ]">
                <span :class="[
                  'inline-flex items-center justify-center text-[10px] font-semibold',
                  'rounded-md border border-gray-200 bg-transparent text-gray-700 dark:border-gray-800 dark:text-gray-200',
                  props.isSiderCollapsed ? 'size-7' : 'size-6',
                  isActive(item.path) ? 'text-(--tiger-primary,#2563eb)' : ''
                ]">
                  {{ getAbbr(item.label[props.lang]) }}
                </span>
                <span v-if="!props.isSiderCollapsed"
                      class="truncate">{{
                        item.label[props.lang]
                      }}</span>
              </router-link>
            </div>
          </CollapsePanel>
        </Collapse>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sider-overlay-enter-active,
.sider-overlay-leave-active {
  transition: opacity 0.3s ease;
}
.sider-overlay-enter-active aside,
.sider-overlay-leave-active aside {
  transition: transform 0.3s ease;
}
.sider-overlay-enter-from,
.sider-overlay-leave-to {
  opacity: 0;
}
.sider-overlay-enter-from aside,
.sider-overlay-leave-to aside {
  transform: translateX(-100%);
}
</style>
