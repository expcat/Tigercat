<script setup lang="ts">
import { Row } from '@expcat/tigercat-vue/Row'
import { Col } from '@expcat/tigercat-vue/Col'
import { Container } from '@expcat/tigercat-vue/Container'
import { Space } from '@expcat/tigercat-vue/Space'

const justifyValues = [
  'start',
  'center',
  'end',
  'space-between',
  'space-around',
  'space-evenly'
] as const
const alignValues = ['top', 'middle', 'bottom', 'stretch'] as const
</script>

<template>
  <div class="min-w-0">
    <div class="p-6 bg-gray-50 rounded-lg">
      <Container>
        <p class="mb-3 text-sm text-gray-600 dark:text-gray-300">
          窄屏下可在下方区域横向滚动，查看不换行的后续栅格。
        </p>
        <div class="overflow-x-auto overflow-y-hidden px-2">
          <Row :gutter="16" :wrap="false" class="min-w-[720px]">
            <Col :span="6">
              <div class="bg-emerald-600 text-white p-4 rounded text-center">6</div>
            </Col>
            <Col :span="6">
              <div class="bg-emerald-500 text-white p-4 rounded text-center">6</div>
            </Col>
            <Col :span="6">
              <div class="bg-emerald-400 text-white p-4 rounded text-center">6</div>
            </Col>
            <Col :span="6">
              <div class="bg-emerald-300 text-white p-4 rounded text-center">6</div>
            </Col>
            <Col :span="6">
              <div class="bg-emerald-600 text-white p-4 rounded text-center">6</div>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  </div>
</template>
