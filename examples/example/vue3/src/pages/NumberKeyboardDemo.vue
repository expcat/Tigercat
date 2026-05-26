<script setup lang="ts">
import { ref } from 'vue'
import { Input, NumberKeyboard } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const amount = ref('')
const phone = ref('')
const idCard = ref('')
const confirmed = ref('')

const amountSnippet = `const amount = ref('')

<Input v-model="amount" readonly prefix="¥" placeholder="输入金额" />
<NumberKeyboard
  v-model="amount"
  mode="amount"
  confirm-text="完成"
  delete-text="退格" />`

const phoneSnippet = `const phone = ref('')

<Input v-model="phone" readonly placeholder="手机号" />
<NumberKeyboard v-model="phone" mode="phone" />`

const idCardSnippet = `const idCard = ref('')

<Input v-model="idCard" readonly placeholder="身份证号" />
<NumberKeyboard v-model="idCard" mode="id-card" />`
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">NumberKeyboard 数字键盘</h1>
    <p class="text-gray-500 mb-8">移动端数字键盘，支持金额、手机号和身份证输入模式。</p>

    <DemoBlock
      title="金额输入"
      description="amount 模式支持小数点和默认两位小数"
      :code="amountSnippet">
      <div class="max-w-sm space-y-3">
        <Input v-model="amount" readonly prefix="¥" placeholder="输入金额" />
        <NumberKeyboard
          v-model="amount"
          mode="amount"
          confirm-text="完成"
          delete-text="退格"
          @confirm="(value: string) => (confirmed = value)" />
        <p class="text-sm text-gray-500">{{ confirmed ? `已确认：¥${confirmed}` : '未确认' }}</p>
      </div>
    </DemoBlock>

    <DemoBlock title="手机号输入" description="phone 模式默认限制 11 位数字" :code="phoneSnippet">
      <div class="max-w-sm space-y-3">
        <Input v-model="phone" readonly placeholder="手机号" />
        <NumberKeyboard v-model="phone" mode="phone" confirm-text="完成" />
      </div>
    </DemoBlock>

    <DemoBlock title="身份证输入" description="id-card 模式允许末位输入 X" :code="idCardSnippet">
      <div class="max-w-sm space-y-3">
        <Input v-model="idCard" readonly placeholder="身份证号" />
        <NumberKeyboard v-model="idCard" mode="id-card" confirm-text="完成" />
      </div>
    </DemoBlock>
  </div>
</template>
