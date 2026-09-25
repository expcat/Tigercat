<script setup lang="ts">
import { Breadcrumb } from '@expcat/tigercat-vue/Breadcrumb'
import { BreadcrumbItem } from '@expcat/tigercat-vue/BreadcrumbItem'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { ScrollSpy } from '@expcat/tigercat-vue/ScrollSpy'
import { computed, nextTick, onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { overlayZIndexClass, type ThemePresetName } from '@expcat/tigercat-core'
import type { DemoLang } from '@demo-shared/app-config'
import { demoChrome } from '@demo-shared/chrome'
import { collectDemoSections, sameDemoSections } from '@demo-shared/demo-sections'
import { getDemoTigerLocale } from '@demo-shared/tiger-locale'
import {
  getStoredColorScheme,
  getStoredLang,
  getStoredSiderCollapsed,
  getStoredTheme,
  setStoredDarkMode,
  setStoredLang,
  setStoredSiderCollapsed,
  setStoredTheme
} from '@demo-shared/prefs'
import AppHeader from '../components/AppHeader.vue'
import AppSider from '../components/AppSider.vue'
import A11yDebugPanel from '../components/A11yDebugPanel.vue'

const isDev = import.meta.env.DEV

const route = useRoute()
const pageRootRef = ref<HTMLElement | null>(null)
const mainScrollRef = ref<HTMLElement | null>(null)
const stickyRef = ref<HTMLElement | null>(null)
const sections = ref<ReturnType<typeof collectDemoSections>>([])
const anchorOffset = ref(0)
const pageTitle = ref('')
const lang = ref<DemoLang>(getStoredLang())
const theme = ref(getStoredTheme())
const colorScheme = ref(getStoredColorScheme())
const isSiderCollapsed = ref<boolean>(getStoredSiderCollapsed())

provide('demo-lang', lang)

const isMobile = ref(false)
const isCompactHeader = ref(false)
let mqlCleanup: (() => void) | null = null

function setupMobileDetection() {
  const mql = window.matchMedia('(max-width: 767px)')
  const compactMql = window.matchMedia('(max-width: 639px)')
  const handler = (e: MediaQueryListEvent | MediaQueryList) => {
    isMobile.value = e.matches
    if (e.matches) isSiderCollapsed.value = true
  }
  const compactHandler = (e: MediaQueryListEvent | MediaQueryList) => {
    isCompactHeader.value = e.matches
  }
  handler(mql)
  compactHandler(compactMql)
  mql.addEventListener('change', handler as (e: MediaQueryListEvent) => void)
  compactMql.addEventListener('change', compactHandler as (e: MediaQueryListEvent) => void)
  mqlCleanup = () => {
    mql.removeEventListener('change', handler as (e: MediaQueryListEvent) => void)
    compactMql.removeEventListener('change', compactHandler as (e: MediaQueryListEvent) => void)
  }
}

const isHome = computed(() => route.path === '/')

const tigerLocale = computed(() => getDemoTigerLocale(lang.value))

const homeLabel = computed(() => demoChrome(lang.value).home)

const headerTitle = computed(() => {
  if (pageTitle.value) return pageTitle.value
  const lastSegment = route.path.split('/').filter(Boolean).pop()
  return lastSegment ?? ''
})

const handleLangChange = (v: DemoLang) => {
  lang.value = v
}

const handleThemeChange = (v: ThemePresetName) => {
  theme.value = v
}

const handleDarkChange = (enabled: boolean) => {
  colorScheme.value = enabled ? 'dark' : 'light'
}

const toggleSider = () => {
  isSiderCollapsed.value = !isSiderCollapsed.value
}

const closeSider = () => {
  isSiderCollapsed.value = true
}

const getMainContainer = () => mainScrollRef.value || window

const sectionItems = computed(() =>
  sections.value.map((section) => ({
    key: section.id,
    href: `#${section.id}`,
    label: section.label
  }))
)

watch(
  () => lang.value,
  (v) => {
    setStoredLang(v)
  },
  { immediate: true }
)

watch(
  () => theme.value,
  (v) => {
    setStoredTheme(v)
  },
  { immediate: true }
)

watch(
  () => colorScheme.value,
  (v) => {
    setStoredDarkMode(v === 'dark')
  },
  { immediate: true }
)

watch(
  () => isSiderCollapsed.value,
  (v) => {
    if (!isMobile.value) setStoredSiderCollapsed(v)
  },
  { immediate: true }
)

async function collectSections() {
  await nextTick()
  const root = pageRootRef.value
  if (!root) return

  const h1 = root.querySelector('h1')
  pageTitle.value = (h1?.textContent ?? '').trim()

  const nextSections = collectDemoSections(root)
  if (!sameDemoSections(sections.value, nextSections)) sections.value = nextSections
}

let sectionObserver: MutationObserver | null = null
let sectionDebounceTimer: ReturnType<typeof setTimeout> | null = null

function setupSectionObserver() {
  sectionObserver?.disconnect()
  const root = pageRootRef.value
  if (!root) return
  sectionObserver = new MutationObserver(() => {
    if (sectionDebounceTimer) clearTimeout(sectionDebounceTimer)
    sectionDebounceTimer = setTimeout(() => {
      collectSections()
      sectionDebounceTimer = null
    }, 50)
  })
  sectionObserver.observe(root, { childList: true, subtree: true })
}

let stickyResizeObserver: ResizeObserver | null = null

watch(stickyRef, (el) => {
  stickyResizeObserver?.disconnect()
  stickyResizeObserver = null
  if (!el || typeof ResizeObserver === 'undefined') {
    anchorOffset.value = 0
    return
  }
  const measure = () => {
    anchorOffset.value = Math.ceil(el.getBoundingClientRect().height)
  }
  stickyResizeObserver = new ResizeObserver(measure)
  stickyResizeObserver.observe(el)
  measure()
})

onMounted(() => {
  setupMobileDetection()
  collectSections()
  setupSectionObserver()
})

onUnmounted(() => {
  mqlCleanup?.()
  sectionObserver?.disconnect()
  stickyResizeObserver?.disconnect()
  if (sectionDebounceTimer) clearTimeout(sectionDebounceTimer)
})

watch(
  () => route.path,
  () => {
    if (mainScrollRef.value) mainScrollRef.value.scrollTop = 0
    if (isMobile.value) isSiderCollapsed.value = true
    sections.value = []
    nextTick(() => {
      collectSections()
      setupSectionObserver()
    })
  }
)
</script>

<template>
  <ConfigProvider :locale="tigerLocale" :theme="theme" :color-scheme="colorScheme">
    <div class="h-screen overflow-hidden box-border bg-gray-50 dark:bg-gray-950 pt-14">
      <AppHeader
        :lang="lang"
        :theme="theme"
        :dark="colorScheme === 'dark'"
        :is-sider-collapsed="isSiderCollapsed"
        :is-mobile="isMobile"
        :is-compact-header="isCompactHeader"
        right-hint="Vue 3"
        @update:lang="handleLangChange"
        @update:theme="handleThemeChange"
        @update:dark="handleDarkChange"
        @toggle-sider="toggleSider" />

      <div class="flex h-full">
        <AppSider
          :lang="lang"
          :is-sider-collapsed="isSiderCollapsed"
          :is-mobile="isMobile"
          @close="closeSider" />

        <main class="flex-1 min-w-0 h-full overflow-hidden">
          <div
            ref="mainScrollRef"
            class="h-full overflow-y-auto overflow-x-hidden"
            :style="{ '--demo-anchor-offset': `${anchorOffset + 8}px` }">
            <div
              v-if="!isHome && (headerTitle || sections.length > 0)"
              ref="stickyRef"
              :class="[
                'sticky top-0 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80',
                overlayZIndexClass.viewport
              ]">
              <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 px-6 py-2">
                <Breadcrumb class="w-auto shrink-0">
                  <BreadcrumbItem href="/">{{ homeLabel }}</BreadcrumbItem>
                  <BreadcrumbItem current>{{ headerTitle }}</BreadcrumbItem>
                </Breadcrumb>
                <ScrollSpy
                  v-if="sectionItems.length > 0"
                  :items="sectionItems"
                  orientation="horizontal"
                  :target-offset="anchorOffset"
                  :get-container="getMainContainer"
                  class="min-w-0 justify-self-end [&_ul]:max-w-full [&_ul]:flex-nowrap [&_ul]:overflow-x-auto [&_li]:shrink-0" />
              </div>
            </div>

            <div ref="pageRootRef" class="px-6 py-6">
              <router-view />
            </div>
          </div>
        </main>
      </div>
      <A11yDebugPanel v-if="isDev" :lang="lang" />
    </div>
  </ConfigProvider>
</template>
