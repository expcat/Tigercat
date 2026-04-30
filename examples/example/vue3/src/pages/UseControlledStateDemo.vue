<script setup lang="ts">
import { Alert, Card } from '@expcat/tigercat-vue'
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">useControlledState 受控/非受控</h1>
      <p class="text-gray-600">该 Hook 仅在 React 版本中提供，Vue 版本请直接使用 <code>v-model</code>。</p>
    </div>

    <Alert type="info"
           message="为什么 Vue 不需要？"
           description="Vue 的 v-model 已经原生支持「受控 + 默认值」语义；通过 props 与 emit('update:xxx') 即可在父子组件间双向同步，无需额外封装 Hook。" />

    <Card title="Vue 等价写法"
          class="mt-6">
      <pre
        class="text-sm overflow-x-auto bg-gray-50 p-4 rounded"><code>// 父组件
&lt;Counter v-model:value="count" /&gt;

// 子组件 props + emits
const props = defineProps&lt;{ value?: number }&gt;()
const emit = defineEmits&lt;{ (e: 'update:value', v: number): void }&gt;()

const inner = ref(props.value ?? 0)
const value = computed(() =&gt; props.value ?? inner.value)
function update(v: number) {
  if (props.value === undefined) inner.value = v
  emit('update:value', v)
}</code></pre>
    </Card>
  </div>
</template>
