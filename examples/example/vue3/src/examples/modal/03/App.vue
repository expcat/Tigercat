<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Input } from '@expcat/tigercat-vue/Input'
import { Modal } from '@expcat/tigercat-vue/Modal'

const open = ref(false)
const sheetOpen = ref(false)
const bareOpen = ref(false)
const closedCount = ref(0)
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-2">
      <Button @click="open = true">默认页脚</Button>
      <Button @click="sheetOpen = true">底栏表单</Button>
      <Button @click="bareOpen = true">无标题无遮罩</Button>
    </div>
    <p class="text-sm text-gray-500" role="status">已完成关闭：{{ closedCount }} 次</p>
    <Modal
      v-model:open="open"
      title="临时表单"
      destroy-on-close
      show-default-footer
      draggable
      @after-close="closedCount += 1">
      <label class="space-y-1 text-sm">
        <span>备注</span>
        <Input placeholder="关闭后销毁此内容" />
      </label>
    </Modal>
    <Modal v-model:open="sheetOpen" title="可滚动底栏" mobile-sheet show-default-footer>
      <div class="space-y-3">
        <p v-for="index in 12" :key="index">滚动条目 {{ index }}。下滑关闭只在顶部或标题栏生效。</p>
      </div>
    </Modal>
    <Modal v-model:open="bareOpen" :mask="false">
      <p>没有可见标题时 dialog 仍有 locale 名。mask=false 时空区点得透。</p>
    </Modal>
  </div>
</template>
