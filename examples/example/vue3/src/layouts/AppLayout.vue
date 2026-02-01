<script setup lang="ts">
import { computed, nextTick, onMounted, provide, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { DemoLang } from '@demo-shared/app-config'
import { getDemoTigerLocale } from '@demo-shared/tiger-locale'
import { Anchor, AnchorLink, Breadcrumb, BreadcrumbItem, ConfigProvider } from '@expcat/tigercat-vue'
import { getStoredLang, getStoredSiderCollapsed, setStoredLang, setStoredSiderCollapsed } from '@demo-shared/prefs'
import AppHeader from '../components/AppHeader.vue'
import AppSider from '../components/AppSider.vue'

interface DemoSection {
  id: string
  label: string
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const route = useRoute()
const pageRootRef = ref<HTMLElement | null>(null)
const mainScrollRef = ref<HTMLElement | null>(null)
const sections = ref<DemoSection[]>([])
const pageTitle = ref('')
const lang = ref<DemoLang>(getStoredLang())
const isSiderCollapsed = ref<boolean>(getStoredSiderCollapsed())

provide('demo-lang', lang)

const isHome = computed(() => route.path === '/')

const tigerLocale = computed(() => getDemoTigerLocale(lang.value))

const homeLabel = computed(() => (lang.value === 'zh-CN' ? '首页' : 'Home'))

const headerTitle = computed(() => {
  if (pageTitle.value) return pageTitle.value
  const lastSegment = route.path.split('/').filter(Boolean).pop()
  return lastSegment ?? ''
})

const handleLangChange = (v: DemoLang) => {
  lang.value = v
}

const toggleSider = () => {
  isSiderCollapsed.value = !isSiderCollapsed.value
}

const getMainContainer = () => mainScrollRef.value || window

const handleAnchorClick = (_event: Event, href: string) => {
  try {
    window.history.replaceState(null, '', href)
  } catch {
    // ignore
  }
}

watch(
  () => lang.value,
  (v) => {
    setStoredLang(v)
  },
  { immediate: true }
)

watch(
  () => isSiderCollapsed.value,
  (v) => {
    setStoredSiderCollapsed(v)
  },
  { immediate: true }
)

async function collectSections() {
  await nextTick()
  const root = pageRootRef.value
  if (!root) return

  const h1 = root.querySelector('h1')
  pageTitle.value = (h1?.textContent ?? '').trim()

  const headings = Array.from(root.querySelectorAll('h2'))
    .map((el) => el as HTMLHeadingElement)
    .filter((el) => el.textContent && el.textContent.trim().length > 0)

  const usedIds = new Set<string>()
  const nextSections: DemoSection[] = []

  for (const h2 of headings) {
    const label = (h2.textContent ?? '').trim()
    let id = h2.id?.trim()
    if (!id) id = slugify(label)
    if (!id) continue

    let uniqueId = id
    let counter = 2
    while (usedIds.has(uniqueId) || document.getElementById(uniqueId)) {
      uniqueId = `${id}-${counter}`
      counter += 1
    }

    usedIds.add(uniqueId)
    h2.id = uniqueId
    h2.setAttribute('data-demo-anchor', 'true')

    nextSections.push({ id: uniqueId, label })
  }

  sections.value = nextSections
}

onMounted(() => {
  collectSections()
})

watch(
  () => route.path,
  () => {
    collectSections()
  }
)
</script>

<template>
  <ConfigProvider :locale="tigerLocale">
    <div class="h-screen overflow-hidden box-border bg-gray-50 dark:bg-gray-950 pt-14">
      <AppHeader :lang="lang"
                 :is-sider-collapsed="isSiderCollapsed"
                 right-hint="Vue 3"
                 @update:lang="handleLangChange"
                 @toggle-sider="toggleSider" />

      <div class="flex h-full">
        <AppSider :lang="lang"
                  :is-sider-collapsed="isSiderCollapsed" />

        <main class="flex-1 min-w-0 h-full overflow-hidden">
          <div ref="mainScrollRef"
               class="h-full overflow-y-auto">
            <div v-if="!isHome && (headerTitle || sections.length > 0)"
                 class="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
              <div class="px-6 py-3">
                <div class="flex items-center justify-between gap-4">
                  <div class="min-w-0 text-sm font-semibold text-gray-900 truncate dark:text-gray-100">
                    <Breadcrumb>
                      <BreadcrumbItem href="/">{{ homeLabel }}</BreadcrumbItem>
                      <BreadcrumbItem current>{{ headerTitle }}</BreadcrumbItem>
                      <template #extra>
                        <Anchor v-if="sections.length > 0"
                                :affix="false"
                                direction="horizontal"
                                :getContainer="getMainContainer"
                                class="flex items-center justify-end"
                                @click="handleAnchorClick">
                          <AnchorLink v-for="s in sections"
                                      :key="s.id"
                                      :href="`#${s.id}`"
                                      :title="s.label"
                                      class="text-sm px-2 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800" />
                        </Anchor>
                      </template>
                    </Breadcrumb>
                  </div>
                </div>
              </div>
            </div>

            <div ref="pageRootRef"
                 class="px-6 py-6">
              <router-view />
            </div>
          </div>
        </main>
      </div>
    </div>
  </ConfigProvider>
</template>
