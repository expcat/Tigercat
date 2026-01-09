<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

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
const sections = ref<DemoSection[]>([])
const pageTitle = ref('')

const isHome = computed(() => route.path === '/')

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

const headerTitle = computed(() => {
  if (pageTitle.value) return pageTitle.value
  const lastSegment = route.path.split('/').filter(Boolean).pop()
  return lastSegment ?? ''
})

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
  <div class="min-h-screen">
    <div
      v-if="!isHome && (headerTitle || sections.length > 0)"
      class="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur"
    >
      <div class="max-w-5xl mx-auto px-8 py-3">
        <div class="flex items-center justify-between gap-4">
          <div class="min-w-0 text-sm font-semibold text-gray-900 truncate">
            {{ headerTitle }}
          </div>
          <div v-if="sections.length > 0" class="flex items-center gap-2 flex-wrap justify-end">
            <a
              v-for="s in sections"
              :key="s.id"
              :href="`#${s.id}`"
              class="text-sm px-2 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {{ s.label }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <div ref="pageRootRef">
      <router-view />
    </div>

    <router-link
      v-if="!isHome"
      to="/"
      aria-label="返回首页"
      class="fixed right-6 bottom-6 z-30 inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-4 py-2 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      返回首页
    </router-link>
  </div>
</template>
