<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue'
import { Alert } from '@expcat/tigercat-vue/Alert'
import { Button } from '@expcat/tigercat-vue/Button'
import { Card } from '@expcat/tigercat-vue/Card'

const Counter = defineComponent({
  name: 'DemoCounter',
  props: {
    modelValue: { type: Number, default: undefined },
    defaultValue: { type: Number, default: 0 }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const inner = ref(props.defaultValue)
    const isControlled = computed(() => props.modelValue !== undefined)
    const count = computed(() => (isControlled.value ? (props.modelValue as number) : inner.value))

    function commit(next: number) {
      if (!isControlled.value) inner.value = next
      emit('update:modelValue', next)
    }

    return () =>
      h('div', { class: 'flex items-center gap-3' }, [
        h(Button, { onClick: () => commit(count.value - 1) }, () => '-'),
        h('span', { class: 'w-8 text-center font-medium' }, String(count.value)),
        h(Button, { onClick: () => commit(count.value + 1) }, () => '+')
      ])
  }
})

const controlledCount = ref(5)
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">useControlledState</h1>
      <p class="text-gray-600 dark:text-gray-400">
        React 独有 hook。Vue 没有导出 composable，但受控哨兵同一句：
        <code>undefined</code> 非受控，<code>null</code> 是合法空值。
      </p>
    </div>

    <Alert
      type="info"
      message="Vue 不导出这份 hook"
      description="v-model 只是语法糖。省略 modelValue 才是非受控；把默认写成 null 或用 ?? 会把合法空值当成缺省。下面两块 Counter 用同一套哨兵。" />

    <Card title="受控" class="mt-6">
      <Counter v-model="controlledCount" />
    </Card>

    <Card title="非受控" class="mt-6">
      <Counter :default-value="0" />
    </Card>

    <Card title="哨兵" class="mt-6">
      <pre
        class="text-sm overflow-x-auto bg-gray-50 p-4 rounded"><code>const isControlled = computed(() => props.modelValue !== undefined)
const inner = ref(props.defaultValue ?? 0)
const value = computed(() =>
  isControlled.value ? props.modelValue : inner.value
)
function commit(next: number) {
  if (!isControlled.value) inner.value = next
  emit('update:modelValue', next)
}</code></pre>
    </Card>
  </div>
</template>
