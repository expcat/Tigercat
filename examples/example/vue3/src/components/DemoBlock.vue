<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { Tabs, TabPane, Code } from '@expcat/tigercat-vue'
import { copyTextToClipboard } from '@expcat/tigercat-core'

const props = defineProps<{
    title: string
    description?: string
    code: string
}>()

const activeKey = ref('preview')
const copied = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | null = null

const handleCopy = async () => {
    const ok = await copyTextToClipboard(props.code)
    if (!ok) return
    copied.value = true
    if (resetTimer) clearTimeout(resetTimer)
    resetTimer = setTimeout(() => {
        copied.value = false
        resetTimer = null
    }, 1600)
}

onBeforeUnmount(() => {
    if (resetTimer) clearTimeout(resetTimer)
})

const panelBaseClasses =
    'rounded-b-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/40'
const previewPanelClasses = `p-6 ${panelBaseClasses}`
const codePanelClasses = `relative p-4 ${panelBaseClasses}`
const exampleBoxClasses =
    'rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900'
const copyButtonClasses =
    'absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white/90 px-2 py-1 text-xs text-gray-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-100'
</script>

<template>
    <section class="mb-12">
        <div class="mb-4">
            <h2 class="text-2xl font-bold mb-2">{{ props.title }}</h2>
            <p v-if="props.description" class="text-gray-600">
                {{ props.description }}
            </p>
        </div>

        <div class="rounded-lg">
            <Tabs v-model:activeKey="activeKey" type="card">
                <TabPane tabKey="preview" label="示例" />
                <TabPane tabKey="code" label="代码" />
                <TabPane tabKey="mixed" label="混合" />
            </Tabs>
            <div v-if="activeKey === 'preview'" :class="previewPanelClasses">
                <slot />
            </div>
            <div v-else-if="activeKey === 'code'" :class="codePanelClasses">
                <button type="button"
                        :class="copyButtonClasses"
                        :aria-label="copied ? '已复制' : '复制代码'"
                        @click="handleCopy">
                    <span aria-hidden="true">{{ copied ? '✓' : '⧉' }}</span>
                    <span>{{ copied ? '已复制' : '复制' }}</span>
                </button>
                <Code :code="props.code" />
            </div>
            <div v-else :class="previewPanelClasses">
                <div class="grid gap-4 sm:grid-cols-2">
                    <div class="w-full">
                        <div class="text-xs text-gray-500 mb-2">示例</div>
                        <div :class="exampleBoxClasses">
                            <slot />
                        </div>
                    </div>
                    <div class="w-full">
                        <div class="text-xs text-gray-500 mb-2">代码</div>
                        <div class="relative">
                            <button type="button"
                                    :class="copyButtonClasses"
                                    :aria-label="copied ? '已复制' : '复制代码'"
                                    @click="handleCopy">
                                <span aria-hidden="true">{{ copied ? '✓' : '⧉' }}</span>
                                <span>{{ copied ? '已复制' : '复制' }}</span>
                            </button>
                            <Code :code="props.code" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
