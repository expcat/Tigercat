<script setup lang="ts">
import { ref } from 'vue'
import { Tabs, TabPane, Code } from '@expcat/tigercat-vue'

const props = defineProps<{
    title: string
    description?: string
    code: string
}>()

const activeKey = ref('preview')

const panelBaseClasses =
    'rounded-b-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/40'
const previewPanelClasses = `p-6 ${panelBaseClasses}`
const codePanelClasses = `p-4 ${panelBaseClasses}`
const exampleBoxClasses =
    'rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900'
</script>

<template>
    <section class="mb-12">
        <div class="mb-4">
            <h2 class="text-2xl font-bold mb-2">{{ props.title }}</h2>
            <p v-if="props.description"
               class="text-gray-600">
                {{ props.description }}
            </p>
        </div>

        <div class="rounded-lg">
            <Tabs v-model:activeKey="activeKey"
                  type="card">
                <TabPane tabKey="preview"
                         label="示例">
                    <div :class="previewPanelClasses">
                        <slot />
                    </div>
                </TabPane>
                <TabPane tabKey="code"
                         label="代码">
                    <div :class="codePanelClasses">
                        <Code :code="props.code" />
                    </div>
                </TabPane>
                <TabPane tabKey="mixed"
                         label="混合">
                    <div :class="previewPanelClasses">
                        <div class="grid gap-4 sm:grid-cols-2">
                            <div class="w-full">
                                <div class="text-xs text-gray-500 mb-2">示例</div>
                                <div :class="exampleBoxClasses">
                                    <slot />
                                </div>
                            </div>
                            <div class="w-full">
                                <div class="text-xs text-gray-500 mb-2">代码</div>
                                <Code :code="props.code" />
                            </div>
                        </div>
                    </div>
                </TabPane>
            </Tabs>
        </div>
    </section>
</template>